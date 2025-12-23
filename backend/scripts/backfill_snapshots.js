require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  try{
    console.log('Starting backfill: snapshots for brief instances without versionId');

    // Find all templates that allow draft responses
    const templates = await prisma.template.findMany({ where: { allowDraftResponses: true } });
    for(const t of templates){
      console.log('Processing template', t.id, t.name);

      // Find brief instances for this template where versionId is null
      const instances = await prisma.briefInstance.findMany({ where: { templateId: t.id, versionId: null } });
      console.log(`  found ${instances.length} instances without versionId`);

      if(instances.length === 0) continue;

      // Create a snapshot from current template structure
      const full = await prisma.template.findUnique({ where: { id: t.id }, include: { blocks: { include: { questions: true }, orderBy: { order: 'asc' } }, rules: true } });
      const snapshot = {
        template: { id: full.id, name: full.name, description: full.description },
        blocks: full.blocks || [],
        rules: full.rules || []
      };

      const created = await prisma.templateVersion.create({ data: { templateId: t.id, data: snapshot } });
      console.log('  created templateVersion', created.id);

      // Update all affected instances to point to this new version
      for(const inst of instances){
        await prisma.briefInstance.update({ where: { id: inst.id }, data: { versionId: created.id } });
        await prisma.auditLog.create({ data: { tenantId: inst.tenantId, userId: null, userName: null, action: 'BACKFILL_SNAPSHOT', entity: 'BriefInstance', entityId: inst.id, metadata: { newVersionId: created.id } } });
        console.log('   updated instance', inst.id);
      }
    }

    console.log('Backfill completed');
  }catch(e){
    console.error('Backfill failed:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
