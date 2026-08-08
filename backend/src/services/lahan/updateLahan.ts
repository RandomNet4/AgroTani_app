import prisma from '../../db';
import { mapLahan } from '../../utils/mappers';

export async function updateLahan(id: string, data: any) {
  const { namaLahan, luasHektar, jenisLahan, alamat, kecamatan, kabupaten, statusVerifikasi } = data;
  const updated = await prisma.lahan.update({
    where: { id },
    data: {
      namaLahan,
      luasHektar: luasHektar ? parseFloat(luasHektar) : undefined,
      jenisLahan,
      alamat,
      kecamatan,
      kabupaten,
      statusVerifikasi
    }
  });
  return mapLahan(updated);
}
