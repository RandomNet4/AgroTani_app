import prisma from '../../db';

export async function deletePurchaseOrder(id: string) {
  await prisma.purchaseOrder.delete({ where: { id } });
  return { success: true };
}
