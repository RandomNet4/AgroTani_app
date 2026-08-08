import prisma from '../../db';
import { kodeBukuKas, kodeNotifikasi } from '../../utils/kode';
import { sendPaymentSuccessEmail } from '../../utils/email';

export async function payPembayaran(data: any) {
  const { id, pickupId, petaniId, petaniNama, komoditasNama, beratKg, hargaPerKg, totalBayar, metodeBayar, buktiTransfer, buktiTunai, dibuatOleh } = data;
  const updatedPay = await prisma.pembayaran.update({
    where: { id },
    data: {
      status: 'dibayar',
      tanggalBayar: new Date().toISOString(),
      buktiTransfer,
      buktiTunai,
      dibuatOleh,
      metodeBayar,
    }
  });

  const pick = await prisma.pickup.findUnique({
    where: { id: updatedPay.pickupId }
  });
  if (pick) {
    await prisma.pengajuanJual.update({
      where: { id: pick.pengajuanJualId },
      data: { status: 'selesai' }
    });
  }

  const lastKas = await prisma.bukuKas.findFirst({ orderBy: { tanggal: 'desc' } });
  const saldoSebelumnya = lastKas ? lastKas.saldoAkhir : 500000000;
  const nominal = parseFloat(totalBayar);
  const saldoAkhir = saldoSebelumnya - nominal;

  await prisma.bukuKas.create({
    data: {
      id: kodeBukuKas(),
      tanggal: new Date().toISOString(),
      tipeTransaksi: 'Uang Keluar',
      kategori: 'Pembayaran Petani',
      nominal,
      saldoSebelumnya,
      saldoAkhir,
      keterangan: `Pembayaran panen ${komoditasNama} a.n ${petaniNama} (Inv: ${updatedPay.nomorInvoice})`,
      referensiId: id
    }
  });

  await prisma.notifikasi.create({
    data: {
      id: kodeNotifikasi(),
      petaniId: updatedPay.petaniId,
      judul: `[Pencairan TDF] ${updatedPay.nomorInvoice}`,
      pesan: `[Petani: ${updatedPay.petaniNama}] Pembayaran panen ${updatedPay.komoditasNama} (${updatedPay.beratKg} kg) sebesar Rp ${nominal.toLocaleString('id-ID')} telah berhasil ditransfer BUMD.`,
      tanggal: new Date().toISOString(),
      dibaca: false,
      tipe: 'success'
    }
  });

  // Ambil email petani & kirim email bukti pembayaran otomatis
  try {
    const targetPetani = await prisma.petani.findUnique({ where: { id: updatedPay.petaniId } });
    if (targetPetani && targetPetani.email) {
      sendPaymentSuccessEmail({
        email: targetPetani.email,
        namaPetani: targetPetani.nama,
        nomorInvoice: updatedPay.nomorInvoice,
        komoditasNama: updatedPay.komoditasNama,
        beratKg: updatedPay.beratKg,
        hargaPerKg: updatedPay.hargaPerKg,
        totalBayar: updatedPay.totalBayar,
        metodeBayar: updatedPay.metodeBayar || 'TDF',
        tanggalBayar: updatedPay.tanggalBayar || new Date().toISOString(),
        buktiTransfer: updatedPay.buktiTransfer,
        buktiTunai: updatedPay.buktiTunai
      }).catch((emailErr) => {
        console.error('Gagal mengirimkan email bukti pembayaran ke petani:', emailErr);
      });
    }
  } catch (err) {
    console.error('Pencarian data petani untuk email pembayaran gagal:', err);
  }

  return updatedPay;
}
