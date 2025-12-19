import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, tenantId } = req.body;
    if (!email || !password || !tenantId) return res.status(400).json({ error: 'email, password and tenantId are required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name: name || null, role: role || 'Respondente', tenantId } });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, role: user.role, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '3600s' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// middleware to verify token and attach user info
export function authMiddleware(req: any, res: any, next: any) {
  const auth = req.header('authorization');
  if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization header' });
  const token = parts[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, tenantId: payload.tenantId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...allowed: string[]) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (allowed.includes(user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

export default router;
