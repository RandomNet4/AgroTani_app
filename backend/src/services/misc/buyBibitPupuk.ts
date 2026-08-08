import prisma from '../../db';
import { kodeNotifikasi } from '../../utils/kode';

export async function buyBibitPupuk(data: any) {
  const { items, totalHarga, petaniId } = data;
  // No-op: ProdukBibitPupuk table removed

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: petaniId || null,
      judul: 'Pembelian Berhasil',
      pesan: `Pembelian bibit/pupuk senilai Rp ${parseFloat(totalHarga).toLocaleString()} sukses. Silakan ambil barang di gudang tujuan.`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: 'success'
    }
  });

  return { success: true };
}
