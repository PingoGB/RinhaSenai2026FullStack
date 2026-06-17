import crypto from 'node:crypto'
import prisma from '../db.js'

function validateBody(body) {
  if (!body) return false
  const { card_number, holder_name, expiration, cvv, amount_cents, installments = 1, description } = body
  if (!card_number || !/^\d{16}$/.test(card_number)) return false
  if (!cvv || !/^\d{3,4}$/.test(cvv)) return false
  if (!holder_name || holder_name.trim() === '' || holder_name.length > 50 || /<[^>]*>/.test(holder_name)) return false
  if (!expiration || !/^\d{2}\/\d{2}$/.test(expiration)) return false
  
  const [m, y] = expiration.split('/')
  const month = parseInt(m, 10)
  const year = parseInt(`20${y}`, 10)
  if (month < 1 || month > 12) return false
  const now = new Date()
  const expDate = new Date(year, month, 1)
  if (expDate < now) return false // expired

  if (typeof amount_cents !== 'number' || amount_cents <= 0 || amount_cents > 1000000) return false
  if (typeof installments !== 'number' || installments < 1 || installments > 12) return false
  if (!description || description.length > 100) return false

  return true
}

export default async function (fastify) {
  fastify.get('/health', async () => ({ status: 'ok' }))

  fastify.get('/balance', async (req, reply) => {
    const totals = await prisma.transaction.groupBy({
      by: ['status'],
      _count: true,
      _sum: { netAmount: true }
    })
    
    let balance_cents = 0
    let total_approved = 0
    let total_declined = 0
    let total_refunded = 0

    for (const t of totals) {
      if (t.status === 'approved') {
        total_approved = t._count
        balance_cents += t._sum.netAmount || 0
      } else if (t.status === 'declined') {
        total_declined = t._count
      } else if (t.status === 'refunded') {
        total_refunded = t._count
      }
    }

    return { balance_cents, total_approved, total_declined, total_refunded }
  })

  fastify.post('/transactions', async (req, reply) => {
    const payloadStr = JSON.stringify(req.body)
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex')

    if (!validateBody(req.body)) {
      return reply.code(422).send({ error: 'Unprocessable Entity' })
    }

    let { card_number, holder_name, expiration, cvv, amount_cents, installments = 1, description } = req.body
    
    let cardBrand = ''
    let rate = 0
    if (card_number.startsWith('4')) { cardBrand = 'visa'; rate = 0.025 }
    else if (card_number.startsWith('5')) { cardBrand = 'mastercard'; rate = 0.03 }
    else if (card_number.startsWith('3')) { cardBrand = 'amex'; rate = 0.035 }
    else if (card_number.startsWith('6')) { cardBrand = 'elo'; rate = 0.04 }
    else {
      return reply.code(422).send({ error: 'Bandeira desconhecida' })
    }

    let interestRate = 0
    if (installments >= 2 && installments <= 6) interestRate = 0.02
    else if (installments >= 7 && installments <= 12) interestRate = 0.04

    const total_with_interest = Math.round(amount_cents * Math.pow(1 + interestRate, installments))
    const installment_amount = Math.ceil(total_with_interest / installments)
    if (installment_amount < 1000) {
      return reply.code(422).send({ error: 'Parcela abaixo do minimo' })
    }

    const fee_cents = Math.round(total_with_interest * rate)
    const net_amount = total_with_interest - fee_cents
    const card_last4 = card_number.slice(-4)

    let status = 'approved'
    if (card_number.startsWith('9999')) {
      status = 'declined'
    } else {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const sumResult = await prisma.transaction.aggregate({
        _sum: { amountCents: true },
        where: { cardLast4: card_last4, status: 'approved', createdAt: { gte: todayStart } }
      })
      const currentDayTotal = sumResult._sum.amountCents || 0
      if (currentDayTotal + amount_cents > 500000) {
        status = 'declined'
      }
    }

    try {
      const transaction = await prisma.transaction.create({
        data: {
          status, cardLast4: card_last4, cardBrand, holderName: holder_name,
          amountCents: amount_cents, installments, installmentAmount: installment_amount,
          totalWithInterest: total_with_interest, feeCents: fee_cents,
          netAmount: net_amount, description, payloadHash
        }
      })
      return reply.code(201).send({
        id: transaction.id, status: transaction.status, card_last4: transaction.cardLast4,
        card_brand: transaction.cardBrand, holder_name: transaction.holderName,
        amount_cents: transaction.amountCents, installments: transaction.installments,
        installment_amount: transaction.installmentAmount, total_with_interest: transaction.totalWithInterest,
        fee_cents: transaction.feeCents, net_amount: transaction.netAmount,
        description: transaction.description, created_at: transaction.createdAt
      })
    } catch (err) {
      if (err.code === 'P2002') {
        const existing = await prisma.transaction.findUnique({ where: { payloadHash } })
        if (existing) {
          return reply.code(201).send({
            id: existing.id, status: existing.status, card_last4: existing.cardLast4,
            card_brand: existing.cardBrand, holder_name: existing.holderName,
            amount_cents: existing.amountCents, installments: existing.installments,
            installment_amount: existing.installmentAmount, total_with_interest: existing.totalWithInterest,
            fee_cents: existing.feeCents, net_amount: existing.netAmount,
            description: existing.description, created_at: existing.createdAt
          })
        }
      }
      return reply.code(500).send({ error: 'Internal error' })
    }
  })

  fastify.get('/transactions/:id', async (req, reply) => {
    const { id } = req.params
    const tx = await prisma.transaction.findUnique({ where: { id } })
    if (!tx) return reply.code(404).send({ error: 'Not found' })
    return {
      id: tx.id, status: tx.status, card_last4: tx.cardLast4,
      card_brand: tx.cardBrand, holder_name: tx.holderName,
      amount_cents: tx.amountCents, installments: tx.installments,
      installment_amount: tx.installmentAmount, total_with_interest: tx.totalWithInterest,
      fee_cents: tx.feeCents, net_amount: tx.netAmount,
      description: tx.description, created_at: tx.createdAt
    }
  })

  fastify.get('/transactions', async (req, reply) => {
    let { page = 1, limit = 10 } = req.query
    page = parseInt(page, 10)
    limit = parseInt(limit, 10)
    if (page < 1) page = 1
    if (limit < 1) limit = 10
    if (limit > 100) limit = 100

    const total = await prisma.transaction.count()
    const transactions = await prisma.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const data = transactions.map(tx => ({
      id: tx.id, status: tx.status, card_last4: tx.cardLast4,
      card_brand: tx.cardBrand, holder_name: tx.holderName,
      amount_cents: tx.amountCents, installments: tx.installments,
      installment_amount: tx.installmentAmount, total_with_interest: tx.totalWithInterest,
      fee_cents: tx.feeCents, net_amount: tx.netAmount,
      description: tx.description, created_at: tx.createdAt
    }))

    return {
      data,
      pagination: {
        page, limit, total, total_pages: Math.ceil(total / limit)
      }
    }
  })

  fastify.post('/transactions/:id/refund', async (req, reply) => {
    const { id } = req.params
    try {
      const tx = await prisma.transaction.findUnique({ where: { id } })
      if (!tx) return reply.code(404).send({ error: 'Not found' })
      if (tx.status !== 'approved') return reply.code(422).send({ error: 'Not approved' })

      const updated = await prisma.transaction.updateMany({
        where: { id, status: 'approved' },
        data: { status: 'refunded' }
      })

      if (updated.count === 0) {
        return reply.code(422).send({ error: 'Already refunded or not approved' })
      }

      return { status: 'refunded' }
    } catch (err) {
      return reply.code(500).send({ error: 'Internal error' })
    }
  })
}

