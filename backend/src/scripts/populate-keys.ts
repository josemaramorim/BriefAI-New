import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(s: string) {
    return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
    console.log('--- Starting Block Key Population ---');

    const templates = await prisma.template.findMany({
        include: {
            blocks: {
                where: {
                    OR: [
                        { key: null },
                        { key: '' }
                    ]
                }
            }
        }
    });

    console.log(`Found ${templates.length} templates with blocks missing keys.`);

    for (const template of templates) {
        if (template.blocks.length === 0) continue;

        console.log(`Processing template: ${template.name} (${template.id})`);

        // Get all existing keys in this template to avoid collisions
        const existingBlocks = await prisma.block.findMany({
            where: { templateId: template.id },
            select: { key: true }
        });
        const usedKeys = new Set(existingBlocks.map(b => b.key).filter(Boolean) as string[]);

        for (const block of template.blocks) {
            let baseKey = slugify(block.title) || 'block';
            let uniqueKey = baseKey;
            let counter = 1;

            while (usedKeys.has(uniqueKey)) {
                uniqueKey = `${baseKey}-${counter}`;
                counter++;
            }

            console.log(`  Updating block "${block.title}" -> ${uniqueKey}`);

            await prisma.block.update({
                where: { id: block.id },
                data: { key: uniqueKey }
            });

            usedKeys.add(uniqueKey);
        }
    }

    console.log('--- Population Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
