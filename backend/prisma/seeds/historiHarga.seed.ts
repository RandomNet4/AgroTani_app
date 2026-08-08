import { PrismaClient } from '@prisma/client';

export async function seedHistoriHarga(prisma: PrismaClient) {
  await prisma.historiHarga.createMany({
    data: [
  {
    "id": "HH001",
    "komoditasId": "KMD001",
    "harga": 9000,
    "tanggal": "2026-04-01"
  },
  {
    "id": "HH002",
    "komoditasId": "KMD001",
    "harga": 9500,
    "tanggal": "2026-05-01"
  },
  {
    "id": "HH003",
    "komoditasId": "KMD001",
    "harga": 10000,
    "tanggal": "2026-06-01"
  },
  {
    "id": "HH004",
    "komoditasId": "KMD002",
    "harga": 12000,
    "tanggal": "2026-04-01"
  },
  {
    "id": "HH005",
    "komoditasId": "KMD002",
    "harga": 13000,
    "tanggal": "2026-05-01"
  },
  {
    "id": "HH006",
    "komoditasId": "KMD002",
    "harga": 14000,
    "tanggal": "2026-06-01"
  },
  {
    "id": "HH007",
    "komoditasId": "KMD003",
    "harga": 6000,
    "tanggal": "2026-04-01"
  },
  {
    "id": "HH008",
    "komoditasId": "KMD003",
    "harga": 6500,
    "tanggal": "2026-05-01"
  },
  {
    "id": "HH009",
    "komoditasId": "KMD003",
    "harga": 7000,
    "tanggal": "2026-06-01"
  },
  {
    "id": "HH_1783580096414",
    "komoditasId": "KMD001",
    "harga": 4000,
    "tanggal": "2026-07-09T06:54:55.231Z"
  },
  {
    "id": "HH_1783604122376",
    "komoditasId": "KMD001",
    "harga": 2000,
    "tanggal": "2026-07-09T13:35:17.784Z"
  }
]
  });
}
