import prisma from '../../db';
import { kodeTenderPetani, kodeNotifikasi } from '../../utils/kode';

export async function verifyTenderAdmin(id: string, status: string, alasanPenolakan?: string) {
  const tender = await prisma.tender.update({
    where: { id },
    data: {
      status,
      alasanPenolakan: status === 'ditolak' ? (alasanPenolakan || null) : null
    }
  });

  if (status === 'aktif') {
    // 1. Buat Rekomendasi Tanam hanya jika disetujui (aktif)
    const rekId = `REK_${id}`;
    
    const orConditions: any[] = [];
    if (tender.komoditasId !== 'UNKNOWN') {
      orConditions.push({ id: tender.komoditasId });
    }
    orConditions.push({ nama: { contains: tender.komoditasNama, mode: 'insensitive' } });

    const komoditasInfo = await prisma.komoditas.findFirst({
      where: { OR: orConditions }
    });

    const kategori = komoditasInfo ? komoditasInfo.kategori : 'sayuran';
    const supplySekarangKg = komoditasInfo ? komoditasInfo.totalEstimasiProduksiKg : 0;
    const targetKebutuhan = tender.kebutuhanKg;
    const selisihKg = Math.max(0, targetKebutuhan - supplySekarangKg);
    
    let prioritas = 'sedang';
    if (selisihKg > 1000) prioritas = 'tinggi';

    const rekData = {
      komoditasId: komoditasInfo ? komoditasInfo.id : tender.komoditasId,
      komoditasNama: tender.komoditasNama,
      kategori: kategori,
      alasan: tender.deskripsi,
      prioritas: prioritas,
      kebutuhanKg: targetKebutuhan,
      supplySekarangKg: supplySekarangKg,
      selisihKg: selisihKg,
      estimasiHargaJual: tender.hargaPerKg || (komoditasInfo ? komoditasInfo.hargaSaatIni : 0)
    };

    await prisma.rekomendasiTanam.upsert({
      where: { id: rekId },
      update: rekData,
      create: {
        id: rekId,
        ...rekData
      }
    });

    // 2. Distribusi Otomatis ke Petani yang SEDANG MENANAM komoditas tersebut (Tanaman Aktif & Belum Dipanen/Dijual)
    const rawCrops = await prisma.tanamanAktif.findMany({
      where: {
        komoditasNama: { contains: tender.komoditasNama, mode: 'insensitive' },
        statusVerifikasi: 'approved',
        NOT: [
          { statusVerifikasi: 'selesai_panen' },
          { statusVerifikasi: 'selesai' }
        ]
      }
    });

    // Exclude crops that already have a non-rejected harvest/sale submission (already harvested or sold)
    const activeSubmissions = await prisma.pengajuanJual.findMany({
      where: {
        tanamanAktifId: { in: rawCrops.map(c => c.id) },
        status: { notIn: ['rejected'] }
      }
    });
    const finishedCropIds = new Set(activeSubmissions.map(s => s.tanamanAktifId));

    const crops = rawCrops.filter(c => !finishedCropIds.has(c.id));

    // Sort by harvest date ascending (petani yang tanaman aktifnya paling siap panen mendapat alokasi duluan)
    crops.sort((a, b) => new Date(a.estimasiPanen).getTime() - new Date(b.estimasiPanen).getTime());

    let needed = tender.kebutuhanKg;
    // Batas waktu pemrosesan: <= 500kg = 2 hari, > 500kg = 3 hari
    const hari = tender.kebutuhanKg > 500 ? 3 : 2;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + hari);
    const batasWaktuStr = deadline.toISOString().split('T')[0];

    for (const crop of crops) {
      if (needed <= 0) break;

      const avail = crop.estimasiHasilKg;
      const allocated = Math.min(needed, avail);

      if (allocated > 0) {
        const petaniObj = await prisma.petani.findUnique({ where: { id: crop.petaniId } });
        const tpId = kodeTenderPetani(tender.komoditasNama);
        
        await prisma.tenderPetani.create({
          data: {
            id: tpId,
            tenderId: tender.id,
            petaniId: crop.petaniId,
            petaniNama: petaniObj?.nama || 'Petani',
            kesanggupanKg: allocated,
            statusApproval: 'pending', // Status 'pending' agar muncul di halaman "Pesanan Gudang" petani yang sedang menanam
            tanggalDaftar: new Date().toISOString(),
            batasWaktu: batasWaktuStr,
            catatanAdmin: `Disebar otomatis untuk tanaman aktif ${tender.komoditasNama}`
          }
        });

        // Kirim Notifikasi khusus ke Petani yang sedang menanam
        await prisma.notifikasi.create({
          data: {
            id: kodeNotifikasi(),
            petaniId: crop.petaniId,
            judul: `Permintaan Gudang Baru: ${tender.komoditasNama}`,
            pesan: `Permintaan gudang untuk ${tender.komoditasNama} sebesar ${allocated}kg disebar ke tanaman aktif Anda. Silakan buka menu Pesanan Gudang untuk menerima & memproses.`,
            tanggal: new Date().toISOString(),
            dibaca: false,
            tipe: 'info'
          }
        });

        needed -= allocated;
      }
    }
  }

  return tender;
}
