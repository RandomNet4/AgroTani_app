import { PrismaClient } from '@prisma/client';

export async function seedTanamanAktif(prisma: PrismaClient) {
  await prisma.tanamanAktif.createMany({
    data: [
  {
    "id": "TAN1783582702508",
    "petaniId": "PTN1783579599977",
    "lahanId": "LHN1783579650449",
    "komoditasId": "KMD001",
    "komoditasNama": "Wortel",
    "tanggalTanam": "2026-07-09",
    "estimasiPanen": "2026-10-07",
    "estimasiHasilKg": 425,
    "fotoTanaman": "🥕",
    "statusVerifikasi": "approved",
    "catatanInspeksi": "",
    "fotoInspeksi": null,
    "latitudeInspeksi": null,
    "longitudeInspeksi": null,
    "catatan": "Untuk memenuhi pengajuan stok Gudang sebesar 615.4 kg",
    "luasLahanDigunakan": 170,
    "jarakTanam": 20,
    "kebutuhanBibit": 1360
  },
  {
    "id": "TAN1783652632577",
    "petaniId": "PTN1783579599977",
    "lahanId": "LHN1783579650449",
    "komoditasId": "KMD003",
    "komoditasNama": "Jagung Manis",
    "tanggalTanam": "2026-07-10",
    "estimasiPanen": "2026-10-08",
    "estimasiHasilKg": 559,
    "fotoTanaman": "🌽",
    "statusVerifikasi": "pending",
    "catatanInspeksi": null,
    "fotoInspeksi": null,
    "latitudeInspeksi": null,
    "longitudeInspeksi": null,
    "catatan": "",
    "luasLahanDigunakan": 399,
    "jarakTanam": 75,
    "kebutuhanBibit": 399
  }
]
  });
}
