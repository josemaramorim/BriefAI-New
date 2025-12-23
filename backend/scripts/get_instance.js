require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const id = process.argv[2];
if(!id){
  console.error('Usage: node get_instance.js <instanceId>');
  process.exit(1);
}

(async ()=>{
  try{
    const inst = await prisma.briefInstance.findUnique({ where: { id }, include: { user: true, template: true, version: true, _count: { select: { responses: true } } } });
    if(!inst){
      console.log('Instance not found:', id);
    } else {
      console.log('INSTANCE:', JSON.stringify(inst, null, 2));
    }
  }catch(e){
    console.error('Error querying instance:', e);
  }finally{
    await prisma.$disconnect();
  }
})();
