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
    "gambar": "https://images.unsplash.com/photo-1583091931818-406c7e289ec0?w=600&q=80",
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
    "gambar": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80",
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
    "gambar": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
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
