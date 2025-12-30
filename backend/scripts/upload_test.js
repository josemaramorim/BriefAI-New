const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    const api = axios.create({ baseURL: 'http://localhost:3001' });

    // Get a token (reuse admin token generation logic or just use a dummy if auth is disabled for local/test)
    // For simplicity, let's assume we need a real token.
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (!user) {
        console.error('No admin user found to test upload');
        return;
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const formData = new FormData();
    formData.append('image', fs.createReadStream(__filename)); // upload this script itself as an image
    formData.append('templateId', 'test-tpl-id');

    try {
        console.log('Attempting upload...');
        const res = await api.post('/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Upload Result:', res.data);
    } catch (error) {
        console.error('Upload Error:', error.response ? error.response.data : error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
