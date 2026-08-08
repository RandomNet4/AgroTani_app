import prisma from '../../db';
import { sendAccountApprovalEmail } from '../../utils/email';
import { kodeNotifikasi } from '../../utils/kode';

export async function verifyPetani(id: string, data: any) {
  const { status, catatanVerifikasi, gudangTujuanId, gudangTujuanNama } = data;
  const updated = await prisma.petani.update({
    where: { id },
    data: {
      statusVerifikasi: status,
      tanggalVerifikasi: new Date().toISOString(),
      catatanVerifikasi,
      gudangTujuanId,
      gudangTujuanNama
    }
  });

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: updated.id,
      judul: status === 'approved' ? '[Verifikasi Petani] Akun Disetujui' : '[Verifikasi Petani] Pendaftaran Ditolak',
      pesan: status === 'approved' 
        ? `[Petani: ${updated.nama}] Akun telah diverifikasi resmi oleh Admin. Gudang Hub Tujuan: ${gudangTujuanNama || 'Gudang Utama Cianjur'}.`
        : `[Petani: ${updated.nama}] Pendaftaran akun ditolak Admin. Catatan: ${catatanVerifikasi || '-'}`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: status === 'approved' ? 'success' : 'danger'
    }
  });

  if (status === 'approved' && updated.email) {
    sendAccountApprovalEmail(
      updated.email,
      updated.nama,
      updated.id,
      updated.alamat,
      gudangTujuanNama || updated.gudangTujuanNama || 'Gudang Cianjur',
      updated.noHp
    ).catch((emailErr) => {
      console.error('Gagal mengirimkan email aktivasi akun:', emailErr);
    });
  }

  return updated;
}
