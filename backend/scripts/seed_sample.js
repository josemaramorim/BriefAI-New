require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  try{
    // Create tenant
    let tenant = await prisma.tenant.findFirst({ where: { name: 'Local Seed Tenant' } });
    if(!tenant){
      tenant = await prisma.tenant.create({ data: { name: 'Local Seed Tenant' } });
    }

    // Create admin user
    let admin = await prisma.user.findUnique({ where: { email: 'admin@brief.com' } });
    if(!admin){
      admin = await prisma.user.create({ data: { email: 'admin@brief.com', name: 'Seed Admin', password: 'admin123', role: 'Admin', tenantId: tenant.id } });
    }

    // Create a template with blocks and questions
    const template = await prisma.template.create({
      data: {
        tenantId: tenant.id,
        name: 'Template de Exemplo - Seed',
        description: 'Template criado pelo seed_sample.js',
        allowDraftResponses: true,
        published: false,
        blocks: {
          create: [
            {
              title: 'Bloco 1',
              description: 'Primeiro bloco',
              order: 0,
              questions: {
                create: [
                  { text: 'Qual é o seu nome?', type: 'text', required: true },
                  { text: 'Descreva o seu projeto', type: 'textarea', required: false }
                ]
              }
            },
            {
              title: 'Bloco 2',
              description: 'Segundo bloco',
              order: 1,
              questions: {
                create: [
                  { text: 'Qual o orçamento estimado?', type: 'number', required: false }
                ]
              }
            }
          ]
        },
        rules: {
          create: []
        }
      }
    });

    console.log('Seed completed. TemplateId=', template.id);
  }catch(e){
    console.error('Seed failed:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
