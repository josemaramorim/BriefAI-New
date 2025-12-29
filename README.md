## Configuração do Armazenamento de Imagens

O backend suporta configuração do provider de armazenamento de imagens via variável de ambiente:

- `IMAGE_STORAGE_PROVIDER`: Define o tipo de armazenamento de imagens. Valores possíveis:
	- `local` (padrão): As imagens são salvas em disco, na pasta `backend/briefs/<templateId>/images`.
	- (futuro) `s3`, `gcs`, etc: Para integração com nuvem.

Exemplo no arquivo `.env`:

```env
IMAGE_STORAGE_PROVIDER=local
```

Se não definido, o padrão é `local`.
# BriefAI MVP — Scaffold

Este repositório contém planejamento e um scaffold mínimo do MVP.

## Infra/Pré-requisitos
- Node.js 18+
- A URL do Postgres remoto (defina `DATABASE_URL` em `.env` usando `.env.example`)

## Rodando backend
1. Entre na pasta `backend`:

```bash
cd backend
npm install
```

2. Gere client Prisma e aplique schema (usa `DATABASE_URL`):

```bash
npx prisma generate
npx prisma db push
```

3. Rodar seed:

```bash
npx ts-node prisma/seed.ts
```

4. Start em dev:

```bash
npm run dev
```

## Rodando frontend
```bash
cd frontend
npm install
npm run dev
```

## Observações
- Não commit suas credenciais reais. Use `.env.example` como base.
- Scaffold inicial: backend Express + Prisma, frontend Vite + React.
