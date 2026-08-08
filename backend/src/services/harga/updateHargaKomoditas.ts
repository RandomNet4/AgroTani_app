import prisma from '../../db';
import { kodeHistoriHarga, kodeNotifikasi } from '../../utils/kode';

export async function updateHargaKomoditas(data: any) {
  const { id, komoditasId, komoditasNama, harga, wilayah, dibuatOleh } = data;
  const tgl = new Date().toISOString();

  const k = await prisma.komoditas.findUnique({ where: { id: komoditasId } });
  const hargaSebelumnya = k ? k.hargaSaatIni : harga;

  await prisma.komoditas.update({
    where: { id: komoditasId },
    data: {
      hargaSaatIni: parseFloat(harga),
      hargaSebelumnya: parseFloat(hargaSebelumnya),
      lastUpdate: tgl,
    }
  });

  const newHarga = await prisma.hargaKomoditas.create({
    data: {
      id,
      komoditasId,
      komoditasNama,
      harga: parseFloat(harga),
      wilayah,
      tanggalBerlaku: tgl,
      dibuatOleh,
    }
  });

  await prisma.historiHarga.create({
    data: {
      id: kodeHistoriHarga(),
      komoditasId,
      harga: parseFloat(harga),
      tanggal: tgl,
    }
  });

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: null, // Broadcast ke semua (admin & petani lihat)
      judul: `[Pembaruan Harga BUMD] ${komoditasNama}`,
      pesan: `Harga acuan resmi BUMD Agro Jabar untuk ${komoditasNama} diperbarui menjadi Rp ${parseFloat(harga).toLocaleString('id-ID')}/kg (${wilayah || 'Jawa Barat'}).`,
      tanggal: tgl,
      dibaca: false,
      tipe: 'info'
    }
  });

  return newHarga;
}
