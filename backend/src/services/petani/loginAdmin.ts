import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agro_tani_secret_key_123';

/**
 * Login Admin — memverifikasi email & password dari environment variable.
 * Mengembalikan JWT dengan role='admin' untuk dipakai sebagai Authorization header.
 */
export async function loginAdmin(email: string, password: string) {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@agrotani.id';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw { status: 401, message: 'Email atau password admin salah.' };
  }

  const token = jwt.sign({ id: 'ADMIN', role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  return { token, admin: { id: 'ADMIN', nama: 'Admin Agro', role: 'admin' } };
}
