import prisma from '../../db';

export async function createPurchaseOrder(data: any) {
  const { id, nomorReq, penerimaKontrak, operatorLogistik, tanggalPengajuan, estimasiPengantaran, status, itemsJson } = data;
  const newPO = await prisma.purchaseOrder.create({
    data: {
      id,
      nomorReq,
      penerimaKontrak,
      operatorLogistik: operatorLogistik || 'admin (Admin Gudang)',
      tanggalPengajuan,
      estimasiPengantaran,
      status: status || 'PENDING',
      itemsJson,
    }
  });
  return newPO;
}
