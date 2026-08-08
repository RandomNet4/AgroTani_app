import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendRegistrationEmail(email: string, nama: string, noHp: string, passwordPlain: string) {
  if (!resend) {
    console.warn('Resend API key is not configured. Email will not be sent.');
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Pendaftaran dan Verifikasi Akun AgroTani Berhasil',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #059669; text-align: center;">Selamat Datang di AgroTani!</h2>
          <p>Halo <strong>${nama}</strong>,</p>
          <p>Akun Anda telah berhasil terdaftar dan diverifikasi di platform AgroTani sebagai Petani Mitra.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Detail Akun Anda:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #4b5563; width: 120px;"><strong>Email:</strong></td>
                <td style="padding: 5px 0; color: #111827;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #4b5563;"><strong>No. HP:</strong></td>
                <td style="padding: 5px 0; color: #111827;">${noHp}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #4b5563;"><strong>Password:</strong></td>
                <td style="padding: 5px 0; color: #111827;"><code>${passwordPlain}</code></td>
              </tr>
            </table>
          </div>
          
          <p>Anda sekarang dapat login ke aplikasi menggunakan nomor HP / email dan password di atas.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Layanan Otomatis AgroTani &copy; 2026</p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    console.log('Registration email sent successfully to', email, ':', data?.id);
  } catch (error) {
    console.error('Error sending registration email to', email, ':', error);
    throw error;
  }
}

export async function sendAccountApprovalEmail(
  email: string,
  nama: string,
  petaniId?: string,
  alamat?: string,
  gudangNama?: string,
  noHp?: string,
  password?: string
) {
  if (!resend) {
    console.warn('Resend API key is not configured. Email will not be sent.');
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'Agro Jabar Mitra <noreply@agro-petani.web.id>';
  const loginUrl = process.env.PETANI_FRONTEND_URL || 'http://localhost:5173/login';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Selamat! Pendaftaran Mitra Petani Agro Jabar Disetujui 🌾',
      html: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="id">
<head>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
  <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/>
  <title>Pendaftaran Mitra Petani Disetujui - Agro Jabar</title>
  <style>
    @media (prefers-color-scheme: dark) {
      li::marker { color: #c4c4c4; }
    }
  </style>
</head>
<body dir="ltr" lang="id" style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Container Utama Email -->
  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center" style="background-color:#f3f4f6;padding:20px 0;">
    <tbody>
      <tr>
        <td align="center" style="margin:0;padding:0;">
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);border:1px solid #e5e7eb;">
            <tbody>
              
              <!-- 1. HEADER EMAIL -->
              <tr>
                <td style="background:linear-gradient(135deg, #059669 0%, #047857 100%);padding:32px 24px;text-align:center;color:#ffffff;">
                  <div style="font-size:42px;margin-bottom:8px;">🌾</div>
                  <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;line-height:1.3;">
                    Selamat! Pendaftaran Mitra Petani Disetujui
                  </h1>
                  <p style="margin:8px 0 0 0;font-size:13px;color:#dcfce7;font-weight:500;">
                    Sistem Rantai Pasok Pertanian Terpadu — Agro Jabar
                  </p>
                </td>
              </tr>

              <!-- 2. BODY KONTEN -->
              <tr>
                <td style="padding:32px 28px;color:#374151;font-size:14px;line-height:1.6;">
                  <p style="margin-top:0;font-size:16px;font-weight:700;color:#111827;">
                    Halo <span style="color:#059669;">${nama}</span>,
                  </p>
                  
                  <p style="margin-bottom:20px;">
                    Kami mengonfirmasi bahwa permohonan pendaftaran Anda sebagai <b>Mitra Petani Terverifikasi</b> telah ditinjau dan <b style="color:#059669;">RESMI DISETUJUI</b> oleh tim Agro Jabar.
                  </p>

                  <!-- CARD RINGKASAN AKUN MITRA -->
                  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
                    <tbody>
                      <tr>
                        <td style="padding-bottom:8px;font-size:12px;color:#166534;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                          📋 RINCIAN AKUN MITRA TERDAFTAR
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#1f2937;">
                          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">ID Mitra Petani:</span>
                            <b style="color:#0f172a;">${petaniId ? (petaniId.startsWith('PTN-') ? petaniId : (petaniId.startsWith('PTN') && petaniId.length > 8 ? `PTN-${petaniId.replace('PTN', '').slice(-4)}` : `PTN-${petaniId}`)) : '-'}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Wilayah / Alamat:</span>
                            <b style="color:#0f172a;">${alamat || '-'}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Gudang Afiliasi Tujuan:</span>
                            <b style="color:#059669;">${gudangNama || 'Gudang Cianjur'}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:4px 0;">
                            <span style="color:#64748b;">Status Kemitraan:</span>
                            <span style="background-color:#dcfce7;color:#15803d;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:800;display:inline-block;">
                              ✓ Terverifikasi Active
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- CARD KREDENSIAL LOGIN AKUN -->
                  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
                    <tbody>
                      <tr>
                        <td style="padding-bottom:8px;font-size:12px;color:#1e40af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                          🔑 KREDENSIAL AKUN LOGIN ANDA
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#1f2937;">
                          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #93c5fd;">
                            <span style="color:#475569;">Nomor HP / WhatsApp:</span>
                            <b style="color:#1e3a8a;font-family:monospace;font-size:14px;">${noHp || '-'}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #93c5fd;">
                            <span style="color:#475569;">Email Terdaftar:</span>
                            <b style="color:#1e3a8a;font-family:monospace;font-size:13px;">${email}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:5px 0;">
                            <span style="color:#475569;">Password / Kata Sandi:</span>
                            <b style="color:#dc2626;font-family:monospace;font-size:14px;background-color:#ffffff;padding:1px 8px;border-radius:4px;border:1px solid #cbd5e1;">${password || '(Sesuai yang Anda Daftarkan)'}</b>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:10px;font-size:11px;color:#3b82f6;line-height:1.4;">
                          💡 <i>Catatan: Gunakan Nomor HP atau Email beserta Password di atas untuk masuk ke Aplikasi Petani.</i>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- KEUNTUNGAN KEMITRAAN -->
                  <h3 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 12px 0;">
                    🚀 Manfaat & Akses Fitur yang Dapat Anda Gunakan:
                  </h3>
                  <ul style="margin:0 0 24px 0;padding-left:20px;color:#4b5563;">
                    <li style="margin-bottom:8px;">
                      <b>Terima Purchase Order (PO) Gudang:</b> Dapatkan alokasi langsung permintaan pasokan komoditas dari Gudang Jabar.
                    </li>
                    <li style="margin-bottom:8px;">
                      <b>Rekomendasi Pola Tanam:</b> Pantau analisis kebutuhan pasar & harga acuan untuk mencegah terjadinya panen raya yang merugikan.
                    </li>
                    <li style="margin-bottom:8px;">
                      <b>Fasilitas Penjemputan / Pickup Panen:</b> Ajukan penjemputan armada logistik langsung dari lokasi lahan Anda.
                    </li>
                  </ul>

                  <!-- BUTTON CALL TO ACTION (CTA) -->
                  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="margin-bottom:24px;">
                    <tbody>
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}" target="_blank" style="background-color:#059669;color:#ffffff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;display:inline-block;box-shadow:0 4px 10px rgba(5,150,105,0.25);">
                            Buka Aplikasi & Mulai Bertransaksi →
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p style="font-size:12px;color:#6b7280;margin:0;text-align:center;">
                    Jika tombol di atas tidak dapat diklik, gunakan link berikut pada browser Anda:<br/>
                    <a href="${loginUrl}" style="color:#059669;word-break:break-all;">${loginUrl}</a>
                  </p>

                </td>
              </tr>

              <!-- 3. FOOTER EMAIL -->
              <tr>
                <td style="background-color:#f9fafb;padding:20px 28px;text-align:center;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:11px;line-height:1.5;">
                  <p style="margin:0 0 4px 0;">
                    Email ini dikirim secara otomatis oleh <b>Sistem Agro Jabar</b>.
                  </p>
                  <p style="margin:0;">
                    Hak Cipta © 2026 Agro Jabar. Seluruh hak cipta dilindungi undang-undang.
                  </p>
                </td>
              </tr>

            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

</body>
</html>
      `,
    });

    console.log('Account approval email sent successfully to', email, ':', data?.id);
  } catch (error) {
    console.error('Error sending account approval email to', email, ':', error);
    throw error;
  }
}

export async function sendPaymentSuccessEmail(params: {
  email: string;
  namaPetani: string;
  nomorInvoice: string;
  komoditasNama: string;
  beratKg: number;
  hargaPerKg: number;
  totalBayar: number;
  metodeBayar: string;
  tanggalBayar: string;
  buktiTransfer?: string | null;
  buktiTunai?: string | null;
}) {
  if (!resend) {
    console.warn('Resend API key is not configured. Payment email will not be sent.');
    return;
  }

  const {
    email,
    namaPetani,
    nomorInvoice,
    komoditasNama,
    beratKg,
    hargaPerKg,
    totalBayar,
    metodeBayar,
    tanggalBayar,
    buktiTransfer,
    buktiTunai
  } = params;

  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'Agro Jabar Keuangan <noreply@agro-petani.web.id>';
  const formattedTotal = totalBayar.toLocaleString('id-ID');
  const formattedHarga = hargaPerKg.toLocaleString('id-ID');
  const formattedTanggal = new Date(tanggalBayar).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const buktiUrl = buktiTransfer || buktiTunai || null;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Bukti Pembayaran Panen Selesai - Inv ${nomorInvoice} 💰`,
      html: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="id">
<head>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
  <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
  <title>Bukti Pembayaran Hasil Panen - Agro Jabar</title>
</head>
<body dir="ltr" lang="id" style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center" style="background-color:#f3f4f6;padding:20px 0;">
    <tbody>
      <tr>
        <td align="center" style="margin:0;padding:0;">
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);border:1px solid #e5e7eb;">
            <tbody>
              
              <!-- HEADER -->
              <tr>
                <td style="background:linear-gradient(135deg, #059669 0%, #047857 100%);padding:32px 24px;text-align:center;color:#ffffff;">
                  <div style="font-size:42px;margin-bottom:8px;">💰</div>
                  <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;line-height:1.3;">
                    Pembayaran Hasil Panen Berhasil!
                  </h1>
                  <p style="margin:8px 0 0 0;font-size:13px;color:#dcfce7;font-weight:500;">
                    BUMD Agro Jabar — Bukti Transfer Resmi
                  </p>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:32px 28px;color:#374151;font-size:14px;line-height:1.6;">
                  <p style="margin-top:0;font-size:16px;font-weight:700;color:#111827;">
                    Halo <span style="color:#059669;">${namaPetani}</span>,
                  </p>
                  
                  <p style="margin-bottom:20px;">
                    Kami menginformasikan bahwa pembayaran untuk hasil panen komoditas <b>${komoditasNama}</b> Anda telah <b style="color:#059669;">DIBAYAR LUNAS</b> oleh BUMD Agro Jabar.
                  </p>

                  <!-- CARD RINCIAN PEMBAYARAN -->
                  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
                    <tbody>
                      <tr>
                        <td style="padding-bottom:12px;font-size:12px;color:#166534;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                          🧾 RINCIAN INVOICE & PENJUALAN
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#1f2937;">
                          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Nomor Invoice:</span>
                            <b style="color:#0f172a;font-family:monospace;">${nomorInvoice}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Komoditas Panen:</span>
                            <b style="color:#0f172a;">${komoditasNama}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Berat Hasil Timbang:</span>
                            <b style="color:#0f172a;">${beratKg} kg</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Harga per Kg:</span>
                            <b style="color:#0f172a;">Rp ${formattedHarga} /kg</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #cbd5e1;">
                            <span style="color:#64748b;">Metode Pembayaran:</span>
                            <b style="color:#059669;">${metodeBayar}</b>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding:6px 0;">
                            <span style="color:#64748b;">Waktu Transaksi:</span>
                            <span style="color:#4b5563;font-size:12px;">${formattedTanggal}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- TOTAL BAYAR BANNER -->
                  <div style="background-color:#059669;color:#ffffff;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                    <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#a7f3d0;font-weight:600;">Total Dana Diterima</div>
                    <div style="font-size:28px;font-weight:800;margin-top:4px;">Rp ${formattedTotal}</div>
                  </div>

                  ${buktiUrl ? `
                  <!-- BUKTI TRANSFER ATTACHMENT / LINK -->
                  <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
                    <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;">📎 Bukti Pembayaran Lampiran:</p>
                    <a href="${buktiUrl}" target="_blank" style="background-color:#2563eb;color:#ffffff;padding:10px 20px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;display:inline-block;">
                      Lihat Bukti Transfer / Pembayaran →
                    </a>
                  </div>
                  ` : ''}

                  <p style="font-size:13px;color:#4b5563;margin-bottom:0;">
                    Terima kasih atas kerja sama dan kontribusi Anda dalam menjaga rantai pasok ketahanan pangan Jawa Barat bersama Agro Jabar.
                  </p>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color:#f9fafb;padding:20px 28px;text-align:center;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:11px;line-height:1.5;">
                  <p style="margin:0 0 4px 0;">
                    Email ini dikirimkan secara otomatis oleh <b>Sistem Keuangan Agro Jabar</b>.
                  </p>
                  <p style="margin:0;">
                    Hak Cipta © 2026 BUMD Agro Jabar. Seluruh hak cipta dilindungi.
                  </p>
                </td>
              </tr>

            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

</body>
</html>
      `,
    });

    if (error) {
      throw error;
    }

    console.log('Payment success email sent to', email, ':', data?.id);
  } catch (error) {
    console.error('Error sending payment success email to', email, ':', error);
  }
}

