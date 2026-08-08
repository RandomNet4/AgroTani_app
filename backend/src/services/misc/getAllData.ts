import prisma from '../../db';
import { mapLahan, mapTanamanAktif, mapPickup } from '../../utils/mappers';

export async function getAllData(petaniId?: string) {
  const petani = await prisma.petani.findMany({
    orderBy: { id: 'desc' }
  });
  const lahanRaw = await prisma.lahan.findMany({
    orderBy: { id: 'desc' }
  });
  const tanamanRaw = await prisma.tanamanAktif.findMany({
    orderBy: { id: 'desc' }
  });
  const komoditas = await prisma.komoditas.findMany({
    orderBy: { id: 'desc' }
  });
  const hargaKomoditas = await prisma.hargaKomoditas.findMany({
    orderBy: { id: 'desc' }
  });
  const historiHarga = await prisma.historiHarga.findMany({
    orderBy: [{ tanggal: 'desc' }, { id: 'desc' }]
  });
  const pengajuanJual = await prisma.pengajuanJual.findMany({
    orderBy: { id: 'desc' }
  });
  const pickupRaw = await prisma.pickup.findMany({
    orderBy: [{ tanggalPickup: 'desc' }, { id: 'desc' }]
  });
  const pembayaran = await prisma.pembayaran.findMany({
    orderBy: [{ tanggalPickup: 'desc' }, { id: 'desc' }]
  });
  const tender = await prisma.tender.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const tenderPetani = await prisma.tenderPetani.findMany({
    orderBy: [{ tanggalDaftar: 'desc' }, { id: 'desc' }]
  });
  const artikelEdukasi = await prisma.artikelEdukasi.findMany({
    orderBy: [{ tanggalPublish: 'desc' }, { id: 'desc' }]
  });
  const produkBibitPupuk: any[] = [];
  const qualityControl = await prisma.qualityControl.findMany({
    orderBy: [{ tanggalQC: 'desc' }, { id: 'desc' }]
  });
  // Filter notifikasi: jika petaniId ada → ambil notif milik petani tsb + broadcast (petaniId=null)
  //                    jika tidak ada (admin) → ambil semua notif
  const notifikasi = await prisma.notifikasi.findMany({
    where: petaniId
      ? { OR: [{ petaniId }, { petaniId: null }] }
      : undefined,
    orderBy: [{ tanggal: 'desc' }, { id: 'desc' }]
  });
  const rekomendasiTanam = await prisma.rekomendasiTanam.findMany({
    orderBy: { id: 'desc' }
  });
  const jejakPanenRaw = await prisma.jejakPanen.findMany({
    include: { timeline: true },
    orderBy: { id: 'desc' }
  });
  const bukuKas = await prisma.bukuKas.findMany({
    orderBy: [{ tanggal: 'desc' }, { id: 'desc' }]
  });
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: [{ tanggalPengajuan: 'desc' }, { id: 'desc' }]
  });

  const lahan = lahanRaw.map(mapLahan);
  const tanamanAktif = tanamanRaw.map(mapTanamanAktif);
  const pickup = pickupRaw.map(mapPickup);
  const jejakPanen = jejakPanenRaw.map((jp: any) => ({
    id: jp.id,
    petaniId: jp.petaniId,
    pickupId: jp.pickupId,
    komoditasNama: jp.komoditasNama,
    emoji: jp.emoji,
    beratAwalKg: jp.beratAwalKg,
    gradeAwal: jp.gradeAwal,
    statusSaatIni: jp.statusSaatIni,
    timeline: jp.timeline.map((t: any) => ({
      status: t.status,
      tanggal: t.tanggal,
      lokasi: t.lokasi,
      keterangan: t.keterangan ?? undefined,
    }))
  }));

  return {
    petani,
    lahan,
    tanamanAktif,
    komoditas,
    hargaKomoditas,
    historiHarga,
    pengajuanJual,
    pickup,
    pembayaran,
    tender,
    tenderPetani,
    artikelEdukasi,
    produkBibitPupuk,
    qualityControl,
    notifikasi,
    rekomendasiTanam,
    jejakPanen,
    bukuKas,
    purchaseOrders,
  };
}
