import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding manual...');

    // Create Tenants
    const tenantA = await prisma.tenant.upsert({
        where: { id: 'tenant-a' },
        update: {},
        create: { id: 'tenant-a', name: 'Tenant A' },
    });
    console.log('Tenant A created/found:', tenantA.id);

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@briefai.com' },
        update: {},
        create: {
            email: 'admin@briefai.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'Admin',
            tenantId: tenantA.id,
        },
    });
    console.log('Admin user created/found:', admin.email);

    // Create Template (only if none exists for this tenant)
    const existingTemplate = await prisma.template.findFirst({
        where: { tenantId: tenantA.id }
    });

    if (!existingTemplate) {
        const template = await prisma.template.create({
            data: {
                tenantId: tenantA.id,
                name: 'Template Exemplo',
                description: 'Template criado via seed manual',
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
        console.log('Template already exists, skipping creation.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
