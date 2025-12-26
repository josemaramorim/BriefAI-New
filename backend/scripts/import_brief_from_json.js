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
    // Parse simple CLI args: positional tenant id or flags --file=, --tenant=, --overwrite, --force, --name=
    function parseArgs(){
      const out = { _: [] };
      process.argv.slice(2).forEach(a => {
        if (a.startsWith('--')){
          const [k,v] = a.includes('=') ? a.split('=') : [a, true];
          out[k.replace(/^--/,'')] = v === true ? true : v;
        } else {
          out._.push(a);
        }
      });
      return out;
    }

    const args = parseArgs();
    const file = args.file || path.join(__dirname, '..', 'briefs', 'template-de-exemplo-completo.json');
    if(!fs.existsSync(file)){
      console.error('Arquivo não encontrado:', file);
      process.exit(1);
    }

    const content = JSON.parse(fs.readFileSync(file, 'utf8'));

    // tenant id: positional first arg, or --tenant, or env
    const tenantIdArg = args._[0] || args.tenant || process.env.TARGET_TENANT_ID || null;
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

    const overwrite = !!args.overwrite;
    const force = !!args.force;
    const forcedName = args.name;

    // If content provided an id and it exists
    if (content.id) {
      const exists = await prisma.template.findUnique({ where: { id: content.id } });
      if (exists && !overwrite) {
        console.log('Template já existe com id (skip):', exists.id);
        return;
      }
      if (exists && overwrite) {
        // remove previous responses, questions, rules and blocks (in safe order) and recreate below
        await prisma.response.deleteMany({ where: { question: { block: { templateId: exists.id } } } });
        await prisma.question.deleteMany({ where: { block: { templateId: exists.id } } });
        await prisma.rule.deleteMany({ where: { templateId: exists.id } });
        await prisma.block.deleteMany({ where: { templateId: exists.id } });
        await prisma.template.update({ where: { id: exists.id }, data: { name: templateData.name, description: templateData.description, allowDraftResponses: templateData.allowDraftResponses, published: templateData.published } });
        // recreate blocks and rules
        for (const b of blocksPayload) {
          const questions = (b.questions && b.questions.create ? b.questions.create : []).map(q => ({
            text: q.text,
            key: q.key || slugify(q.text || ''),
            type: q.type || 'text',
            required: !!q.required,
            placeholder: q.placeholder || null,
            options: q.options || undefined
          }));
          await prisma.block.create({ data: { templateId: exists.id, title: b.title, description: b.description, order: b.order, questions: { create: questions } } });
        }
        for (const r of rulesPayload) {
          await prisma.rule.create({ data: { templateId: exists.id, expression: r.expression, action: r.action } });
        }
        console.log('Template existente atualizado com sucesso. id=', exists.id);
        return;
      }
      // preserve provided id when creating new
      templateData.id = content.id;
    }

    // Also check by name+tenant to avoid accidental duplicates
    const nameToCheck = forcedName || templateData.name;
    const byName = await prisma.template.findFirst({ where: { tenantId: tenant.id, name: nameToCheck } });
    if (byName) {
      if (overwrite) {
        // delete responses, questions, blocks and rules then update (safe order)
        await prisma.response.deleteMany({ where: { question: { block: { templateId: byName.id } } } });
        await prisma.question.deleteMany({ where: { block: { templateId: byName.id } } });
        await prisma.rule.deleteMany({ where: { templateId: byName.id } });
        await prisma.block.deleteMany({ where: { templateId: byName.id } });
        await prisma.template.update({ where: { id: byName.id }, data: { name: nameToCheck, description: templateData.description, allowDraftResponses: templateData.allowDraftResponses, published: templateData.published } });
        for (const b of blocksPayload) {
          const questions = (b.questions && b.questions.create ? b.questions.create : []).map(q => ({
            text: q.text,
            key: q.key || slugify(q.text || ''),
            type: q.type || 'text',
            required: !!q.required,
            placeholder: q.placeholder || null,
            options: q.options || undefined
          }));
          await prisma.block.create({ data: { templateId: byName.id, title: b.title, description: b.description, order: b.order, questions: { create: questions } } });
        }
        for (const r of rulesPayload) {
          await prisma.rule.create({ data: { templateId: byName.id, expression: r.expression, action: r.action } });
        }
        console.log('Template existente atualizado com sucesso. id=', byName.id);
        return;
      }

      if (force) {
        // create a new template with a unique suffix
        templateData.name = `${templateData.name} (import ${Date.now()})`;
      } else {
        console.log('Template já existe (matching name) com id (skip):', byName.id);
        return;
      }
    }

    // override name if requested
    if (forcedName) templateData.name = forcedName;

    // Create template
    try {
      const created = await prisma.template.create({ data: templateData });
      console.log('Template importado com sucesso. id=', created.id);
    } catch (e) {
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
