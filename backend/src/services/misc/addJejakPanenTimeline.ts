import prisma from '../../db';

export async function addJejakPanenTimeline(id: string, data: any) {
  const { status, lokasi, keterangan } = data;
  const jp = await prisma.jejakPanen.findUnique({ where: { id } });
  if (!jp) {
    throw { status: 404, message: 'Jejak panen tidak ditemukan' };
  }

  await prisma.jejakPanen.update({
    where: { id },
    data: { statusSaatIni: status }
  });

  const entry = await prisma.jejakPanenTimeline.create({
    data: {
      jejakPanenId: id,
      status,
      tanggal: new Date().toISOString(),
      lokasi,
      keterangan
    }
  });

  return entry;
}
