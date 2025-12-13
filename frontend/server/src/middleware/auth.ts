import type { Request, Response, NextFunction } from 'express';
import { getApps } from 'firebase-admin/app';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Ensure Firebase Admin is initialized before verifying tokens
function ensureFirebaseAdminInit() {
  if (getApps().length === 0) {
    try {
      const credPath = process.env.FIREBASE_CREDENTIALS_PATH || path.join(process.cwd(), 'server/firebase_credentials.json');
      if (!fs.existsSync(credPath)) {
        logger.error({ credPath }, '[auth] Firebase credentials not found');
        return;
      }
      const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
      initializeApp({ credential: cert(serviceAccount) });
      logger.info('[auth] Firebase Admin initialized');
    } catch (e) {
      logger.error({ err: e }, '[auth] Failed to initialize Firebase Admin');
    }
  }
}

export interface AuthUserInfo {
  uid: string;
  email?: string;
  role?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUserInfo;
  }
}

export async function authMiddleware(
  req: Request & { user?: AuthUserInfo },
  res: Response,
  next: NextFunction
) {
  try {
    ensureFirebaseAdminInit();
    const header = req.headers['authorization'] || '';
    if (!header || !header.toString().startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing bearer token' });
    }

    const token = header.toString().slice('Bearer '.length).trim();
    const decoded = await getAuth().verifyIdToken(token);

    const role = (decoded as any)?.role || (decoded as any)?.claims?.role || 'user';
    req.user = { uid: decoded.uid, email: decoded.email, role };
    return next();
  } catch (e) {
    logger.warn({ err: e }, '[auth] token verification failed');
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
}

// Optional: endpoint helper to require admin role (not wired by default)
export function requireAdmin(
  req: Request & { user?: AuthUserInfo },
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin role required' });
  }
  next();
}