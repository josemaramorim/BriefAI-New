require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  try{
    const counts = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.template.count(),
      prisma.block.count(),
      prisma.question.count(),
      prisma.templateVersion.count(),
      prisma.briefInstance.count(),
      prisma.response.count(),
      prisma.auditLog.count()
    ]);

    const keys = ['tenants','users','templates','blocks','questions','templateVersions','briefInstances','responses','auditLogs'];
    const result = {};
    keys.forEach((k,i)=> result[k]=counts[i]);

    console.log('DB counts:', result);

    // show a few rows for non-zero tables
    if(result.templates>0){
      const t = await prisma.template.findMany({take:5, select:{id:true,name:true,published:true}});
      console.log('Templates sample:', t);
    }
    if(result.briefInstances>0){
      const b = await prisma.briefInstance.findMany({take:5, include:{user:{select:{name:true,email:true}}, _count:{select:{responses:true}}}});
      console.log('BriefInstances sample:', b);
    }
    if(result.users>0){
      const u = await prisma.user.findMany({take:5, select:{id:true,name:true,email:true,role:true}});
      console.log('Users sample:', u);
    }

  }catch(e){
    console.error('Error querying DB:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
