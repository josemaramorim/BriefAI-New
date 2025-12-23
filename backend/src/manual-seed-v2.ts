import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Manual Seed V2...');

    try {
        // 1. Tenant
        console.log('Upserting Tenant...');
        const tenantA = await prisma.tenant.upsert({
            where: { id: 'tenant-a' },
            update: {},
            create: { id: 'tenant-a', name: 'Tenant A' },
        });
        console.log('Tenant OK:', tenantA.id);

        // 2. User
        console.log('Upserting Admin User...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        // We look up first to avoid hash churn if user exists
        const existingUser = await prisma.user.findUnique({ where: { email: 'admin@briefai.com' } });

        let admin;
        if (existingUser) {
            console.log('User already exists, skipping create.');
            admin = existingUser;
            // Optional: update password if needed
            // await prisma.user.update({ where: { email: ... }, data: { password: hashedPassword } });
        } else {
            admin = await prisma.user.create({
                data: {
                    email: 'admin@briefai.com',
                    password: hashedPassword,
                    name: 'Admin User',
                    role: 'Admin',
                    tenantId: tenantA.id,
                },
            });
            console.log('User Created:', admin.email);
        }

        // 3. Template
        console.log('Checking Template...');
        const existingTemplate = await prisma.template.findFirst({
            where: { tenantId: tenantA.id }
        });

        if (!existingTemplate) {
            console.log('Creating Template...');
            const template = await prisma.template.create({
                data: {
                    tenantId: tenantA.id,
                    name: 'Template Exemplo',
                    description: 'Template criado via seed manual v2',
                    published: true,
                    blocks: {
                        create: [
                            {
                                title: 'Bloco 1',
                                order: 0,
                                questions: {
                                    create: [
                                        { text: 'Qual seu nome?', type: 'text', required: true },
                                        { text: 'Idade?', type: 'number', required: false }
                                    ]
                                }
                            }
                        ]
                    }
                }
            });
            console.log('Template created:', template.id);
        } else {
            console.log('Template already exists:', existingTemplate.id);
        }

        console.log('Seed completed successfully.');
    } catch (error) {
        console.error('SEED ERROR:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
