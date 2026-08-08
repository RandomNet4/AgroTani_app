// =====================================================
// SISTEM KODIFIKASI TERPUSAT - APLIKASI AGRO TANI
// Semua kode dokumen & ID record dihasilkan dari sini
// Format: PREFIX-TT-[KMD]-NNN (singkat, mudah dibaca)
// =====================================================

const TAHUN = new Date().getFullYear().toString().slice(-2); // "26"

/** Angka acak 2 digit: 01-99 */
const acak2 = (): string => String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');

/** Angka acak 3 digit: 001-999 */
const acak3 = (): string => String(Math.floor(1 + Math.random() * 999)).padStart(3, '0');

// ──────────────────────────────────────────────────────────────
// KODE KOMODITAS SAYURAN
// WRL = Wortel | BCS = Buncis | JGU = Jagung Manis
// ──────────────────────────────────────────────────────────────

/** Peta nama komoditas → kode singkatan 3 huruf */
const KODE_KOMODITAS: Record<string, string> = {
  'wortel':       'WRL',
  'buncis':       'BCS',
  'jagung manis': 'JGU',
  'jagung':       'JGU',
};

/**
 * Ambil kode komoditas dari nama (case-insensitive).
 * Jika tidak dikenali, kembalikan string kosong (kode tidak disisipkan).
 * Contoh: 'Wortel' → 'WRL', 'Buncis' → 'BCS', 'Jagung Manis' → 'JGU'
 */
export const kodeKomoditas = (namaKomoditas?: string): string => {
  if (!namaKomoditas) return '';
  const kode = KODE_KOMODITAS[namaKomoditas.toLowerCase().trim()];
  return kode ? kode : '';
};

/**
 * Bangun segmen komoditas untuk disisipkan dalam kode dokumen.
 * Hasilkan '-WRL', '-BCS', '-JGU', atau '' jika tidak ada.
 */
const segKmd = (namaKomoditas?: string): string => {
  const k = kodeKomoditas(namaKomoditas);
  return k ? `-${k}` : '';
};

// ──────────────────────────────────────────────────────────────
// GENERATOR PER JENIS DOKUMEN
// ──────────────────────────────────────────────────────────────

/** ID Petani → PTN-26-001  (tidak terkait komoditas) */
export const kodeDataPetani = (seq?: number): string =>
  seq !== undefined
    ? `PTN-${TAHUN}-${String(seq).padStart(3, '0')}`
    : `PTN-${TAHUN}-${acak3()}`;

/** ID Lahan → LHN-26-001  (tidak terkait komoditas) */
export const kodeLahan = (): string => `LHN-${TAHUN}-${acak3()}`;

/** ID Tanaman Aktif → TAN-26-WRL-001 atau TAN-26-001 */
export const kodeTanaman = (komoditas?: string): string =>
  `TAN-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Pengajuan Penjualan Panen → PJB-26-WRL-001 atau PJB-26-001 */
export const kodePenjualan = (komoditas?: string): string =>
  `PJB-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Purchase Order / Permintaan Gudang → PG-26-001 */
export const kodePO = (): string => `PG-${TAHUN}-${acak3()}`;

/** ID Permintaan Gudang → PG-26-WRL-001 atau PG-26-001 (PG = Permintaan Gudang) */
export const kodePermintaanGudang = (komoditasNama?: string, seq?: number): string =>
  seq !== undefined
    ? `PG-${TAHUN}${segKmd(komoditasNama)}-${String(seq).padStart(3, '0')}`
    : `PG-${TAHUN}${segKmd(komoditasNama)}-${acak3()}`;

/** Memformat ID/Nomor PO/Permintaan Gudang mentah menjadi format standar: PG-26-WRL-001 */
export const formatPOCode = (rawPo?: string, komoditasNama?: string): string => {
  if (!rawPo) return `PG-${TAHUN}${segKmd(komoditasNama)}-001`;
  if (/^(PG|PO|REQ-GDG)-\d{2}-[A-Z]{3}-\d{3}$/.test(rawPo)) return rawPo;
  if (/^(PG|PO|REQ-GDG)-\d{2}-\d{3}$/.test(rawPo)) return rawPo;

  const kmd = segKmd(komoditasNama);
  const matchDigits = rawPo.match(/\d+/g);
  let numStr = matchDigits ? matchDigits.join('').slice(-3) : '';
  if (!numStr || numStr.length < 3) {
    let hash = 0;
    for (let i = 0; i < rawPo.length; i++) hash = (hash * 31 + rawPo.charCodeAt(i)) % 900;
    numStr = String(Math.abs(hash) + 100).slice(-3);
  }
  return `PG-${TAHUN}${kmd}-${numStr.padStart(3, '0')}`;
};

/** ID Tender Komoditas → TDR-26-WRL-001 atau TDR-26-001 */
export const kodeTender = (komoditas?: string): string =>
  `TDR-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Penawaran Tender Petani → TP-26-WRL-001 atau TP-26-001 */
export const kodeTenderPetani = (komoditas?: string): string =>
  `TP-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Jadwal Penjemputan → PKP-26-BCS-001 atau PKP-26-001 */
export const kodePickup = (komoditas?: string): string =>
  `PKP-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** Nomor Invoice → INV-26-JGU-001 atau INV-26-001 */
export const kodeInvoice = (komoditas?: string): string =>
  `INV-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Pembayaran → PAY-26-WRL-001 atau PAY-26-001 */
export const kodePembayaran = (komoditas?: string): string =>
  `PAY-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Jejak Panen → JP-26-WRL-001 atau JP-26-001 */
export const kodeJejakPanen = (komoditas?: string): string =>
  `JP-${TAHUN}${segKmd(komoditas)}-${acak3()}`;

/** ID Buku Kas → BK-26-001  (tidak terkait komoditas) */
export const kodeBukuKas = (): string => `BK-${TAHUN}-${acak3()}`;

/** ID Artikel Edukasi → EDU-26-01 */
export const kodeEdukasi = (): string => `EDU-${TAHUN}-${acak2()}`;

/** ID Update Harga → HRG-26-01 */
export const kodeHarga = (): string => `HRG-${TAHUN}-${acak2()}`;

/** ID Histori Harga → HH-26-01 */
export const kodeHistoriHarga = (): string => `HH-${TAHUN}-${acak2()}`;

/** ID Notifikasi → NTF-26-001 */
export const kodeNotifikasi = (): string => `NTF-${TAHUN}-${acak3()}`;
