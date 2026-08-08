import { PrismaClient } from '@prisma/client';

export async function seedPembayaran(prisma: PrismaClient) {
  await prisma.pembayaran.createMany({
    data: []
  });
}
