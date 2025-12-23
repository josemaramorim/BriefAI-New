require('dotenv').config();
const fetch = global.fetch || require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const templateId = process.argv[2] || 'cmjekgysg000113503o7x6hjx';
const name = process.argv[3] || 'Auto Test User';
const email = process.argv[4] || 'autotest+user@example.com';

async function callHttp(){
  try{
    console.log('Calling HTTP POST', `${BASE}/brief-instances/start`, { templateId, name, email });
    const res = await fetch(`${BASE}/brief-instances/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, name, email })
    });
    const text = await res.text();
    try{ console.log('HTTP status', res.status, JSON.parse(text)); }catch(e){ console.log('HTTP status', res.status, text); }
    return true;
  }catch(e){
    console.warn('HTTP call failed:', e.message || e);
    return false;
  }
}

async function localSimulate(){
  try{
    console.log('Server not available — simulating logic locally via Prisma.');
    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if(!template){ console.log('Template not found:', templateId); return; }

    const latestVersion = await prisma.templateVersion.findFirst({ where: { templateId }, orderBy: { createdAt: 'desc' } });
    console.log('LatestVersion id (may be null):', latestVersion ? latestVersion.id : null);

    // find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if(!user){
      user = await prisma.user.create({ data: { email, name, role: 'Respondente', tenantId: template.tenantId, password: `magic-${Math.random().toString(36).slice(2,9)}` } });
      console.log('Created user id:', user.id);
    } else console.log('Found user id:', user.id);

    const instances = await prisma.briefInstance.findMany({ where: { templateId, userId: user.id, status: 'draft' }, include: { responses: true }, orderBy: { createdAt: 'desc' } });
    let instance = instances.find(i => i.responses && i.responses.length>0) || instances[0];
    if(!instance){
      instance = await prisma.briefInstance.create({ data: { templateId, versionId: latestVersion?.id || null, userId: user.id, tenantId: template.tenantId, status: 'draft' }, include: { responses: true } });
      console.log('Created instance id:', instance.id, 'versionId:', instance.versionId);
    }else{
      console.log('Using existing instance id:', instance.id, 'versionId:', instance.versionId);
    }
  }catch(e){
    console.error('Local simulation error:', e);
  }finally{
    await prisma.$disconnect();
  }
}

(async ()=>{
  const ok = await callHttp();
  if(!ok) await localSimulate();
})();
