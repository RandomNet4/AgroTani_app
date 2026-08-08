// =====================================================
// SISTEM KODIFIKASI TERPUSAT - FRONTEND AGRO TANI
// Format: PREFIX-TT-[KMD]-NNN
// =====================================================

const TAHUN = new Date().getFullYear().toString().slice(-2); // "26"
const acak2 = (): string => String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
const acak3 = (): string => String(Math.floor(1 + Math.random() * 999)).padStart(3, '0');

// ──────────────────────────────────────────────────────────────
// KODE KOMODITAS SAYURAN
// WRL = Wortel | BCS = Buncis | JGU = Jagung Manis
// ──────────────────────────────────────────────────────────────

const KODE_KOMODITAS: Record<string, string> = {
  'wortel':       'WRL',
  'buncis':       'BCS',
  'jagung manis': 'JGU',
  'jagung':       'JGU',
};

export const kodeKomoditas = (namaKomoditas?: string): string => {
  if (!namaKomoditas) return '';
  return KODE_KOMODITAS[namaKomoditas.toLowerCase().trim()] || '';
};

const segKmd = (namaKomoditas?: string): string => {
  const k = kodeKomoditas(namaKomoditas);
  return k ? `-${k}` : '';
};

// ──────────────────────────────────────────────────────────────
// GENERATOR KODE DOKUMEN
// ──────────────────────────────────────────────────────────────

export const kodeDataPetani   = (seq?: number): string =>
  seq !== undefined
    ? `PTN-${TAHUN}-${String(seq).padStart(3, '0')}`
    : `PTN-${TAHUN}-${acak3()}`;

export const kodeLahan        = (): string => `LHN-${TAHUN}-${acak3()}`;
export const kodeTanaman      = (komoditas?: string): string => `TAN-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodePenjualan    = (komoditas?: string): string => `PJB-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodePO           = (): string => `PG-${TAHUN}-${acak3()}`;

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

export const kodeTender       = (komoditas?: string): string => `TDR-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodeTenderPetani = (komoditas?: string): string => `TP-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodePickup       = (komoditas?: string): string => `PKP-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodeInvoice      = (komoditas?: string): string => `INV-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodePembayaran   = (komoditas?: string): string => `PAY-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodeJejakPanen   = (komoditas?: string): string => `JP-${TAHUN}${segKmd(komoditas)}-${acak3()}`;
export const kodeBukuKas      = (): string => `BK-${TAHUN}-${acak3()}`;
export const kodeEdukasi      = (): string => `EDU-${TAHUN}-${acak2()}`;
export const kodeHarga        = (): string => `HRG-${TAHUN}-${acak2()}`;
export const kodeNotifikasi   = (): string => `NTF-${TAHUN}-${acak3()}`;

