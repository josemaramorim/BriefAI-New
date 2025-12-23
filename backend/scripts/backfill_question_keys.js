const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(s){
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

async function main(){
  try{
    console.log('Starting backfill of question.key...');
    const questions = await prisma.question.findMany({ orderBy: { createdAt: 'asc' } });
    const byBlock = {};
    for(const q of questions){
      const blockId = q.blockId;
      byBlock[blockId] = byBlock[blockId] || [];
      byBlock[blockId].push(q);
    }

    for(const blockId of Object.keys(byBlock)){
      const seen = new Set();
      const qs = byBlock[blockId];
      for(const q of qs){
        if(q.key){
          seen.add(q.key);
          continue;
        }
        let base = slugify(q.text || q.id || 'q');
        if(!base) base = 'q';
        let candidate = base;
        let i = 1;
        while(seen.has(candidate) || await prisma.question.findFirst({ where: { blockId, key: candidate } })){
          candidate = `${base}-${i++}`;
        }
        // update question
        await prisma.question.update({ where: { id: q.id }, data: { key: candidate } });
        seen.add(candidate);
        console.log(`Updated question ${q.id} key=${candidate}`);
      }
    }

    console.log('Backfill complete.');
  }catch(e){
    console.error('Error during backfill:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
