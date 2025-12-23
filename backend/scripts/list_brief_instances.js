const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main(){
  try{
    const instances = await prisma.briefInstance.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, _count: { select: { responses: true } } }
    });

    console.log('BriefInstances total:', instances.length);
    for (const inst of instances){
      console.log(JSON.stringify({
        id: inst.id,
        templateId: inst.templateId,
        versionId: inst.versionId,
        userId: inst.userId,
        userEmail: inst.user?.email || null,
        status: inst.status,
        responsesCount: inst._count?.responses || 0,
        createdAt: inst.createdAt,
        updatedAt: inst.updatedAt
      }));
    }
  }catch(e){
    console.error('Error:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
