import prisma from '../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendRegistrationEmail } from '../../utils/email';
import { kodeDataPetani, kodeLahan, kodeNotifikasi } from '../../utils/kode';

const JWT_SECRET = process.env.JWT_SECRET || 'agro_tani_secret_key_123';

export async function registerPetani(data: any) {
  const {
    nama, nik, noHp, email, alamat, kecamatan, kabupaten, provinsi, fotoProfil, fotoKtp, password,
    namaLahan, jenisLahan, luasHektar, latitude, longitude, alamatLahan, fotoLahan
  } = data;

  const existing = await prisma.petani.findFirst({ where: { noHp } });
  if (existing) {
    throw { status: 400, message: 'Nomor telepon sudah terdaftar.' };
  }

  // Validasi NIK unik
  const existingNik = await prisma.petani.findFirst({ where: { nik } });
  if (existingNik) {
    throw { status: 400, message: 'NIK sudah terdaftar dalam sistem.' };
  }

  // Validasi format email dasar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    throw { status: 400, message: 'Format email tidak valid.' };
  }

  const count = await prisma.petani.count();
  let petaniId = `PTN-${String(count + 1).padStart(4, '0')}`;
  const existId = await prisma.petani.findUnique({ where: { id: petaniId } });
  if (existId) {
    petaniId = kodeDataPetani();
  }
  const hashedPassword = await bcrypt.hash(password || 'password123', 10);

  const kepalaPetani = await prisma.petani.findFirst({
    where: { role: 'kepala_petani' }
  });

  const newPetani = await prisma.petani.create({
    data: {
      id: petaniId,
      nama,
      nik,
      noHp,
      email,
      alamat,
      kecamatan,
      kabupaten,
      provinsi: provinsi || 'Jawa Barat',
      fotoProfil: fotoProfil || '👨‍🌾',
      fotoKtp: fotoKtp || 'ktp_placeholder.jpg',
      password: hashedPassword,
      statusVerifikasi: 'pending',
      tanggalDaftar: new Date().toISOString(),
      kepalaPetaniId: kepalaPetani ? kepalaPetani.id : null,
    }
  });

  if (namaLahan) {
    const lahanId = kodeLahan();
    await prisma.lahan.create({
      data: {
        id: lahanId,
        petaniId: petaniId,
        namaLahan,
        latitude: parseFloat(latitude || '0'),
        longitude: parseFloat(longitude || '0'),
        alamat: alamatLahan || alamat,
        luasHektar: parseFloat(luasHektar || '0'),
        jenisLahan: jenisLahan || 'sawah',
        kecamatan,
        kabupaten,
        statusVerifikasi: 'pending',
        fotoLahan: fotoLahan || '🌾'
      }
    });
  }

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: petaniId,
      judul: 'Pendaftaran Berhasil',
      pesan: `Selamat datang ${nama}! Pendaftaran Anda sedang dalam proses verifikasi oleh Admin.`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: 'info'
    }
  });

  if (email) {
    sendRegistrationEmail(email, nama, noHp, password || 'password123')
      .catch((emailErr) => {
        console.error('Pemberitahuan email gagal dikirim:', emailErr);
      });
  }

  const token = jwt.sign({ id: newPetani.id, role: 'petani' }, JWT_SECRET, { expiresIn: '7d' });
  return { token, petani: newPetani };
}
