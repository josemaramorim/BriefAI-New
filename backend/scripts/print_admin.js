require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async ()=>{
  try{
    const u = await prisma.user.findUnique({ where: { email: 'admin@brief.com' } });
    console.log('USER:', { id: u.id, email: u.email, password: u.password });
  }catch(e){
    console.error('Error:', e);
  }finally{
    await prisma.$disconnect();
  }
})();
