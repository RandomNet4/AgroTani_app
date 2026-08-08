import prisma from '../../db';
import { mapLahan } from '../../utils/mappers';

export async function createLahan(data: any) {
  const { id, petaniId, namaLahan, latitude, longitude, alamat, luasHektar, jenisLahan, kecamatan, kabupaten, fotoLahan } = data;
  const newLahan = await prisma.lahan.create({
    data: {
      id,
      petaniId,
      namaLahan,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      alamat,
      luasHektar: parseFloat(luasHektar),
      jenisLahan,
      kecamatan,
      kabupaten,
      statusVerifikasi: 'pending',
      fotoLahan: fotoLahan || '🌾'
    }
  });
  return mapLahan(newLahan);
}
