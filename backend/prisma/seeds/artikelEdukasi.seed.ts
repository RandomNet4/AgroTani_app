import { PrismaClient } from '@prisma/client';

export async function seedArtikelEdukasi(prisma: PrismaClient) {
  await prisma.artikelEdukasi.createMany({
    data: []
  });
}
