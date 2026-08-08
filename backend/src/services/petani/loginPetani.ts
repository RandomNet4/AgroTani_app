import prisma from '../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agro_tani_secret_key_123';

export async function loginPetani(phone: string, passwordPlain: string) {
  const p = await prisma.petani.findFirst({
    where: {
      OR: [
        { noHp: phone },
        { email: phone }
      ]
    }
  });

  if (!p) {
    throw { status: 404, message: 'Petani tidak ditemukan dengan nomor HP atau email tersebut.' };
  }

  const isMatch = await bcrypt.compare(passwordPlain, p.password);
  if (!isMatch) {
    throw { status: 401, message: 'Nomor telepon/email tidak terdaftar atau kata sandi salah.' };
  }

  if (p.statusVerifikasi !== 'approved') {
    let errorMsg = 'Akun Anda belum aktif.';
    if (p.statusVerifikasi === 'pending') {
      errorMsg = 'Akun Anda belum disetujui oleh Admin. Silakan tunggu proses verifikasi selesai.';
    } else if (p.statusVerifikasi === 'rejected') {
      errorMsg = `Pendaftaran Anda ditolak oleh Admin. Catatan: ${p.catatanVerifikasi || '-'}`;
    } else if (p.statusVerifikasi === 'survey') {
      errorMsg = 'Akun Anda sedang dalam proses survey lapangan oleh tim verifikasi.';
    }
    throw { status: 403, message: errorMsg };
  }

  const token = jwt.sign({ id: p.id, role: 'petani' }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _pw, ...petaniSafe } = p;
  return { token, petani: petaniSafe };
}
