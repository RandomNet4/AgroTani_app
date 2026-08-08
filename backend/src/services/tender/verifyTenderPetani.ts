import prisma from '../../db';
import {
  kodePenjualan, kodePickup, kodePembayaran,
  kodeInvoice, kodeNotifikasi, formatPOCode
} from '../../utils/kode';

export async function verifyTenderPetani(id: string, data: any) {
  const { status, catatanAdmin } = data;

  let tenderPetani = await prisma.tenderPetani.findUnique({ where: { id } });

  if (!tenderPetani) {
    // Coba cari berdasarkan partial match (legacy fallback yang aman — hanya berdasarkan ID cocok)
    const tpList = await prisma.tenderPetani.findMany();
    const match = tpList.find(t => t.id === id || id.includes(t.id) || t.id.includes(id));
    
    if (!match) {
      throw { status: 404, message: `TenderPetani dengan ID '${id}' tidak ditemukan.` };
    }
    
    tenderPetani = await prisma.tenderPetani.update({
      where: { id: match.id },
      data: {
        statusApproval: status,
        catatanAdmin: catatanAdmin || match.catatanAdmin
      }
    });
  } else {
    tenderPetani = await prisma.tenderPetani.update({
      where: { id },
      data: {
        statusApproval: status,
        catatanAdmin: catatanAdmin || tenderPetani.catatanAdmin
      }
    });
  }
  if (tenderPetani) {
    const tender = await prisma.tender.findUnique({ where: { id: tenderPetani.tenderId } });
    if (tender) {
      // Flow data ke Penjualan Petani (PengajuanJual) dengan kode PJB yang rapi
      const cleanPOCode = formatPOCode(tender.id.replace('TDR_', ''), tender.komoditasNama);
      const existingPJ = await prisma.pengajuanJual.findFirst({
        where: {
          petaniId: tenderPetani.petaniId,
          catatanAdmin: { contains: cleanPOCode }
        }
      });

      const farmer = await prisma.petani.findUnique({ where: { id: tenderPetani.petaniId } });
      const crop = await prisma.tanamanAktif.findFirst({
        where: {
          petaniId: tenderPetani.petaniId,
          komoditasNama: { contains: tender.komoditasNama, mode: 'insensitive' }
        }
      });
      const lahan = crop ? await prisma.lahan.findUnique({ where: { id: crop.lahanId } }) : null;

      const salesStatus = status === 'selesai' ? 'selesai' : (status === 'dikirim' || status === 'proses_timbang') ? 'proses_timbang' : status === 'survey' ? 'survey' : status === 'approved' ? 'approved' : 'pending';

      const pjId = kodePenjualan(tender.komoditasNama);
      let currentPJId = existingPJ ? existingPJ.id : pjId;

      if (!existingPJ) {
        const cleanPOCode = formatPOCode(tender.id.replace('TDR_', ''), tender.komoditasNama);
        const unitPrice = (tender.hargaPerKg && tender.hargaPerKg > 2000)
          ? tender.hargaPerKg
          : (tender.komoditasNama.toLowerCase().includes('buncis') ? 15000 : tender.komoditasNama.toLowerCase().includes('jagung') ? 8000 : 12000);

        const newPJ = await prisma.pengajuanJual.create({
          data: {
            id: pjId,
            petaniId: tenderPetani.petaniId,
            petaniNama: tenderPetani.petaniNama,
            komoditasId: crop?.komoditasId || tender.komoditasId || 'KMD001',
            komoditasNama: tender.komoditasNama,
            beratEstimasiKg: tenderPetani.kesanggupanKg,
            tanggalSiapPickup: tenderPetani.batasWaktu || new Date().toISOString().split('T')[0],
            fotoPanen: crop?.fotoTanaman || '📦',
            status: salesStatus,
            tanggalPengajuan: new Date().toISOString(),
            catatanAdmin: `Pemenuhan PO Gudang (${cleanPOCode})`,
            metodePembayaran: 'Cash',
            tanamanAktifId: crop?.id || null,
            lahanId: crop?.lahanId || null,
            lahanNama: lahan?.namaLahan || farmer?.alamat || 'Lahan Petani',
            hargaAcuanKg: unitPrice,
            estimasiPendapatan: tenderPetani.kesanggupanKg * unitPrice,
            catatanPetani: `[PEMENUHAN PO GUDANG] Order ID: ${cleanPOCode}`,
            gudangTujuanId: farmer?.gudangTujuanId || null,
            gudangTujuanNama: farmer?.gudangTujuanNama || 'Gudang Cianjur',
            tipePenjualan: 'PO_GUDANG'
          }
        });
        currentPJId = newPJ.id;
      } else {
        await prisma.pengajuanJual.update({
          where: { id: existingPJ.id },
          data: {
            status: salesStatus
          }
        });
      }

      // KUNCI UTAMA: Ketika Petani mengirimkan hasil panen (status === 'dikirim' | 'survey' | 'proses_timbang' | 'selesai'),
      // Buat data Pickup & Pembayaran agar masuk ke antrean Manajemen Pickup & Penimbangan Admin!
      if (status === 'dikirim' || status === 'survey' || status === 'proses_timbang' || status === 'selesai') {
        if (status === 'selesai' && crop) {
          await prisma.tanamanAktif.update({
            where: { id: crop.id },
            data: { statusVerifikasi: 'selesai_panen' }
          }).catch(() => {});
        }

        const pkId = kodePickup(tender.komoditasNama);
        const existingPk = await prisma.pickup.findFirst({ where: { pengajuanJualId: currentPJId } });

        if (!existingPk) {
          await prisma.pickup.create({
            data: {
              id: pkId,
              pengajuanJualId: currentPJId,
              petaniId: tenderPetani.petaniId,
              petaniNama: tenderPetani.petaniNama,
              komoditasNama: tender.komoditasNama,
              alamatPickup: lahan?.namaLahan || farmer?.alamat || 'Dikirim ke Gudang Cianjur',
              tanggalPickup: new Date().toISOString().split('T')[0],
              driverNama: 'Mandiri / Kurir Gudang',
              driverNoHp: farmer?.noHp || '-',
              armada: `Kurir Pemenuhan PO Gudang (${cleanPOCode})`,
              platNomor: 'D 8841 AG',
              status: status === 'selesai' ? 'selesai' : 'dijadwalkan',
              beratTimbangKg: status === 'selesai' ? tenderPetani.kesanggupanKg : null
            }
          });

          const totalBayar = tenderPetani.kesanggupanKg * (tender.hargaPerKg || 12000);
          const invNum = kodeInvoice(tender.komoditasNama);

          await prisma.pembayaran.create({
            data: {
              id: kodePembayaran(tender.komoditasNama),
              pickupId: pkId,
              petaniId: tenderPetani.petaniId,
              petaniNama: tenderPetani.petaniNama,
              komoditasNama: tender.komoditasNama,
              beratKg: tenderPetani.kesanggupanKg,
              hargaPerKg: tender.hargaPerKg || 12000,
              totalBayar: totalBayar,
              tanggalPickup: new Date().toISOString().split('T')[0],
              status: 'menunggu', // Menunggu penimbangan aktual & approval bayar Admin
              metodeBayar: 'TDF',
              nomorInvoice: invNum,
              dibuatOleh: `Sistem PO Gudang (${cleanPOCode})`
            }
          });

          await prisma.notifikasi.create({
            data: {
              id: kodeNotifikasi(),
              petaniId: tenderPetani.petaniId,
              judul: 'Pengiriman Hasil Panen PO Gudang',
              pesan: `[PO Gudang ${cleanPOCode}] ${tenderPetani.petaniNama} telah mengirimkan ${tender.komoditasNama} (${tenderPetani.kesanggupanKg}kg) ke Gudang. Menunggu penimbangan fisik oleh petugas gudang.`,
              tanggal: new Date().toISOString(),
              dibaca: false,
              tipe: 'info'
            }
          });
        }
      }

      if (status === 'approved') {
        const newFulfilled = tender.terpenuhinKg + tenderPetani.kesanggupanKg;
        const reachedTarget = newFulfilled >= tender.kebutuhanKg;
        await prisma.tender.update({
          where: { id: tender.id },
          data: {
            terpenuhinKg: newFulfilled,
            status: reachedTarget ? 'terpenuhi' : 'aktif'
          }
        });

        const approvedResponsesCount = await prisma.tenderPetani.count({
          where: {
            tenderId: tender.id,
            statusApproval: 'approved'
          }
        });

        const GUDANG_URL = process.env.GUDANG_URL || 'http://localhost:5005';
        const GUDANG_API_KEY = process.env.GUDANG_API_KEY || 'gudang_secret_key_v1';
        fetch(`${GUDANG_URL}/api/permintaan-pengadaan/${tender.id}/komitmen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': GUDANG_API_KEY
          },
          body: JSON.stringify({
            totalKomitmenKg: newFulfilled,
            jumlahKepalaPetaniRespon: approvedResponsesCount
          })
        })
          .then(() => {
            console.log(`[Webhook] Sent commitment update to Gudang for tender ${tender.id}: ${newFulfilled} kg`);
          })
          .catch((webhookErr: any) => {
            console.error(`[Webhook] Failed to notify Gudang:`, webhookErr.message);
          });
      }
    }
  }

  return tenderPetani;
}
