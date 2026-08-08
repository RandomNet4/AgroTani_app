import { PrismaClient } from '@prisma/client';

export async function seedHargaKomoditas(prisma: PrismaClient) {
  await prisma.hargaKomoditas.createMany({
    data: [
  {
    "id": "HRG001",
    "komoditasId": "KMD001",
    "komoditasNama": "Wortel",
    "harga": 10000,
    "wilayah": "Jawa Barat",
    "tanggalBerlaku": "2026-06-01",
    "tanggalBerakhir": null,
    "dibuatOleh": "Admin"
  },
  {
    "id": "HRG002",
    "komoditasId": "KMD002",
    "komoditasNama": "Buncis",
    "harga": 14000,
    "wilayah": "Jawa Barat",
    "tanggalBerlaku": "2026-06-01",
    "tanggalBerakhir": null,
    "dibuatOleh": "Admin"
  },
  {
    "id": "HRG003",
    "komoditasId": "KMD003",
    "komoditasNama": "Jagung Manis",
    "harga": 7000,
    "wilayah": "Jawa Barat",
    "tanggalBerlaku": "2026-06-01",
    "tanggalBerakhir": null,
    "dibuatOleh": "Admin"
  },
  {
    "id": "HRG_1783580095224",
    "komoditasId": "KMD001",
    "komoditasNama": "Wortel",
    "harga": 4000,
    "wilayah": "Jawa Barat",
    "tanggalBerlaku": "2026-07-09T06:54:55.231Z",
    "tanggalBerakhir": null,
    "dibuatOleh": "Admin Agro"
  },
  {
    "id": "HRG_1783604117777",
    "komoditasId": "KMD001",
    "komoditasNama": "Wortel",
    "harga": 2000,
    "wilayah": "Jawa Barat",
    "tanggalBerlaku": "2026-07-09T13:35:17.784Z",
    "tanggalBerakhir": null,
    "dibuatOleh": "Admin Agro"
  }
]
  });
}
