import { PrismaClient } from '@prisma/client';

export async function seedLahan(prisma: PrismaClient) {
  await prisma.lahan.createMany({
    data: [
  {
    "id": "LHN1783579650449",
    "petaniId": "PTN1783579599977",
    "namaLahan": "berkah land",
    "latitude": -6.795876,
    "longitude": 107.132835,
    "alamat": "Jl.Sarongge atas no.14",
    "luasHektar": 2.5,
    "jenisLahan": "kebun",
    "kecamatan": "Sarongge",
    "kabupaten": "Cianjur",
    "statusVerifikasi": "approved",
    "fotoLahan": "🌾"
  }
]
  });
}
