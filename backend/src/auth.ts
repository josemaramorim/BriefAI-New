import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import prisma from './prisma';
import i18n from './i18n';

const router = express.Router();

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Helper to get locale from request
function getLocale(req: Request): string {
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const lang = acceptLanguage.split(',')[0].trim();
    if (lang.startsWith('pt')) return 'pt-BR';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('en')) return 'en';
  }
  return 'pt-BR';
}

// Helper to translate
function t(req: Request, key: string): string {
  i18n.setLocale(getLocale(req));
  return i18n.__(key);
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, tenantId } = req.body;
    if (!email || !password || !tenantId) {
      return res.status(400).json({ error: t(req, 'errors.emailPasswordTenantRequired') });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: t(req, 'errors.userAlreadyExists') });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
        role: role || 'Respondente',
        tenantId
      }
    });
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      message: t(req, 'success.userCreated')
    });
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
};
router.post('/register', register);

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: t(req, 'errors.emailPasswordRequired') });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: t(req, 'errors.invalidCredentials') });
    }

    const ok = await bcrypt.compare(password, (user as any).password);
    if (!ok) {
      return res.status(401).json({ error: t(req, 'errors.invalidCredentials') });
    }

    const payload = {
      sub: user.id,
      name: user.name || user.email, // fallback para email se nome não existir
      role: user.role,
      tenantId: user.tenantId
    };
    const opts = { expiresIn: process.env.JWT_EXPIRES_IN || '3600s' } as any;
    const token = jwt.sign(payload as any, JWT_SECRET as any, opts as any);
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: t(req, 'errors.internalError') });
  }
};
router.post('/login', login);

// middleware to verify token and attach user info
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization');
  if (!auth) {
    return res.status(401).json({ error: t(req, 'errors.missingAuthHeader') });
  }

  const parts = auth.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: t(req, 'errors.invalidAuthHeader') });
  }

  const token = parts[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET as any);
    // attach user info to request
    (req as any).user = {
      id: payload.sub,
      name: payload.name,
      role: payload.role,
      tenantId: payload.tenantId
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: t(req, 'errors.invalidToken') });
  }
}

export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: t(req, 'errors.notAuthenticated') });
    }
    if (allowed.includes(user.role)) return next();
    return res.status(403).json({ error: t(req, 'errors.forbidden') });
  };
}

export default router;
