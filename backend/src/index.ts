import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import i18n from 'i18n';
import path from 'path';
import { login, register, authMiddleware, requireRole, JWT_SECRET } from './auth';
import jwt from 'jsonwebtoken';

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Configure i18n
i18n.configure({
  locales: ['en', 'pt', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  objectNotation: true,
  header: 'accept-language'
});

app.use(cors());
app.use(express.json());

// Helper to determine locale from request
function getLocale(req: Request): string {
  const lang = req.headers['accept-language'];
  if (lang?.startsWith('pt')) return 'pt';
  if (lang?.startsWith('es')) return 'es';
  return 'en';
}

// Helper to translate
function t(req: Request, key: string): string {
  i18n.setLocale(getLocale(req));
  return i18n.__(key);
}

// Helper to audit actions
async function audit(req: Request, action: string, entity: string, entityId?: string, metadata?: any) {
  const user = (req as any).user;
  if (!user) return;
  try {
    // Usando case casting para evitar erros se npx prisma generate falhar
    await (prisma as any).auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        userName: user.name,
        action,
        entity,
        entityId,
        metadata: metadata || null
      }
    });
  } catch (e) {
    console.error('Audit failed:', e);
  }
}

// Helper slugify to map human keys to normalized form
function slugify(s: string) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.get('/templates', authMiddleware, requireRole('Admin', 'Editor', 'Respondente'), async (req: Request, res: Response) => {
app.post('/brief-instances/:id/duplicate', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetVersionId, copyAnswers = true } = req.body || {};

    const original = await prisma.briefInstance.findUnique({
      where: { id },
      include: { responses: true }
    });
    if (!original) return res.status(404).json({ error: 'Original brief instance not found' });

    // Determine target version: use provided or latest available for the template
    let targetVersion = null as any;
    if (targetVersionId) {
      targetVersion = await prisma.templateVersion.findUnique({ where: { id: targetVersionId } });
      if (!targetVersion) return res.status(404).json({ error: 'Target version not found' });
    } else {
      targetVersion = await prisma.templateVersion.findFirst({ where: { templateId: original.templateId }, orderBy: { createdAt: 'desc' } });
    }

    // Create duplicated instance
    const duplicated = await prisma.briefInstance.create({
      data: {
        templateId: original.templateId,
        versionId: targetVersion ? targetVersion.id : null,
        userId: original.userId,
        tenantId: original.tenantId,
        status: 'draft',
        metadata: original.metadata ?? undefined
      }
    });

    const mapping: any[] = [];

    if (copyAnswers && original.responses && original.responses.length > 0) {
      // Prepare mapping of new questions by question text (from snapshot if available)
      let targetQuestionMap: Record<string, string> = {};
      if (targetVersion && targetVersion.data && targetVersion.data.blocks) {
        try {
          const snap = targetVersion.data as any;
          for (const b of snap.blocks || []) {
            for (const q of b.questions || []) {
              if (q.text) targetQuestionMap[q.text.trim().toLowerCase()] = q.id;
            }
          }
        } catch (e) {
          // ignore snapshot parsing issues
        }
      }

      // For each original response try to map to new question id by text match
      for (const r of original.responses) {
        try {
          const q = await (prisma as any).question.findUnique({ where: { id: r.questionId } });
          const qText = q?.text?.trim()?.toLowerCase();
          let newQuestionId = null;
          if (qText && targetQuestionMap[qText]) {
            newQuestionId = targetQuestionMap[qText];
          } else {
            // Fallback: if same question id exists in new template structure, reuse it
            const exists = await (prisma as any).question.findUnique({ where: { id: r.questionId } });
            if (exists) newQuestionId = r.questionId;
          }

          if (newQuestionId) {
            await (prisma as any).response.create({
              data: {
                briefId: duplicated.id,
                questionId: newQuestionId,
                value: r.value
              }
            });
            mapping.push({ fromResponseId: r.id, fromQuestionId: r.questionId, toQuestionId: newQuestionId });
          }
        } catch (e) {
          console.warn('Error copying response', r.id, e);
        }
      }
    }

    await audit(req, 'DUPLICATE', 'BriefInstance', duplicated.id, { originalId: original.id, mappings: mapping });

    res.json({ ok: true, newInstanceId: duplicated.id, mappings: mapping });
  } catch (e) {
    console.error('Error duplicating instance:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  try {
    const { tenantId } = (req as any).user;
    const templates = await prisma.template.findMany({
      where: { tenantId }
    });
    res.json(templates);
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
});

app.get('/templates/:id', authMiddleware, requireRole('Admin', 'Editor', 'Respondente'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        blocks: {
          include: { questions: true },
          orderBy: { order: 'asc' }
        },
        rules: true
      }
    });
    if (!template) {
      return res.status(404).json({ error: t(req, 'errors.templateNotFound') });
    }
    res.json(template);
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
});

// Endpoints to manage rules independently (useful for DnD builder)
  // List rules for a template
  app.get('/templates/:id/rules', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const rules = await prisma.rule.findMany({ where: { templateId: id }, orderBy: { createdAt: 'asc' } });
      res.json(rules);
    } catch (e) {
      console.error('Error listing rules:', e);
      res.status(500).json({ error: t(req, 'errors.internalError') });
    }
  });

  // Create a rule for a template
  app.post('/templates/:id/rules', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { expression, action } = req.body || {};

      // Basic validation: if JSON, ensure referenced keys exist in template
      const template = await prisma.template.findUnique({ where: { id }, include: { blocks: { include: { questions: true } } } });
      if (!template) return res.status(404).json({ error: t(req, 'errors.templateNotFound') });

      const questionKeys = new Set<string>();
      const blockKeys = new Set<string>();
      for (const b of template.blocks || []) {
        const bKey = (b as any).id || slugify((b as any).title || '');
        blockKeys.add(bKey);
        for (const q of (b as any).questions || []) {
          const qKey = (q as any).id || slugify((q as any).text || '');
          questionKeys.add(qKey);
        }
      }

      const validationErrors: string[] = [];
      try {
        const expr = typeof expression === 'string' ? JSON.parse(expression) : expression;
        if (expr && expr.questionId && !questionKeys.has(expr.questionId)) validationErrors.push(`Missing question key \"${expr.questionId}\"`);
      } catch (e) {
        validationErrors.push('Invalid expression JSON');
      }
      try {
        const act = typeof action === 'string' ? JSON.parse(action) : action;
        if (act && act.targetId && !blockKeys.has(act.targetId)) validationErrors.push(`Missing target block key \"${act.targetId}\"`);
        if (act && act.questionId && !questionKeys.has(act.questionId)) validationErrors.push(`Missing action question key \"${act.questionId}\"`);
      } catch (e) {
        // ignore non-json actions
      }

      if (validationErrors.length > 0) return res.status(400).json({ error: 'Validation failed', details: validationErrors });

      const created = await prisma.rule.create({ data: { templateId: id, expression: typeof expression === 'object' ? JSON.stringify(expression) : expression, action: typeof action === 'object' ? JSON.stringify(action) : action } });
      await audit(req, 'CREATE', 'Rule', created.id, { templateId: id });
      res.status(201).json(created);
    } catch (e) {
      console.error('Error creating rule:', e);
      res.status(500).json({ error: t(req, 'errors.internalError') });
    }
  });

  // Update rule
  app.put('/templates/:id/rules/:ruleId', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
    try {
      const { id, ruleId } = req.params;
      const { expression, action } = req.body || {};
      const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
      if (!rule || rule.templateId !== id) return res.status(404).json({ error: t(req, 'errors.notFound') });

      const template = await prisma.template.findUnique({ where: { id }, include: { blocks: { include: { questions: true } } } });
      if (!template) return res.status(404).json({ error: t(req, 'errors.templateNotFound') });

      const questionKeys = new Set<string>();
      const blockKeys = new Set<string>();
      for (const b of template.blocks || []) {
        const bKey = (b as any).id || slugify((b as any).title || '');
        blockKeys.add(bKey);
        for (const q of (b as any).questions || []) questionKeys.add((q as any).id || slugify((q as any).text || ''));
      }

      const validationErrors: string[] = [];
      try {
        const expr = typeof expression === 'string' ? JSON.parse(expression) : expression;
        if (expr && expr.questionId && !questionKeys.has(expr.questionId)) validationErrors.push(`Missing question key \"${expr.questionId}\"`);
      } catch (e) {
        validationErrors.push('Invalid expression JSON');
      }
      try {
        const act = typeof action === 'string' ? JSON.parse(action) : action;
        if (act && act.targetId && !blockKeys.has(act.targetId)) validationErrors.push(`Missing target block key \"${act.targetId}\"`);
        if (act && act.questionId && !questionKeys.has(act.questionId)) validationErrors.push(`Missing action question key \"${act.questionId}\"`);
      } catch (e) {
        // ignore
      }

      if (validationErrors.length > 0) return res.status(400).json({ error: 'Validation failed', details: validationErrors });

      const updated = await prisma.rule.update({ where: { id: ruleId }, data: { expression: typeof expression === 'object' ? JSON.stringify(expression) : expression, action: typeof action === 'object' ? JSON.stringify(action) : action } });
      await audit(req, 'UPDATE', 'Rule', ruleId, { templateId: id });
      res.json(updated);
    } catch (e) {
      console.error('Error updating rule:', e);
      res.status(500).json({ error: t(req, 'errors.internalError') });
    }
  });

  // Delete rule
  app.delete('/templates/:id/rules/:ruleId', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
    try {
      const { id, ruleId } = req.params;
      const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
      if (!rule || rule.templateId !== id) return res.status(404).json({ error: t(req, 'errors.notFound') });
      await prisma.rule.delete({ where: { id: ruleId } });
      await audit(req, 'DELETE', 'Rule', ruleId, { templateId: id });
      res.json({ ok: true });
    } catch (e) {
      console.error('Error deleting rule:', e);
      res.status(500).json({ error: t(req, 'errors.internalError') });
    }
  });

app.post('/templates', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const { tenantId } = (req as any).user;
    const { name, description, blocks, rules, allowDraftResponses } = req.body;

    // Validate that rules reference existing question/block keys (slugs or ids)
    const questionKeys = new Set<string>();
    const blockKeys = new Set<string>();
    for (const b of blocks || []) {
      const bKey = b.id || slugify(b.title || '');
      blockKeys.add(bKey);
      for (const q of (b.questions || [])) {
        const qKey = q.id || slugify(q.text || '');
        questionKeys.add(qKey);
      }
    }

    const validationErrors: string[] = [];
    for (let i = 0; i < (rules || []).length; i++) {
      const r = rules[i];
      try {
        const expr = JSON.parse(r.expression || '{}');
        if (expr && expr.questionId && !questionKeys.has(expr.questionId)) {
          validationErrors.push(`Rule ${i + 1}: missing question key "${expr.questionId}"`);
        }
      } catch (e) {
        validationErrors.push(`Rule ${i + 1}: invalid expression JSON`);
      }
      try {
        const action = JSON.parse(r.action || '{}');
        if (action && action.targetId && !blockKeys.has(action.targetId)) {
          validationErrors.push(`Rule ${i + 1}: missing target block key "${action.targetId}"`);
        }
        if (action && action.questionId && !questionKeys.has(action.questionId)) {
          validationErrors.push(`Rule ${i + 1}: missing action question key "${action.questionId}"`);
        }
      } catch (e) {
        // ignore non-json actions
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    const template = await prisma.template.create({
      data: {
        tenantId,
        name,
        description,
        allowDraftResponses: Boolean(allowDraftResponses),
        blocks: {
          create: blocks.map((b: any) => ({
            title: b.title,
            description: b.description,
            order: b.order,
            questions: {
              create: b.questions.map((q: any) => ({
                text: q.text,
                key: q.key || slugify(q.text || ''),
                type: q.type,
                required: q.required,
                placeholder: q.placeholder,
                options: q.options
              }))
            }
          }))
        },
        rules: {
          create: rules.map((r: any) => ({
            expression: r.expression,
            action: r.action
          }))
        }
      }
    });

    await audit(req, 'CREATE', 'Template', template.id, { name: template.name });

    res.status(201).json({ ok: true, templateId: template.id, message: t(req, 'success.templateCreated') });
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
});

app.put('/templates/:id', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Validate rules in incoming payload before applying destructive changes
    const pBlocks = payload.blocks || [];
    const pRules = payload.rules || [];
    const questionKeys = new Set<string>();
    const blockKeys = new Set<string>();
    for (const b of pBlocks) {
      const bKey = b.id || slugify(b.title || '');
      blockKeys.add(bKey);
      for (const q of (b.questions || [])) {
        const qKey = q.id || slugify(q.text || '');
        questionKeys.add(qKey);
      }
    }

    const validationErrors: string[] = [];
    for (let i = 0; i < pRules.length; i++) {
      const r = pRules[i];
      try {
        const expr = JSON.parse(r.expression || '{}');
        if (expr && expr.questionId && !questionKeys.has(expr.questionId)) {
          validationErrors.push(`Rule ${i + 1}: missing question key "${expr.questionId}"`);
        }
      } catch (e) {
        validationErrors.push(`Rule ${i + 1}: invalid expression JSON`);
      }
      try {
        const action = JSON.parse(r.action || '{}');
        if (action && action.targetId && !blockKeys.has(action.targetId)) {
          validationErrors.push(`Rule ${i + 1}: missing target block key "${action.targetId}"`);
        }
        if (action && action.questionId && !questionKeys.has(action.questionId)) {
          validationErrors.push(`Rule ${i + 1}: missing action question key "${action.questionId}"`);
        }
      } catch (e) {
        // ignore non-json actions
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Simples para MVP: deleta tudo e recria
    // Precisamos deletar respostas -> perguntas -> blocos -> regras
    // Remover respostas relacionadas às perguntas do template evita violação de FK
    try {
      await (prisma as any).response.deleteMany({ where: { question: { block: { templateId: id } } } });
    } catch (e) {
      // se o delete falhar por qualquer razão, continuamos para tentar limpar as perguntas
      console.warn('Failed to delete responses for template cleanup:', e);
    }

    await (prisma as any).question.deleteMany({ where: { block: { templateId: id } } });
    await (prisma as any).block.deleteMany({ where: { templateId: id } });
    await (prisma as any).rule.deleteMany({ where: { templateId: id } });

    await prisma.template.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
        allowDraftResponses: Boolean(payload.allowDraftResponses),
        blocks: {
          create: payload.blocks.map((b: any) => ({
            title: b.title,
            description: b.description,
            order: b.order,
            questions: {
              create: b.questions.map((q: any) => ({
                text: q.text,
                key: q.key || slugify(q.text || ''),
                type: q.type,
                required: q.required,
                placeholder: q.placeholder,
                options: q.options
              }))
            }
          }))
        },
        rules: {
          create: payload.rules.map((r: any) => ({
            expression: r.expression,
            action: r.action
          }))
        }
      }
    });

    await audit(req, 'UPDATE', 'Template', id, { name: payload.name });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/templates/:id/publish', authMiddleware, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id },
      include: { blocks: { include: { questions: true } }, rules: true }
    });
    if (!template) {
      return res.status(404).json({ error: t(req, 'errors.templateNotFound') });
    }

    const snapshot = {
      template: { id: template.id, name: template.name, description: template.description },
      blocks: template.blocks,
      rules: template.rules
    };

    await prisma.templateVersion.create({ data: { templateId: id, data: snapshot } });
    await prisma.template.update({ where: { id }, data: { published: true } });

    await audit(req, 'PUBLISH', 'Template', id);

    res.json({ ok: true, message: t(req, 'success.templatePublished') });
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
});

app.post('/templates/:id/revert-to-draft', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ error: t(req, 'errors.templateNotFound') });
    }

    await prisma.template.update({
      where: { id },
      data: { published: false }
    });

    await audit(req, 'REVERT_TO_DRAFT', 'Template', id);

    res.json({ ok: true, message: t(req, 'success.templateReverted') || 'Template revertido para rascunho com sucesso.' });
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
});

app.post('/auth/login', login);
app.post('/auth/register', register);

// Routes for Client Fill Flow
app.get('/templates/:id/public', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id },
      select: { name: true, description: true, published: true }
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Returns full template structure for filling
app.get('/templates/:id/full', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se há um token de respondente indicando uma instância específica
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET as string) as any;
        if (decoded.briefId) {
          const instance = await prisma.briefInstance.findUnique({
            where: { id: decoded.briefId },
            include: { version: true }
          });

          if (instance?.version) {
            const snapshot = instance.version.data as any;
            // Retornar a snapshot no formato que o frontend espera
            return res.json({
              ...snapshot.template,
              blocks: snapshot.blocks,
              rules: snapshot.rules
            });
          }
        }
      } catch (e) {
        // Token inválido ou admin token, segue para o carregamento normal
      }
    }

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
          include: { questions: { orderBy: { createdAt: 'asc' } } }
        },
        rules: true
      }
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (e) {
    console.error('Error loading full template:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/brief-instances/start', async (req: Request, res: Response) => {
  try {
    const { templateId, name, email } = req.body;
    if (!templateId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // 1. Encontrar ou criar o usuário (Respondente)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'Respondente',
          tenantId: template.tenantId,
          password: `magic-${Math.random().toString(36).substring(7)}`
        }
      });
    }

    // 2. Verificar se existe instância em rascunho para este usuário/template
    const instances = await prisma.briefInstance.findMany({
      where: {
        templateId,
        userId: user.id,
        status: 'draft'
      },
      include: {
        responses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let instance: any = instances.find(i => (i as any).responses.length > 0) || instances[0];

    if (!instance) {
      // Buscar a versão publicada mais recente para congelar
      const latestVersion = await prisma.templateVersion.findFirst({
        where: { templateId },
        orderBy: { createdAt: 'desc' }
      });

      // Se não existir versão publicada, e o template permitir rascunhos,
      // criar um snapshot (TemplateVersion) para congelar a estrutura atual.
      let versionToUse = latestVersion;
      if (!versionToUse && (template as any).allowDraftResponses) {
        try {
          const full = await prisma.template.findUnique({
            where: { id: templateId },
            include: { blocks: { include: { questions: true }, orderBy: { order: 'asc' } }, rules: true }
          });
          const snapshot = {
            template: { id: full?.id, name: full?.name, description: full?.description },
            blocks: full?.blocks || [],
            rules: full?.rules || []
          };
          const created = await prisma.templateVersion.create({ data: { templateId, data: snapshot } });
          versionToUse = created;
          await audit(req, 'AUTO_SNAPSHOT', 'TemplateVersion', created.id, { reason: 'allowDraftResponses on start' });
        } catch (e) {
          console.warn('Failed to create auto snapshot for draft responses:', e);
        }
      }

      // Criar nova instância usando a versão determinada (pode ser null)
      instance = await (prisma.briefInstance as any).create({
        data: {
          templateId,
          versionId: versionToUse?.id,
          userId: user.id,
          tenantId: template.tenantId,
          status: 'draft'
        },
        include: {
          responses: true
        }
      });
    }

    // 3. Gerar token de acesso para o cliente
    const token = jwt.sign(
      { sub: user.id, name: user.name, role: user.role, tenantId: user.tenantId, briefId: instance.id },
      JWT_SECRET as any,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      token,
      instanceId: instance.id,
      responses: instance.responses,
      metadata: instance.metadata // Enviar metadados (ex: progresso)
    });
  } catch (e) {
    console.error('Error starting brief:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/brief-instances', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const instances = await prisma.briefInstance.findMany({
      where: {
        tenantId: user.tenantId
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        template: {
          select: { name: true }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    res.json(instances);
  } catch (e) {
    console.error('Error fetching all brief instances:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/brief-instances/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instance = await prisma.briefInstance.findUnique({
      where: { id },
      include: {
        responses: true,
        user: true,
        template: {
          select: { id: true, name: true }
        }
      }
    });

    if (!instance) return res.status(404).json({ error: 'Brief instance not found' });
    res.json(instance);
  } catch (e) {
    console.error('Error fetching brief instance:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/templates/:id/instances', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instances = await prisma.briefInstance.findMany({
      where: { templateId: id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(instances);
  } catch (e) {
    console.error('Error fetching template instances:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/brief-instances/:id/responses', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { responses } = req.body; // Array of { questionId, value }

    if (!Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses must be an array' });
    }

    // Usar upsert atômico para cada resposta
    for (const r of responses) {
      await (prisma.response as any).upsert({
        where: {
          briefId_questionId: {
            briefId: id,
            questionId: r.questionId
          }
        },
        create: {
          briefId: id,
          questionId: r.questionId,
          value: r.value
        },
        update: {
          value: r.value
        }
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('Error saving responses:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplicate a brief instance into a new instance, optionally targeting a specific version
app.post('/brief-instances/:id/duplicate', authMiddleware, requireRole('Admin', 'Editor'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetVersionId, copyAnswers = true } = req.body as { targetVersionId?: string; copyAnswers?: boolean };

    const original = await prisma.briefInstance.findUnique({ where: { id }, include: { responses: true, user: true } });
    if (!original) return res.status(404).json({ error: 'Instance not found' });

    // Determine target version: provided or latest for template
    let versionId = targetVersionId || null;
    if (!versionId) {
      const latest = await prisma.templateVersion.findFirst({ where: { templateId: original.templateId }, orderBy: { createdAt: 'desc' } });
      versionId = latest?.id || null;
    }

    // Create new brief instance (draft)
    const duplicated = await prisma.briefInstance.create({
      data: {
        templateId: original.templateId,
        versionId,
        userId: original.userId,
        tenantId: original.tenantId,
        status: 'draft',
        metadata: original.metadata ? (original.metadata as any) : undefined
      }
    });

    // If copying answers, attempt to map old questionIds -> new questionIds
    if (copyAnswers && original.responses && original.responses.length > 0) {
      // Build map of new questions: prefer snapshot if versionId provided, else current questions
      let newQuestions: any[] = [];
      if (versionId) {
        const ver: any = await prisma.templateVersion.findUnique({ where: { id: versionId } }) as any;
        const blocks = (ver?.data as any)?.blocks || [];
        newQuestions = (blocks || []).flatMap((b: any) => (b.questions || []).map((q: any) => ({ id: q.id, text: q.text })));
      } else {
        const qs = await prisma.question.findMany({ where: { block: { templateId: original.templateId } }, select: { id: true, text: true } as any }) as any[];
        newQuestions = qs as any[];
      }

      // Create simple map by exact text match
      const mapByText = new Map<string, string>();
      for (const q of newQuestions) {
        const text = String((q as any).text || '').trim().toLowerCase();
        if (text) mapByText.set(text, q.id);
      }

      for (const r of original.responses) {
        // attempt to find matching new question by text; fallback to same id if present
        let targetQId = null as string | null;
        // try same id exists
        const existsSame = newQuestions.find((n) => n.id === r.questionId);
        if (existsSame) targetQId = r.questionId;
        else {
          const oldQ = await prisma.question.findUnique({ where: { id: r.questionId }, select: { text: true } as any });
          const oldText = String((oldQ as any)?.text || '').trim().toLowerCase();
          if (oldText) {
            const found = mapByText.get(oldText);
            if (found) targetQId = found;
          }
        }

        if (targetQId) {
          await prisma.response.create({ data: { briefId: duplicated.id, questionId: targetQId, value: r.value } as any });
        }
      }
    }

    await audit(req, 'DUPLICATE', 'BriefInstance', duplicated.id, { from: id, copyAnswers });

    res.json({ ok: true, newInstanceId: duplicated.id });
  } catch (e) {
    console.error('Error duplicating instance:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/brief-instances/:id/metadata', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { metadata } = req.body;

    await prisma.briefInstance.update({
      where: { id },
      data: { metadata }
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Error saving metadata:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/seed', async (req: Request, res: Response) => {
  try {
    await prisma.tenant.createMany({
      data: [
        { name: 'Tenant A' },
        { name: 'Tenant B' }
      ],
      skipDuplicates: true
    });
    res.json({ ok: true, message: t(req, 'success.seedCompleted') });
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));
