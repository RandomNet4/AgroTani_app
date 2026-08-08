import prisma from '../../db';

export async function getHistoriHarga() {
  const histori = await prisma.historiHarga.findMany({
    orderBy: [{ tanggal: 'desc' }, { id: 'desc' }],
  });
  return { histori };
}
