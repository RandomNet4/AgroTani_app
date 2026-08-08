import prisma from '../../db';

export async function readNotifikasi(id: string) {
  const updated = await prisma.notifikasi.update({
    where: { id },
    data: { dibaca: true }
  });
  return updated;
}
