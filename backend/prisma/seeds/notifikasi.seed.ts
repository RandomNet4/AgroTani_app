import { PrismaClient } from '@prisma/client';

export async function seedNotifikasi(prisma: PrismaClient) {
  await prisma.notifikasi.createMany({
    data: [
  {
    "id": "NTF_1783579650876",
    "judul": "Pendaftaran Berhasil",
    "pesan": "Selamat datang rizki! Pendaftaran Anda sedang dalam proses verifikasi oleh Admin.",
    "tanggal": "2026-07-09T06:47:30.876Z",
    "dibaca": false,
    "tipe": "info"
  },
  {
    "id": "NTF_1783579859878",
    "judul": "Verifikasi Petani Disetujui",
    "pesan": "Akun Anda telah disetujui. Hub ke gudang: -",
    "tanggal": "2026-07-09T06:50:59.878Z",
    "dibaca": false,
    "tipe": "success"
  },
  {
    "id": "NTF_1783580065629",
    "judul": "Lahan Terverifikasi",
    "pesan": "Pengajuan lahan berkah land Anda statusnya kini: approved",
    "tanggal": "2026-07-09T06:54:25.629Z",
    "dibaca": false,
    "tipe": "success"
  },
  {
    "id": "NTF_1783580096729",
    "judul": "Update Harga Komoditas",
    "pesan": "Harga Wortel disesuaikan menjadi Rp 4.000/kg per 2026-07-09T06:54:55.231Z.",
    "tanggal": "2026-07-09T06:54:55.231Z",
    "dibaca": false,
    "tipe": "info"
  },
  {
    "id": "NTF_1783604123291",
    "judul": "Update Harga Komoditas",
    "pesan": "Harga Wortel disesuaikan menjadi Rp 2.000/kg per 2026-07-09T13:35:17.784Z.",
    "tanggal": "2026-07-09T13:35:17.784Z",
    "dibaca": false,
    "tipe": "info"
  },
  {
    "id": "NTF_1783653596223",
    "judul": "Pengajuan Jual Diupdate",
    "pesan": "Pengajuan jual Wortel Anda statusnya kini: approved. ",
    "tanggal": "2026-07-10T03:19:56.223Z",
    "dibaca": false,
    "tipe": "success"
  },
]
  });
  await prisma.notifikasi.createMany({
    data: [
      {
        id: 'NTF_001',
        judul: '[Surat Order REQ-001] Permintaan Pasokan Wortel',
        pesan: 'Gudang Utama BUMD menerbitkan PO REQ-001 sebanyak 1.000 kg Wortel (Rp 12.000/kg) untuk alokasi panen kelompok tani.',
        tanggal: new Date().toISOString(),
        dibaca: false,
        tipe: 'info'
      },
      {
        id: 'NTF_002',
        judul: '[Verifikasi Petani] Akun Pak Mangku Disetujui',
        pesan: 'Petani Pak Mangku (NIK: 3204012803850001, Lahan: 1.5 Ha Lembang) telah diverifikasi resmi oleh Admin ke Gudang Hub Cianjur.',
        tanggal: new Date().toISOString(),
        dibaca: false,
        tipe: 'success'
      },
      {
        id: 'NTF_003',
        judul: '[Pengajuan Jual PJB-26-WRL-001] Wortel 350 kg',
        pesan: 'Pengajuan penjualan panen Wortel (350 kg) milik Pak Mangku disetujui Admin. Logistik: Penjadwalan Pickup Armada.',
        tanggal: new Date().toISOString(),
        dibaca: false,
        tipe: 'success'
      },
      {
        id: 'NTF_004',
        judul: '[Jadwal Pickup Armada] Wortel D 8841 AG',
        pesan: 'Penjemputan logistik panen Wortel ke Lembang dijadwalkan tanggal 2026-07-28. Armada: Truk Engkel (D 8841 AG), Driver: Ahmad.',
        tanggal: new Date().toISOString(),
        dibaca: true,
        tipe: 'success'
      },
      {
        id: 'NTF_005',
        judul: '[Pembaruan Harga BUMD] Wortel Rp 12.000/kg',
        pesan: 'Harga acuan resmi BUMD Agro Jabar untuk Wortel diperbarui menjadi Rp 12.000/kg (+5.5%) untuk wilayah Jawa Barat.',
        tanggal: new Date().toISOString(),
        dibaca: true,
        tipe: 'info'
      },
      {
        id: 'NTF_006',
        judul: '[Pencairan TDF] INV-26-WRL-001 Rp 4.200.000',
        pesan: 'Pembayaran tagihan invoice INV-26-WRL-001 sebesar Rp 4.200.000 atas nama Pak Mangku (Wortel 350 kg) telah ditransfer oleh Admin.',
        tanggal: new Date().toISOString(),
        dibaca: true,
        tipe: 'success'
      }
    ]
  });
}
