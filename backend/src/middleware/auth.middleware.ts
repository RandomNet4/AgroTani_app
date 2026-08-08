import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agro_tani_secret_key_123';

/**
 * Middleware: Verifikasi JWT token untuk petani.
 * Digunakan pada endpoint yang membutuhkan autentikasi petani.
 */
export const authPetani = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login kembali.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    (req as any).petaniId = decoded.id;
    (req as any).role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

/**
 * Middleware: Verifikasi JWT token Admin.
 * Admin menggunakan token JWT yang sama namun dengan role='admin'.
 */
export const authAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Token admin tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang diizinkan.' });
    }
    (req as any).adminId = decoded.id;
    (req as any).role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token admin tidak valid atau sudah kadaluarsa.' });
  }
};

/**
 * Middleware: Validasi API Key untuk incoming webhook dari Gudang.
 */
export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.PETANI_API_KEY || 'gudang_secret_key_v1';

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing API key',
    });
  }

  next();
};
