# Rinha FullStack SENAI 2026

Competicao de programacao onde times de alunos implementam um **gateway de pagamento fake** completo (backend + frontend) e competem por performance e corretude.

## Como funciona

1. Cada time copia o `template/` para `participants/<nome-do-time>/`
2. Implementa as regras de negocio no backend (o frontend ja vem pronto)
3. Abre um **Pull Request** com a solucao
4. O benchmark automatico roda e posta o resultado no PR
5. Ao mergear, o leaderboard e atualizado

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Fastify |
| Frontend | React + Vite |
| Banco | SQLite + Prisma |
| Porta | 3000 (unica) |

## Comandos

```bash
cd participants/<seu-time>
npm install        # instala back + front via workspaces
npm run build      # builda o React
npm start          # sobe tudo na porta 3000
```

## Benchmark

O bench automatico testa 3 categorias:

| Categoria | Pontos | O que testa |
|-----------|--------|-------------|
| Regras de negocio | 50 | Taxas, juros, limites, idempotencia, estorno |
| Frontend | 30 | Elementos CSS, formulario, historico, paginacao |
| Stress test | 20 | 200 txns concorrentes, throughput, latencia p95 |

### Metricas de performance

- **Throughput** (txn/s) com 20 workers concorrentes
- **Latencia** p50, p95, p99
- **Read/Write concorrente** (50 writes + 50 reads simultaneos)
- **Idempotencia** e **double refund** sob concorrencia

## Como participar

Leia o **[CONTRIBUTING.md](./CONTRIBUTING.md)** antes de comecar. La tem o passo a passo completo, boas praticas e o que **nao** fazer para evitar problemas.

## Regras

- JavaScript ou TypeScript (o time escolhe)
- Sem Docker
- Tudo roda em uma porta so (3000)
- O banco SQLite e criado automaticamente
- Alteracoes fora de `participants/` precisam de aprovacao do organizador

## Links

- [Como contribuir](./CONTRIBUTING.md)
- [Regras de negocio](./REGRA_DE_NEGOCIO.md)
- [Leaderboard](./LEADERBOARD.md)
