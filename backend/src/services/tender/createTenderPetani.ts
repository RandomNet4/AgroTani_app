import prisma from '../../db';
import { kodeTenderPetani } from '../../utils/kode';

export async function createTenderPetani(data: any) {
  const { id, tenderId, petaniId, petaniNama, kesanggupanKg, komoditasNama } = data;
  const tp = await prisma.tenderPetani.create({
    data: {
      id: id || kodeTenderPetani(komoditasNama),
      tenderId,
      petaniId,
      petaniNama,
      kesanggupanKg: parseFloat(kesanggupanKg),
      statusApproval: 'pending',
      tanggalDaftar: new Date().toISOString()
    }
  });
  return tp;
}
