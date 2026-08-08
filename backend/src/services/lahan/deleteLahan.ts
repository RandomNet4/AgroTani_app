import prisma from '../../db';

export async function deleteLahan(id: string) {
  await prisma.lahan.delete({ where: { id } });
  return { success: true };
}
