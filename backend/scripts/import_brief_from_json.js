const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

function slugify(s){
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

async function main(){
  try{
    const file = path.join(__dirname, '..', 'briefs', 'template-de-exemplo-completo.json');
    if(!fs.existsSync(file)){
      console.error('Arquivo não encontrado:', file);
      process.exit(1);
    }

    const content = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Use provided tenantId (argv[2]) or fall back to creating/finding a default tenant
    const tenantIdArg = process.argv[2] || process.env.TARGET_TENANT_ID || null;
    let tenant = null;
    if (tenantIdArg) {
      tenant = await prisma.tenant.findUnique({ where: { id: tenantIdArg } });
      if (!tenant) {
        console.error('Tenant id informado não foi encontrado:', tenantIdArg);
        process.exit(1);
      }
      console.log('Usando tenant informado:', tenant.id);
    } else {
      const tenantName = 'Local Seed Tenant';
      tenant = await prisma.tenant.findFirst({ where: { name: tenantName } });
      if(!tenant){
        tenant = await prisma.tenant.create({ data: { name: tenantName } });
        console.log('Tenant criado:', tenant.id);
      } else {
        console.log('Usando tenant existente:', tenant.id);
      }
    }

    // Build blocks payload; preserve provided ids for blocks/questions when present
    const blocksPayload = (content.blocks || []).map(b => ({
      ...(b.id ? { id: b.id } : {}),
      title: b.title,
      description: b.description || null,
      order: typeof b.order === 'number' ? b.order : 0,
      questions: {
        create: (b.questions || []).map(q => ({
          ...(q.id ? { id: q.id } : {}),
          text: q.text,
          key: q.key || slugify(q.text || ''),
          type: q.type || 'text',
          required: !!q.required,
          placeholder: q.placeholder || null,
          options: q.options || undefined
        }))
      }
    }));

    const rulesPayload = (content.rules || []).map(r => ({
      ...(r.id ? { id: r.id } : {}),
      expression: r.expression,
      action: r.action
    }));

    const templateData = {
      tenantId: tenant.id,
      name: content.name || 'Imported Template',
      description: content.description || null,
      allowDraftResponses: !!content.allowDraftResponses,
      published: !!content.published,
      blocks: { create: blocksPayload },
      rules: { create: rulesPayload }
    };

    // Avoid creating duplicates: if content provided an id and it exists, reuse it.
    if (content.id) {
      const exists = await prisma.template.findUnique({ where: { id: content.id } });
      if (exists) {
        console.log('Template já existe com id (skip):', exists.id);
        return;
      }
      // preserve provided id
      templateData.id = content.id;
    }

    // Also check by name+tenant to avoid accidental duplicates
    const byName = await prisma.template.findFirst({ where: { tenantId: tenant.id, name: templateData.name } });
    if (byName) {
      console.log('Template já existe (matching name) com id (skip):', byName.id);
      return;
    }

    // Create template
    try {
      const created = await prisma.template.create({ data: templateData });
      console.log('Template importado com sucesso. id=', created.id);
    } catch (e) {
      // Surface unique constraint more clearly
      if (e && e.code === 'P2002') {
        console.error('Unique constraint failed during template import:', e.meta);
      }
      throw e;
    }
  }catch(e){
    console.error('Erro importando template:', e);
    process.exitCode = 1;
  }finally{
    await prisma.$disconnect();
  }
}

main();
