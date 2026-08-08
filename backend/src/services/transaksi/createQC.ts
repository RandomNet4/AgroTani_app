import prisma from '../../db';

export async function createQC(data: any) {
  const { id, pickupId, petaniNama, komoditasNama, beratDiterimaKg, grade, catatanKerusakan, petugasQC, fotoQC } = data;
  const newQC = await prisma.qualityControl.create({
    data: {
      id,
      pickupId,
      petaniNama,
      komoditasNama,
      beratDiterimaKg: parseFloat(beratDiterimaKg),
      grade,
      catatanKerusakan,
      tanggalQC: new Date().toISOString(),
      petugasQC,
      fotoQC
    }
  });

  const jp = await prisma.jejakPanen.findFirst({ where: { pickupId } });
  if (jp) {
    await prisma.jejakPanen.update({
      where: { id: jp.id },
      data: {
        statusSaatIni: 'qc_selesai',
        gradeAwal: grade,
        beratAwalKg: parseFloat(beratDiterimaKg)
      }
    });

    await prisma.jejakPanenTimeline.create({
      data: {
        jejakPanenId: jp.id,
        status: 'qc_selesai',
        tanggal: new Date().toISOString(),
        lokasi: 'Agro Jabar QC Center',
        keterangan: `Lolos QC Grade ${grade}. Catatan: ${catatanKerusakan || 'Kualitas baik'}`
      }
    });
  }

  return newQC;
}
