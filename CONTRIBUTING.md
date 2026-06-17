# Como contribuir

Guia para os times enviarem suas solucoes de forma organizada e sem conflitos.

## Passo a passo

### 1. Fork do repositorio

Faca um **fork** deste repo para sua conta pessoal no GitHub.

### 2. Clone o fork

```bash
git clone https://github.com/<seu-usuario>/RinhaSenai2026FullStack.git
cd RinhaSenai2026FullStack
```

### 3. Crie seu time

Copie o template para a pasta do seu time:

```bash
cp -r template/ participants/<nome-do-time>/
```

O nome do time deve ser **lowercase, sem espacos e sem acentos** (use hifens se precisar).

```
participants/turbo-coders/    # bom
participants/Turbo Coders/    # ruim
```

### 4. Preencha o info.json

Edite `participants/<seu-time>/info.json` com os dados reais:

```json
{
  "team": "turbo-coders",
  "members": [
    { "name": "Maria Silva", "github": "@mariasilva" },
    { "name": "Joao Santos", "github": "@joaosantos" }
  ]
}
```

### 5. Implemente a solucao

O unico lugar onde voce precisa mexer e dentro de `participants/<seu-time>/`. Foque no:

- `backend/src/routes/transactions.js` - toda a logica de negocio
- `backend/prisma/schema.prisma` - se precisar adicionar campos ou indices
- `frontend/src/` - componentes e paginas do React

### 6. Teste localmente

```bash
cd participants/<seu-time>
npm install
npm run build
npm start
# Acesse http://localhost:3000
```

### 7. Abra um Pull Request

Faca push para o seu fork e abra um PR para a branch `main` do repo original. O benchmark automatico vai rodar e postar o resultado no PR.

## Regras importantes

### So mexa na SUA pasta

Voce so deve alterar arquivos dentro de `participants/<seu-time>/`. Qualquer alteracao fora dessa pasta (template, tests, workflows, README, etc.) sera rejeitada.

```
participants/
  seu-time/     <-- pode mexer aqui
  outro-time/   <-- NAO TOQUE
template/       <-- NAO TOQUE
tests/          <-- NAO TOQUE
```

### NAO exclua ou altere o codigo de outro time

Isso e motivo de desclassificacao. Sempre confira o `git diff` antes de commitar para garantir que so os seus arquivos estao sendo alterados:

```bash
git diff --stat
# Deve mostrar APENAS arquivos dentro de participants/<seu-time>/
```

### Mantenha o fork atualizado

Antes de abrir o PR, sincronize com o repo original para evitar conflitos:

```bash
git remote add upstream https://github.com/fullzer4/RinhaSenai2026FullStack.git
git fetch upstream
git merge upstream/main
```

Se der conflito, resolva **sem alterar nada fora da sua pasta**.

## Boas praticas

### Git

- Faca commits pequenos e frequentes com mensagens claras
- Revise o `git diff` antes de cada commit
- Nao commite `node_modules/`, `data.db` ou `package-lock.json` do workspace raiz

### Codigo

- Leia a [REGRA_DE_NEGOCIO.md](./REGRA_DE_NEGOCIO.md) inteira antes de comecar
- Trate erros e retorne os status HTTP corretos (201, 200, 422)
- Pense em concorrencia — os testes de stress vao testar isso
- Nao deixe `console.log` de debug no codigo final
- Mantenha o codigo organizado e legivel

### Frontend

- Respeite as classes CSS definidas na [REGRA_DE_NEGOCIO.md](./REGRA_DE_NEGOCIO.md) — os testes de frontend procuram por elas
- Teste a navegacao SPA (recarregar a pagina em `/history` deve funcionar)

## Estrutura do PR

Ao abrir o PR, o GitHub Actions vai:

1. Instalar as dependencias do seu time (`npm install`)
2. Buildar o frontend (`npm run build`)
3. Subir o servidor (`npm start`)
4. Rodar todos os testes automaticamente
5. Postar um comentario com a pontuacao detalhada

Se o servidor nao subir em 30 segundos, o teste falha. Garanta que `npm start` funciona sem interacao manual.

## Duvidas

Abra uma **issue** no repositorio com a tag `duvida`.
