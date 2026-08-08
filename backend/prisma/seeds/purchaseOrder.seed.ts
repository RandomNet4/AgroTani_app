import { PrismaClient } from '@prisma/client';

export async function seedPurchaseOrder(prisma: PrismaClient) {
  await prisma.purchaseOrder.createMany({
    data: []
  });
}
