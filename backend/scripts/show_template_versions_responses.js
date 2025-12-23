const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const templateId = process.argv[2] || 'cmjekgysg000113503o7x6hjx';
const versionIdArg = process.argv[3] || null; // optional
const userIdArg = process.argv[4] || null; // optional

async function main(){
  try{
    console.log('Template:', templateId);

    const versions = await prisma.templateVersion.findMany({ where: { templateId }, orderBy: { createdAt: 'desc' } });
    console.log('Found versions:', versions.length);
    for (const v of versions){
      console.log('\nVersion:', v.id, 'createdAt:', v.createdAt.toISOString());
      if (v.data){
        // print basic info from snapshot
        try{
          const snap = v.data;
          if (snap.template) console.log(' snapshot template name:', snap.template.name || '(no name)');
          if (snap.blocks) console.log(' snapshot blocks count:', snap.blocks.length);
        }catch(e){ console.warn(' snapshot parse error', e); }
      }

      // find brief instances that reference this version
      const where = { versionId: v.id };
      if (userIdArg) where.userId = userIdArg;
      const instances = await prisma.briefInstance.findMany({ where, include: { user: true, responses: true, _count: { select: { responses: true } } } });
      console.log(' BriefInstances for version:', instances.length);
      for (const inst of instances){
        console.log('  Instance:', inst.id, 'user:', inst.user?.email || inst.userId, 'status:', inst.status, 'responsesCount:', inst._count.responses);
        for (const r of inst.responses){
          console.log('   - response:', r.id, 'questionId:', r.questionId, 'value:', JSON.stringify(r.value));
        }
      }
    }

    // Also list brief instances for this template that have no version (versionId null)
    const whereNoVersion = { templateId, versionId: null };
    if (userIdArg) whereNoVersion.userId = userIdArg;
    const nov = await prisma.briefInstance.findMany({ where: whereNoVersion, include: { user: true, responses: true, _count: { select: { responses: true } } } });
    console.log('\nBriefInstances with version=NULL for template:', nov.length);
    for (const inst of nov){
      console.log('  Instance:', inst.id, 'user:', inst.user?.email || inst.userId, 'status:', inst.status, 'responsesCount:', inst._count.responses);
      for (const r of inst.responses){
        console.log('   - response:', r.id, 'questionId:', r.questionId, 'value:', JSON.stringify(r.value));
      }
    }

    // If a specific versionIdArg provided, show the snapshot questions mapped to responses
    if (versionIdArg){
      const v = await prisma.templateVersion.findUnique({ where: { id: versionIdArg } });
      if (v){
        const snap = v.data;
        console.log('\nSnapshot blocks/questions for version', v.id);
        if (snap && snap.blocks){
          for (const b of snap.blocks){
            console.log(' Block:', b.id, b.title);
            if (b.questions) for (const q of b.questions){
              console.log('  Q:', q.id, q.text);
            }
          }
        }
      } else {
        console.log('Version id not found:', versionIdArg);
      }
    }

  }catch(e){
    console.error('Error:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
