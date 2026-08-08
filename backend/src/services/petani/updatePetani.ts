import prisma from '../../db';
import bcrypt from 'bcryptjs';

export async function updatePetani(id: string, data: any) {
  const updateData = { ...data };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  return prisma.petani.update({
    where: { id },
    data: updateData,
  });
}
