import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/templates', async (_req, res) => {
  const templates = await prisma.template.findMany({ where: { published: true } });
  res.json(templates);
});

app.post('/seed', async (_req, res) => {
  try {
    await prisma.tenant.createMany({ data: [
      { name: 'Tenant A' },
      { name: 'Tenant B' }
    ] });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));
