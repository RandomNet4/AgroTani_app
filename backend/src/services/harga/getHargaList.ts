import prisma from '../../db';
import { kodeHistoriHarga, kodeNotifikasi } from '../../utils/kode';

export async function getHargaList() {
  const hargaList = await prisma.hargaKomoditas.findMany({
    orderBy: { tanggalBerlaku: 'desc' },
  });
  const komoditasList = await prisma.komoditas.findMany();

  const mapNamaToKode: Record<string, string> = {
    'Wortel': 'WORTEL',
    'Buncis': 'BUNCIS',
    'Jagung Manis': 'JAGUNG_MANIS',
  };

  const enriched = hargaList.map((h: any) => {
    const kmd = komoditasList.find((k: any) => k.id === h.komoditasId);
    return {
      ...h,
      kodeKomoditasGlobal: kmd ? (mapNamaToKode[kmd.nama] || kmd.nama.toUpperCase().replace(/\s+/g, '_')) : null,
    };
  });

  return { harga: enriched, komoditas: komoditasList };
}
