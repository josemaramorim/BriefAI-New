import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hash pre-gerado para 'admin123'
const ADMIN_PASSWORD_HASH = '$2a$10$kV0CE/c8AU3V0lxElrj2WurAU552kjW6HFxoWh5dQGKPy.mmE6KA.';

async function main() {
    console.log('Starting FINAL Manual Seed...');

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
        // Verifica se usuario existe
        const existingUser = await prisma.user.findUnique({ where: { email: 'admin@briefai.com' } });

        let admin;
        if (existingUser) {
            console.log('User already exists, updating password hash just in case...');
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
                    description: 'Template criado via seed manual final',
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

        // 4. Verificação Final Verbos
        const userCount = await prisma.user.count();
        const tenantCount = await prisma.tenant.count();

        console.log('--- FINAL STATS ---');
        console.log('Users in DB:', userCount);
        console.log('Tenants in DB:', tenantCount);
        console.log('Seed completed successfully.');

    } catch (error) {
        console.error('SEED ERROR:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
