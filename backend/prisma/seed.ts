/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { seedKomoditas } from './seeds/komoditas.seed';
import { seedHargaKomoditas } from './seeds/hargaKomoditas.seed';
import { seedHistoriHarga } from './seeds/historiHarga.seed';
import { seedPetani } from './seeds/petani.seed';
import { seedLahan } from './seeds/lahan.seed';
import { seedTanamanAktif } from './seeds/tanamanAktif.seed';
import { seedPengajuanJual } from './seeds/pengajuanJual.seed';
import { seedPickup } from './seeds/pickup.seed';
import { seedPembayaran } from './seeds/pembayaran.seed';
import { seedTender } from './seeds/tender.seed';
import { seedTenderPetani } from './seeds/tenderPetani.seed';
import { seedArtikelEdukasi } from './seeds/artikelEdukasi.seed';
import { seedQualityControl } from './seeds/qualityControl.seed';
import { seedNotifikasi } from './seeds/notifikasi.seed';
import { seedRekomendasiTanam } from './seeds/rekomendasiTanam.seed';
import { seedJejakPanen } from './seeds/jejakPanen.seed';
import { seedBukuKas } from './seeds/bukuKas.seed';
import { seedPurchaseOrder } from './seeds/purchaseOrder.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  await prisma.bukuKas.deleteMany();
  await prisma.jejakPanenTimeline.deleteMany();
  await prisma.jejakPanen.deleteMany();
  await prisma.qualityControl.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.pembayaran.deleteMany();
  await prisma.pickup.deleteMany();
  await prisma.tenderPetani.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.pengajuanJual.deleteMany();
  await prisma.tanamanAktif.deleteMany();
  await prisma.hargaKomoditas.deleteMany();
  await prisma.historiHarga.deleteMany();
  await prisma.komoditas.deleteMany();
  await prisma.lahan.deleteMany();
  await prisma.petani.deleteMany();
  await prisma.artikelEdukasi.deleteMany();
  await prisma.rekomendasiTanam.deleteMany();
  await prisma.purchaseOrder.deleteMany();

  console.log('🌱 Seeding database from modular seeders...');

  await seedKomoditas(prisma);
  await seedHargaKomoditas(prisma);
  await seedHistoriHarga(prisma);
  await seedPetani(prisma);
  await seedLahan(prisma);
  await seedTanamanAktif(prisma);
  await seedPengajuanJual(prisma);
  await seedPickup(prisma);
  await seedPembayaran(prisma);
  await seedTender(prisma);
  await seedTenderPetani(prisma);
  await seedArtikelEdukasi(prisma);
  await seedQualityControl(prisma);
  await seedNotifikasi(prisma);
  await seedRekomendasiTanam(prisma);
  await seedJejakPanen(prisma);
  await seedBukuKas(prisma);
  await seedPurchaseOrder(prisma);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
