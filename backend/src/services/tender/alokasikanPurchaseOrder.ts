import prisma from '../../db';
import { kodeTenderPetani, kodePenjualan, kodeNotifikasi, formatPOCode } from '../../utils/kode';

export async function alokasikanPurchaseOrder(poId: string, payload: any) {
  const { allocations } = payload;
  if (!allocations || !Array.isArray(allocations)) {
    throw { status: 400, message: 'Alokasi tidak valid' };
  }

  const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
  if (!po) {
    throw { status: 404, message: 'Purchase Order tidak ditemukan' };
  }

  let items: any[] = [];
  try {
    items = JSON.parse(po.itemsJson) || [];
  } catch (e) {
    items = [];
  }

  const results = [];

  for (const alloc of allocations) {
    const { petaniId, tanamanAktifId, beratKg, tanggalPanen } = alloc;

    // 1. Get TanamanAktif details
    const tanaman = await prisma.tanamanAktif.findUnique({ where: { id: tanamanAktifId } });
    if (!tanaman) continue;

    // 2. Get Petani details
    const petani = await prisma.petani.findUnique({ where: { id: petaniId } });
    if (!petani) continue;

    // 3. Get Lahan details
    const lahan = await prisma.lahan.findUnique({ where: { id: tanaman.lahanId } });
    const lahanNama = lahan?.namaLahan || 'Lahan Petani';

    const cleanPOCode = formatPOCode(po.nomorReq || po.id, tanaman.komoditasNama);

    // 4. Get Komoditas current price
    const komoditas = await prisma.komoditas.findFirst({
      where: { nama: { contains: tanaman.komoditasNama, mode: 'insensitive' } }
    });
    const itemInfo = items.find(i => i.komoditasNama?.toLowerCase() === tanaman.komoditasNama?.toLowerCase());
    const defaultPrice = tanaman.komoditasNama?.toLowerCase().includes('buncis') ? 15000 : tanaman.komoditasNama?.toLowerCase().includes('jagung') ? 8000 : 12000;
    const hargaPerKg = itemInfo?.hargaPerKg && itemInfo.hargaPerKg > 2000 ? itemInfo.hargaPerKg : (komoditas?.hargaSaatIni && komoditas.hargaSaatIni > 2000 ? komoditas.hargaSaatIni : defaultPrice);

    // 5. Ensure a Tender record exists for this PO & Komoditas so getTenderInfo can retrieve it
    const tenderId = `TDR_${cleanPOCode}_${tanaman.komoditasNama.replace(/\s+/g, '_')}`;
    let tender = await prisma.tender.findUnique({ where: { id: tenderId } });

    if (!tender) {
      tender = await prisma.tender.create({
        data: {
          id: tenderId,
          komoditasId: tanaman.komoditasId,
          komoditasNama: tanaman.komoditasNama,
          kebutuhanKg: parseFloat(beratKg) || 100,
          terpenuhinKg: 0,
          periodePanen: tanggalPanen || po.estimasiPengantaran,
          tanggalBerakhir: po.estimasiPengantaran || tanggalPanen,
          status: 'aktif',
          deskripsi: `Permintaan PO Gudang (${cleanPOCode}) untuk ${po.penerimaKontrak}`,
          hargaPerKg: hargaPerKg
        }
      });
    } else {
      // Update demand & price
      tender = await prisma.tender.update({
        where: { id: tenderId },
        data: {
          kebutuhanKg: tender.kebutuhanKg + parseFloat(beratKg)
        }
      });
    }

    // 6. Create TenderPetani record with statusApproval 'pending' so it flows to /petani/pesanan-gudang!
    const tpId = kodeTenderPetani(tanaman.komoditasNama);
    const tenderPetani = await prisma.tenderPetani.create({
      data: {
        id: tpId,
        tenderId: tender.id,
        petaniId: petani.id,
        petaniNama: petani.nama,
        kesanggupanKg: parseFloat(beratKg),
        statusApproval: 'pending', // Pending status so farmer accepts and processes on /petani/pesanan-gudang!
        tanggalDaftar: new Date().toISOString(),
        batasWaktu: tanggalPanen,
        catatanAdmin: `Surat Order Gudang ${cleanPOCode}`
      }
    });

    // 6.5 Create corresponding PengajuanJual (PO_GUDANG) so pesanan-gudang & jual-panen are 100% synced!
    const pjId = kodePenjualan(tanaman.komoditasNama);
    await prisma.pengajuanJual.create({
      data: {
        id: pjId,
        petaniId: petani.id,
        petaniNama: petani.nama,
        komoditasId: tanaman.komoditasId,
        komoditasNama: tanaman.komoditasNama,
        beratEstimasiKg: parseFloat(beratKg),
        tanggalSiapPickup: tanggalPanen || po.estimasiPengantaran || new Date().toISOString().split('T')[0],
        fotoPanen: '📦',
        status: 'pending',
        tanggalPengajuan: new Date().toISOString(),
        catatanAdmin: `Pemenuhan PO Gudang (${cleanPOCode})`,
        metodePembayaran: 'Cash',
        tanamanAktifId: tanaman.id,
        lahanId: tanaman.lahanId,
        lahanNama: lahanNama,
        hargaAcuanKg: hargaPerKg,
        estimasiPendapatan: parseFloat(beratKg) * hargaPerKg,
        catatanPetani: `[PEMENUHAN PO GUDANG] Order ID: ${cleanPOCode}`,
        gudangTujuanNama: 'Gudang Cianjur',
        tipePenjualan: 'PO_GUDANG'
      }
    });

    // 7. Create targeted notification for Petani
    await prisma.notifikasi.create({
      data: {
        id: kodeNotifikasi(),
        petaniId: petani.id,
        judul: 'Pesanan PO Gudang Baru',
        pesan: `[PO ${po.nomorReq}] Anda menerima alokasi pesanan Gudang untuk ${tanaman.komoditasNama} sebesar ${beratKg}kg di ${lahanNama}. Silakan buka menu Pesanan Gudang untuk menerima & memproses.`,
        tanggal: new Date().toISOString(),
        dibaca: false,
        tipe: 'info'
      }
    });

    results.push(tenderPetani);
  }

  // Update PO status to PROSES if PENDING
  if (po.status === 'PENDING') {
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'PROSES' }
    });
  }

  return { success: true, processedCount: results.length };
}
