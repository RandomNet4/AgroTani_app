import prisma from '../../db';
import { mapPickup } from '../../utils/mappers';
import { kodePembayaran, kodeInvoice, kodeNotifikasi } from '../../utils/kode';

export async function createPickup(data: any) {
  const {
    id, pengajuanJualId, petaniId, petaniNama, komoditasNama,
    alamatPickup, tanggalPickup, driverNama, driverNoHp, armada, platNomor
  } = data;

  const newPickup = await prisma.pickup.create({
    data: {
      id,
      pengajuanJualId,
      petaniId,
      petaniNama,
      komoditasNama,
      alamatPickup,
      tanggalPickup,
      driverNama,
      driverNoHp,
      armada,
      platNomor,
      status: 'dijadwalkan',
    }
  });

  await prisma.pengajuanJual.update({
    where: { id: pengajuanJualId },
    data: { status: 'pickup_dijadwalkan' }
  });

  const pj = await prisma.pengajuanJual.findUnique({ where: { id: pengajuanJualId } });
  const hargaAcuan = pj?.hargaAcuanKg || 0;
  await prisma.pembayaran.create({
    data: {
      id: kodePembayaran(komoditasNama),
      pickupId: id,
      petaniId,
      petaniNama,
      komoditasNama,
      beratKg: 0,
      hargaPerKg: hargaAcuan,
      totalBayar: 0,
      tanggalPickup,
      status: 'menunggu',
      metodeBayar: pj?.metodePembayaran || 'TDF',
      nomorInvoice: kodeInvoice(komoditasNama)
    }
  });

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: petaniId,
      judul: `[Jadwal Pickup Armada] ${komoditasNama}`,
      pesan: `[Petani: ${petaniNama}] Penjemputan logistik panen ${komoditasNama} ke ${alamatPickup} dijadwalkan tanggal ${tanggalPickup}. Armada: ${armada} (${platNomor}), Driver: ${driverNama} (${driverNoHp}).`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: 'success'
    }
  });

  return mapPickup(newPickup);
}
