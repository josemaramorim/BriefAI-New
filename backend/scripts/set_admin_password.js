require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = 'admin@brief.com';
const NEW_PASSWORD = 'admin123';

(async ()=>{
  try{
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    if(!user){
      console.error('User not found:', EMAIL);
      process.exit(1);
    }
    await prisma.user.update({ where: { email: EMAIL }, data: { password: hash } });
    console.log('Password updated and hashed for', EMAIL);
  }catch(e){
    console.error('Error updating password:', e);
  }finally{
    await prisma.$disconnect();
  }
})();
