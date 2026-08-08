import prisma from '../../db';

export async function handleWebhookPenerimaanGudang(data: any) {
  const { pickupId, status, beratDiterimaKg, gradeInfoJson, processedAt } = data;

  if (status === 'STOCKED' && pickupId) {
    const jp = await prisma.jejakPanen.findFirst({ where: { pickupId } });
    
    if (jp) {
      await prisma.jejakPanen.update({
        where: { id: jp.id },
        data: {
          statusSaatIni: 'diterima_gudang'
        }
      });

      let keterangan = 'Telah diterima dan distok oleh Gudang Agro Jabar.';
      if (beratDiterimaKg) {
        keterangan += ` Berat Aktual: ${beratDiterimaKg}kg.`;
      }
      if (gradeInfoJson) {
        try {
          const grades = JSON.parse(gradeInfoJson);
          const gradesStr = grades.map((g: any) => `${g.grade}: ${g.beratKg}kg`).join(', ');
          keterangan += ` Hasil Grading: ${gradesStr}`;
        } catch (e) {}
      }

      await prisma.jejakPanenTimeline.create({
        data: {
          jejakPanenId: jp.id,
          status: 'diterima_gudang',
          tanggal: processedAt || new Date().toISOString(),
          lokasi: 'Gudang Agro Jabar',
          keterangan
        }
      });
      
      // Update Pickup status if needed
      await prisma.pickup.updateMany({
        where: { id: pickupId },
        data: { status: 'selesai' }
      });
    }
  }

  return { success: true };
}
