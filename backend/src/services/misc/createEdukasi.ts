import prisma from '../../db';

export async function createEdukasi(data: any) {
  const { id, judul, isi, gambar, kategori, penulis, tipe, urlVideo } = data;
  const newEdu = await prisma.artikelEdukasi.create({
    data: {
      id,
      judul,
      isi,
      gambar,
      kategori,
      tanggalPublish: new Date().toISOString(),
      penulis,
      tipe,
      urlVideo
    }
  });
  return newEdu;
}
