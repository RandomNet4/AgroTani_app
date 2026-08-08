import prisma from '../../db';
import { mapLahan } from '../../utils/mappers';
import { kodeNotifikasi } from '../../utils/kode';

export async function verifyLahan(id: string, status: string) {
  const updated = await prisma.lahan.update({
    where: { id },
    data: { statusVerifikasi: status }
  });

  const lahan = await prisma.lahan.findUnique({ where: { id } });
  if (lahan) {
    await prisma.notifikasi.create({
      data: {
        id: kodeNotifikasi(),
        petaniId: lahan.petaniId,
        judul: status === 'approved' ? 'Lahan Terverifikasi' : 'Verifikasi Lahan Gagal',
        pesan: `Pengajuan lahan ${lahan.namaLahan} Anda statusnya kini: ${status}`,
        tanggal: new Date().toISOString(),
        dibaca: false,
        tipe: status === 'approved' ? 'success' : 'warning'
      }
    });
  }

  return mapLahan(updated);
}
