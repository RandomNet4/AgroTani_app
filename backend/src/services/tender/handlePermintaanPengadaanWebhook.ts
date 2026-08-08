import prisma from '../../db';
import { kodeNotifikasi } from '../../utils/kode';

export async function handlePermintaanPengadaanWebhook(data: any) {
  const {
    permintaanPengadaanId,
    komoditasNama,
    kodeKomoditasGlobal,
    targetKg,
    hargaAcuanPerKg,
    deadlinePanen,
    catatan,
    periode,
    gudangNama,
    trendArah,
    trendPersen
  } = data;

  let tender = await prisma.tender.findUnique({
    where: { id: permintaanPengadaanId }
  });

  if (tender) {
    tender = await prisma.tender.update({
      where: { id: permintaanPengadaanId },
      data: {
        kebutuhanKg: parseFloat(targetKg) || 0,
        hargaPerKg: parseFloat(hargaAcuanPerKg) || 0,
        tanggalBerakhir: deadlinePanen || '',
        deskripsi: catatan ? `[Permintaan Gudang: ${gudangNama || 'AgroGudang'}] ${catatan}` : `[Permintaan Gudang] Kebutuhan pengadaan dari Gudang ${gudangNama || 'AgroGudang'}`,
        periodePanen: periode || '',
        status: 'pending' // Force back to pending on update from Gudang
      }
    });
  } else {
    tender = await prisma.tender.create({
      data: {
        id: permintaanPengadaanId,
        komoditasId: kodeKomoditasGlobal || 'UNKNOWN',
        komoditasNama: komoditasNama || '',
        kebutuhanKg: parseFloat(targetKg) || 0,
        terpenuhinKg: 0,
        hargaPerKg: parseFloat(hargaAcuanPerKg) || 0,
        tanggalBerakhir: deadlinePanen || '',
        deskripsi: catatan ? `[Permintaan Gudang: ${gudangNama || 'AgroGudang'}] ${catatan}` : `[Permintaan Gudang] Kebutuhan pengadaan dari Gudang ${gudangNama || 'AgroGudang'}`,
        periodePanen: periode || '',
        status: 'pending' // Admin needs to verify
      }
    });
  }

  // Notifikasi untuk Admin Petani
  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: null, // Notifikasi untuk Admin — permintaan gudang masuk
      judul: 'Permintaan Gudang Baru',
      pesan: `Permintaan ${komoditasNama} sebanyak ${targetKg}kg menunggu verifikasi Anda.`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: 'info'
    }
  });

  return tender;
}
