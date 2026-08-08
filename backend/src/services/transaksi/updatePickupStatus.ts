import prisma from '../../db';
import { mapPickup } from '../../utils/mappers';
import { kodeJejakPanen } from '../../utils/kode';

export async function updatePickupStatus(id: string, data: any) {
  const { status, beratTimbangKg, fotoTimbang, gpsLokasi, waktuBerangkat, waktuTiba, waktuSelesai } = data;
  const updated = await prisma.pickup.update({
    where: { id },
    data: {
      status,
      beratTimbangKg: beratTimbangKg ? parseFloat(beratTimbangKg) : undefined,
      fotoTimbang,
      latitude: gpsLokasi?.lat ? parseFloat(gpsLokasi.lat) : undefined,
      longitude: gpsLokasi?.lng ? parseFloat(gpsLokasi.lng) : undefined,
      waktuBerangkat,
      waktuTiba,
      waktuSelesai
    }
  });

  if (status === 'selesai') {
    await prisma.pengajuanJual.update({
      where: { id: updated.pengajuanJualId },
      data: { status: 'proses_timbang' }
    });

    const pay = await prisma.pembayaran.findFirst({ where: { pickupId: id } });
    if (pay && beratTimbangKg) {
      const berat = parseFloat(beratTimbangKg);
      const total = berat * pay.hargaPerKg;
      await prisma.pembayaran.update({
        where: { id: pay.id },
        data: {
          beratKg: berat,
          totalBayar: total,
          status: 'diproses'
        }
      });
    }

    await prisma.jejakPanen.create({
      data: {
        id: kodeJejakPanen(updated.komoditasNama),
        petaniId: updated.petaniId,
        pickupId: id,
        komoditasNama: updated.komoditasNama,
        emoji: '🌾',
        beratAwalKg: parseFloat(beratTimbangKg),
        gradeAwal: 'A',
        statusSaatIni: 'qc_selesai',
      }
    });

    const GUDANG_URL = process.env.GUDANG_URL || 'http://localhost:5005';
    const GUDANG_API_KEY = process.env.GUDANG_API_KEY || 'gudang_secret_key_v1';
    const petaniData = await prisma.petani.findUnique({ where: { id: updated.petaniId } });
    fetch(`${GUDANG_URL}/api/webhook/penerimaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GUDANG_API_KEY,
      },
      body: JSON.stringify({
        pickupId: id,
        pengajuanJualId: updated.pengajuanJualId,
        petaniId: updated.petaniId,
        petaniNama: updated.petaniNama,
        komoditasNama: updated.komoditasNama,
        beratTimbangKg: parseFloat(beratTimbangKg),
        gudangTujuanId: petaniData?.gudangTujuanId || null,
        timestamp: new Date().toISOString(),
      }),
    })
      .then(() => {
        console.log(`[Pickup→Gudang] Notified gudang: ${updated.komoditasNama} ${beratTimbangKg}kg from ${updated.petaniNama}`);
      })
      .catch((webhookErr: any) => {
        console.error(`[Pickup→Gudang] Failed to notify gudang:`, webhookErr.message);
      });
  }

  return mapPickup(updated);
}
