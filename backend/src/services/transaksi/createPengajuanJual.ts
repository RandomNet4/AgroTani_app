import prisma from '../../db';

export async function createPengajuanJual(data: any) {
  const {
    id, petaniId, petaniNama, komoditasId, komoditasNama, beratEstimasiKg,
    tanggalSiapPickup, fotoPanen, tanamanAktifId, lahanId, lahanNama,
    hargaAcuanKg, estimasiPendapatan, catatanPetani, metodePembayaran
  } = data;

  const petani = await prisma.petani.findUnique({ where: { id: petaniId } });
  const newPengajuan = await prisma.pengajuanJual.create({
    data: {
      id,
      petaniId,
      petaniNama,
      komoditasId,
      komoditasNama,
      beratEstimasiKg: parseFloat(beratEstimasiKg),
      tanggalSiapPickup,
      fotoPanen: fotoPanen || '🌾',
      status: 'pending',
      tanggalPengajuan: new Date().toISOString(),
      tanamanAktifId,
      lahanId,
      lahanNama,
      hargaAcuanKg: hargaAcuanKg ? parseFloat(hargaAcuanKg) : null,
      estimasiPendapatan: estimasiPendapatan ? parseFloat(estimasiPendapatan) : null,
      catatanPetani,
      metodePembayaran,
      gudangTujuanId: petani?.gudangTujuanId,
      gudangTujuanNama: petani?.gudangTujuanNama,
    }
  });

  // Otomatis perbarui status tanamanAktif menjadi 'selesai_panen' setelah diajukan jual
  try {
    if (tanamanAktifId) {
      await prisma.tanamanAktif.update({
        where: { id: tanamanAktifId },
        data: { statusVerifikasi: 'selesai_panen' }
      });
    } else {
      // Hanya update tanaman yang sudah melewati estimasi panen & sudah diverifikasi (approved)
      const today = new Date().toISOString().split('T')[0];
      const crop = await prisma.tanamanAktif.findFirst({
        where: {
          petaniId,
          komoditasNama: { contains: komoditasNama, mode: 'insensitive' },
          statusVerifikasi: 'approved',            // Hanya tanaman yang sudah diverifikasi
          estimasiPanen: { lte: today }            // Hanya yang sudah melewati/sama dengan hari ini
        },
        orderBy: { estimasiPanen: 'asc' }          // Ambil yang paling tua dulu
      });
      if (crop) {
        await prisma.tanamanAktif.update({
          where: { id: crop.id },
          data: { statusVerifikasi: 'selesai_panen' }
        });
      }
    }
  } catch (err) {
    console.warn('Tanaman status update skipped:', err);
  }

  return newPengajuan;
}
