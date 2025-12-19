import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';
import authRouter, { authMiddleware } from './auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/templates', async (req, res) => {
  try {
    const tenantId = req.header('x-tenant-id');
    const where: any = tenantId ? { tenantId } : {};
    const templates = await prisma.template.findMany({ where });
    res.json(templates);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id },
      include: { blocks: { include: { questions: true } }, rules: true, versions: true }
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/templates', async (req, res) => {
  try {
    const payload = req.body;
    const tenantId = payload.tenantId || req.header('x-tenant-id');
    if (!tenantId) return res.status(400).json({ error: 'tenantId required (body or x-tenant-id header)' });

    const template = await prisma.template.create({
      data: {
        tenantId,
        name: payload.name,
        description: payload.description,
        published: false
      }
    });

    // create blocks and questions if provided
    if (Array.isArray(payload.blocks)) {
      for (const b of payload.blocks) {
        const block = await prisma.block.create({ data: { templateId: template.id, title: b.title, order: b.order || 0, parentId: b.parentId || null } });
        if (Array.isArray(b.questions)) {
          for (const q of b.questions) {
            await prisma.question.create({ data: { blockId: block.id, text: q.text, type: q.type || 'text', required: !!q.required } });
          }
        }
      }
    }

    if (Array.isArray(payload.rules)) {
      for (const r of payload.rules) {
        await prisma.rule.create({ data: { templateId: template.id, expression: r.expression, action: r.action } });
      }
    }

    res.status(201).json({ ok: true, templateId: template.id });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Template not found' });

    // update basic fields
    await prisma.template.update({ where: { id }, data: { name: payload.name ?? existing.name, description: payload.description ?? existing.description } });

    // simple replace strategy for blocks and rules (delete and recreate) -- acceptable for MVP
    if (payload.blocks) {
      await prisma.question.deleteMany({ where: { block: { templateId: id } } as any }).catch(() => {});
      await prisma.block.deleteMany({ where: { templateId: id } }).catch(() => {});
      for (const b of payload.blocks) {
        const block = await prisma.block.create({ data: { templateId: id, title: b.title, order: b.order || 0, parentId: b.parentId || null } });
        if (Array.isArray(b.questions)) {
          for (const q of b.questions) {
            await prisma.question.create({ data: { blockId: block.id, text: q.text, type: q.type || 'text', required: !!q.required } });
          }
        }
      }
    }

    if (payload.rules) {
      await prisma.rule.deleteMany({ where: { templateId: id } }).catch(() => {});
      for (const r of payload.rules) {
        await prisma.rule.create({ data: { templateId: id, expression: r.expression, action: r.action } });
      }
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/templates/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({ where: { id }, include: { blocks: { include: { questions: true } }, rules: true } });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const snapshot = {
      template: { id: template.id, name: template.name, description: template.description },
      blocks: template.blocks,
      rules: template.rules
    };

    await prisma.templateVersion.create({ data: { templateId: id, data: snapshot } });
    await prisma.template.update({ where: { id }, data: { published: true } });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/seed', async (_req, res) => {
  try {
    await prisma.tenant.createMany({ data: [
      { name: 'Tenant A' },
      { name: 'Tenant B' }
    ], skipDuplicates: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));
