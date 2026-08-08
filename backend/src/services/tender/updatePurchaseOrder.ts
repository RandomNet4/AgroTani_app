import prisma from '../../db';

export async function updatePurchaseOrder(id: string, data: any) {
  const { status, estimasiPengantaran, penerimaKontrak, itemsJson } = data;
  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status,
      estimasiPengantaran,
      penerimaKontrak,
      itemsJson,
    }
  });
  return updated;
}
