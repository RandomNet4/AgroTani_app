import prisma from '../../db';

export async function createBukuKas(data: any) {
  const { id, tipeTransaksi, kategori, nominal, keterangan } = data;
  const lastKas = await prisma.bukuKas.findFirst({ orderBy: { tanggal: 'desc' } });
  const saldoSebelumnya = lastKas ? lastKas.saldoAkhir : 500000000;
  const amount = parseFloat(nominal);
  const saldoAkhir = tipeTransaksi === 'Uang Masuk' ? (saldoSebelumnya + amount) : (saldoSebelumnya - amount);

  const newKas = await prisma.bukuKas.create({
    data: {
      id,
      tanggal: new Date().toISOString(),
      tipeTransaksi,
      kategori,
      nominal: amount,
      saldoSebelumnya,
      saldoAkhir,
      keterangan
    }
  });
  return newKas;
}
