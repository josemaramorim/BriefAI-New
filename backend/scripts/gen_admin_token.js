require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
// Admin user id from DB
const adminId = 'cmjdvi9th00015yd3kywruqru';
const payload = { sub: adminId, name: 'Admin User', role: 'Admin', tenantId: 'cmjdvargw0000jb56y8uwua37' };
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
console.log(token);
