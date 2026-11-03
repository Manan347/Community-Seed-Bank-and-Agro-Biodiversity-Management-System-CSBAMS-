import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { fail } from '../utils/helpers.js';
const secret = () => process.env.JWT_SECRET || 'local-dev-secret-change-me';
export const issueToken = (user) => jwt.sign({ userId: user.user_id, role: user.role, name: user.name }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
export function requireAuth(req, _res, next) { try { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) throw fail('Missing token', 'UNAUTHORIZED', 401); req.user = jwt.verify(token, secret()); const active = db.prepare('SELECT status FROM users WHERE user_id=?').get(req.user.userId); if (!active || active.status !== 'Active') throw fail('Account is not active', 'ACCOUNT_INACTIVE', 403); next(); } catch (e) { next(e.code ? e : fail('Invalid token', 'UNAUTHORIZED', 401)); } }
export const allow = (...roles) => (req, _res, next) => roles.includes(req.user.role) ? next() : next(fail('Not permitted', 'FORBIDDEN', 403));
