import { PrismaClient } from '@prisma/client';

export async function seedPengajuanJual(prisma: PrismaClient) {
  await prisma.pengajuanJual.createMany({
    data: [
  {
    "id": "PJB1783653291192",
    "petaniId": "PTN1783579599977",
    "petaniNama": "rizki",
    "komoditasId": "KMD001",
    "komoditasNama": "Wortel",
    "beratEstimasiKg": 425,
    "tanggalSiapPickup": "2026-07-10",
    "fotoPanen": "🥕",
    "status": "approved",
    "tanggalPengajuan": "2026-07-10T03:14:52.829Z",
    "catatanAdmin": null,
    "metodePembayaran": "Cash",
    "tanamanAktifId": "TAN1783582702508",
    "lahanId": "LHN1783579650449",
    "lahanNama": "Jl.Sarongge atas no.14",
    "hargaAcuanKg": 2000,
    "estimasiPendapatan": 850000,
    "catatanPetani": "",
    "gudangTujuanId": null,
    "gudangTujuanNama": null
  },
  {
    "id": "PJB1783668785525",
    "petaniId": "PTN1783579599977",
    "petaniNama": "rizki",
    "komoditasId": "KMD001",
    "komoditasNama": "Wortel",
    "beratEstimasiKg": 425,
    "tanggalSiapPickup": "2026-07-11",
    "fotoPanen": "🥕",
    "status": "pending",
    "tanggalPengajuan": "2026-07-10T07:33:08.700Z",
    "catatanAdmin": null,
    "metodePembayaran": "Cash",
    "tanamanAktifId": "TAN1783582702508",
    "lahanId": "LHN1783579650449",
    "lahanNama": "Jl.Sarongge atas no.14",
    "hargaAcuanKg": 2000,
    "estimasiPendapatan": 850000,
    "catatanPetani": "",
    "gudangTujuanId": null,
    "gudangTujuanNama": null
  }
]
  });
}
