import { PrismaClient } from '@prisma/client';

export async function seedKomoditas(prisma: PrismaClient) {
  await prisma.komoditas.createMany({
    data: [
  {
    "id": "KMD002",
    "nama": "Buncis",
    "kategori": "sayuran",
    "satuan": "kg",
    "deskripsi": "Buncis hijau segar",
    "gambar": "/images/komoditas/buncis.png",
    "hargaSaatIni": 14000,
    "hargaSebelumnya": 13000,
    "lastUpdate": "2026-06-01",
    "jumlahPetaniAktif": 0,
    "totalEstimasiProduksiKg": 0,
    "estimasiBulanPanen": "Juli 2026",
    "kebutuhanBulananKg": 8000,
    "supplyStatus": "kurang",
    "umurPanenHari": 40,
    "jarakTanamCm": 40,
    "kebutuhanBenihGramPerM2": 5
  },
  {
    "id": "KMD003",
    "nama": "Jagung Manis",
    "kategori": "sayuran",
    "satuan": "kg",
    "deskripsi": "Jagung manis super",
    "gambar": "/images/komoditas/jagung.png",
    "hargaSaatIni": 7000,
    "hargaSebelumnya": 6500,
    "lastUpdate": "2026-06-01",
    "jumlahPetaniAktif": 0,
    "totalEstimasiProduksiKg": 0,
    "estimasiBulanPanen": "Agustus 2026",
    "kebutuhanBulananKg": 14000,
    "supplyStatus": "berlebih",
    "umurPanenHari": 90,
    "jarakTanamCm": 75,
    "kebutuhanBenihGramPerM2": 1
  },
  {
    "id": "KMD001",
    "nama": "Wortel",
    "kategori": "sayuran",
    "satuan": "kg",
    "deskripsi": "Wortel segar organik",
    "gambar": "/images/komoditas/wortel.png",
    "hargaSaatIni": 2000,
    "hargaSebelumnya": 4000,
    "lastUpdate": "2026-07-09T13:35:17.784Z",
    "jumlahPetaniAktif": 0,
    "totalEstimasiProduksiKg": 0,
    "estimasiBulanPanen": "Juli 2026",
    "kebutuhanBulananKg": 16000,
    "supplyStatus": "cukup",
    "umurPanenHari": 90,
    "jarakTanamCm": 20,
    "kebutuhanBenihGramPerM2": 8
  }
]
  });
}
