const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Hash fixo (gerado anteriormente)
const ADMIN_PASSWORD_HASH = '$2a$10$kV0CE/c8AU3V0lxElrj2WurAU552kjW6HFxoWh5dQGKPy.mmE6KA.';

async function main() {
    console.log('Starting JS Seed...');

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
        const existingUser = await prisma.user.findUnique({ where: { email: 'admin@briefai.com' } });

        let admin;
        if (existingUser) {
            console.log('User already exists, updating password hash...');
            admin = await prisma.user.update({
                where: { email: 'admin@briefai.com' },
                data: { password: ADMIN_PASSWORD_HASH }
            });
        } else {
            admin = await prisma.user.create({
                data: {
                    email: 'admin@briefai.com',
                    password: ADMIN_PASSWORD_HASH,
                    name: 'Admin User',
                    role: 'Admin',
                    tenantId: tenantA.id,
                },
            });
            console.log('User Created');
        }
        console.log('Admin Email:', admin.email);

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
                    description: 'Template criado via seed JS',
                    published: true,
                    blocks: {
                        create: [
                            {
                                title: 'Bloco 1',
                                order: 0,
                                questions: {
                                    create: [
                                        { text: 'Qual seu nome?', type: 'text', required: true, order: 0 },
                                        { text: 'Idade?', type: 'number', required: false, order: 1 }
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

        console.log('SEED COMPLETED SUCCESSFULLY.');

    } catch (error) {
        console.error('SEED ERROR:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
