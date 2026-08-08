import prisma from '../db';
import { mapTanamanAktif } from '../utils/mappers';

export async function createTanaman(data: any) {
  const { id, petaniId, lahanId, komoditasId, komoditasNama, tanggalTanam, estimasiPanen, estimasiHasilKg, fotoTanaman, catatan, luasLahanDigunakan, jarakTanam, kebutuhanBibit } = data;
  const newTanaman = await prisma.tanamanAktif.create({
    data: {
      id,
      petaniId,
      lahanId,
      komoditasId,
      komoditasNama,
      tanggalTanam,
      estimasiPanen,
      estimasiHasilKg: parseFloat(estimasiHasilKg),
      fotoTanaman: fotoTanaman || '🌱',
      statusVerifikasi: 'pending',
      catatan,
      luasLahanDigunakan: luasLahanDigunakan ? parseFloat(luasLahanDigunakan) : null,
      jarakTanam: jarakTanam ? parseFloat(jarakTanam) : null,
      kebutuhanBibit: kebutuhanBibit ? parseFloat(kebutuhanBibit) : null,
    }
  });
  return mapTanamanAktif(newTanaman);
}

export async function updateTanaman(id: string, data: any) {
  const { tanggalTanam, estimasiPanen, estimasiHasilKg, statusVerifikasi, catatan, luasLahanDigunakan, jarakTanam, kebutuhanBibit, komoditasId, komoditasNama } = data;
  const updated = await prisma.tanamanAktif.update({
    where: { id },
    data: {
      tanggalTanam,
      estimasiPanen,
      estimasiHasilKg: estimasiHasilKg ? parseFloat(estimasiHasilKg) : undefined,
      statusVerifikasi,
      catatan,
      luasLahanDigunakan: luasLahanDigunakan !== undefined ? (luasLahanDigunakan ? parseFloat(luasLahanDigunakan) : null) : undefined,
      jarakTanam: jarakTanam !== undefined ? (jarakTanam ? parseFloat(jarakTanam) : null) : undefined,
      kebutuhanBibit: kebutuhanBibit !== undefined ? (kebutuhanBibit ? parseFloat(kebutuhanBibit) : null) : undefined,
      komoditasId: komoditasId !== undefined ? komoditasId : undefined,
      komoditasNama: komoditasNama !== undefined ? komoditasNama : undefined,
    }
  });
  return mapTanamanAktif(updated);
}

export async function deleteTanaman(id: string) {
  await prisma.tanamanAktif.delete({ where: { id } });
  return { success: true };
}

export async function inspectTanaman(id: string, data: any) {
  const { catatanInspeksi, fotoInspeksi, gpsInspeksi, statusVerifikasi } = data;
  const updated = await prisma.tanamanAktif.update({
    where: { id },
    data: {
      catatanInspeksi,
      fotoInspeksi,
      latitudeInspeksi: gpsInspeksi?.lat ? parseFloat(gpsInspeksi.lat) : null,
      longitudeInspeksi: gpsInspeksi?.lng ? parseFloat(gpsInspeksi.lng) : null,
      statusVerifikasi: statusVerifikasi || 'approved',
    }
  });
  return mapTanamanAktif(updated);
}
