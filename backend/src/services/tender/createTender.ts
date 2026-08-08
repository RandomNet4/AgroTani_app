import prisma from '../../db';
import { kodeNotifikasi } from '../../utils/kode';

export async function createTender(data: any) {
  const { id, komoditasId, komoditasNama, kebutuhanKg, periodePanen, tanggalBerakhir, deskripsi, hargaPerKg } = data;
  const newTender = await prisma.tender.create({
    data: {
      id,
      komoditasId,
      komoditasNama,
      kebutuhanKg: parseFloat(kebutuhanKg),
      terpenuhinKg: 0,
      periodePanen,
      tanggalBerakhir,
      status: 'aktif',
      deskripsi,
      hargaPerKg: parseFloat(hargaPerKg)
    }
  });

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: null, // Notifikasi admin — tender baru dibuat
      judul: 'Tender Baru Dibuka',
      pesan: `Tersedia tender ${komoditasNama} ${parseFloat(kebutuhanKg).toLocaleString()}kg untuk panen periode ${periodePanen}.`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: 'warning'
    }
  });

  return newTender;
}
