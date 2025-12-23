import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        tenantId: string;
      }
    }
  }
}

export {};
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; tenantId?: string };
    }
  }
}

export {};
