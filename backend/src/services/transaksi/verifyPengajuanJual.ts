import prisma from '../../db';
import { kodePickup, kodePembayaran, kodeInvoice, kodeNotifikasi } from '../../utils/kode';

export async function verifyPengajuanJual(id: string, data: any) {
  const { status, catatanAdmin } = data;
  const currentPengajuan = await prisma.pengajuanJual.findUnique({ where: { id } });
  if (!currentPengajuan) {
    throw { status: 404, message: 'Pengajuan tidak ditemukan' };
  }

  let targetStatus = status;
  let isAutoPickup = false;
  let customPesan = `Pengajuan jual ${currentPengajuan.komoditasNama} Anda statusnya kini: ${status}. ${catatanAdmin ? `Catatan: ${catatanAdmin}` : ''}`;

  if (status === 'approved' && currentPengajuan.beratEstimasiKg < 300) {
    targetStatus = 'pickup_dijadwalkan';
    isAutoPickup = true;
    customPesan = `Pengajuan jual ${currentPengajuan.komoditasNama} Anda disetujui! Karena berat di bawah 300kg, silakan antar hasil panen Anda langsung ke Gudang Agro Jabar pada tanggal ${currentPengajuan.tanggalSiapPickup}.`;
  }

  const updated = await prisma.pengajuanJual.update({
    where: { id },
    data: {
      status: targetStatus,
      catatanAdmin
    }
  });

  if (isAutoPickup) {
    const pickupId = kodePickup(updated.komoditasNama);
    await prisma.pickup.create({
      data: {
        id: pickupId,
        pengajuanJualId: updated.id,
        petaniId: updated.petaniId,
        petaniNama: updated.petaniNama,
        komoditasNama: updated.komoditasNama,
        alamatPickup: updated.lahanNama || 'Diantar Mandiri',
        tanggalPickup: updated.tanggalSiapPickup,
        driverNama: 'Petani (Mandiri)',
        driverNoHp: '-',
        armada: 'Pengantaran Mandiri',
        platNomor: '-',
        status: 'dijadwalkan',
      }
    });

    await prisma.pembayaran.create({
      data: {
        id: kodePembayaran(updated.komoditasNama),
        pickupId: pickupId,
        petaniId: updated.petaniId,
        petaniNama: updated.petaniNama,
        komoditasNama: updated.komoditasNama,
        beratKg: 0,
        hargaPerKg: updated.hargaAcuanKg || 0,
        totalBayar: 0,
        tanggalPickup: updated.tanggalSiapPickup,
        status: 'menunggu',
        metodeBayar: updated.metodePembayaran || 'TDF',
        nomorInvoice: kodeInvoice(updated.komoditasNama)
      }
    });
  }

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: updated.petaniId,
      judul: status === 'rejected' ? `[Pengajuan Jual Ditolak] ${id}` : `[Persetujuan Panen] ${id}`,
      pesan: `[Petani: ${updated.petaniNama}] ${customPesan}`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: status === 'rejected' ? 'danger' : 'success'
    }
  });

  return updated;
}
