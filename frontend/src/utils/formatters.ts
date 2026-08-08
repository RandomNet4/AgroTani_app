export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatTanggal = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Fallback for invalid dates
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const hitungHariMenuju = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generates a clean, realistic, professional code (e.g., PJB-2026-8536, PO-2026-042)
export const generateCleanCode = (prefix: string): string => {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${num}`;
};

// Formats any messy/legacy raw ID into a clean professional code (e.g., #PJB_PO_TP_1785048536418_c0qc1 -> PJB-2026-8536)
export const formatCleanCode = (rawId: string, defaultPrefix = 'PO'): string => {
  if (!rawId) return '-';
  
  // If already clean (e.g., PJB-2026-8536 or PO-001 or REQ-001), return as-is
  if (/^[A-Z]{2,4}-\d{4}-\d{3,6}$/.test(rawId) || /^[A-Z]{2,4}-\d{3,6}$/.test(rawId)) {
    return rawId;
  }

  // Determine prefix
  let prefix = defaultPrefix;
  if (rawId.includes('PJB')) prefix = 'PJB';
  else if (rawId.includes('PO')) prefix = 'PO';
  else if (rawId.includes('TDR')) prefix = 'TDR';
  else if (rawId.includes('TP')) prefix = 'TP';
  else if (rawId.includes('PKP')) prefix = 'PKP';
  else if (rawId.includes('INV')) prefix = 'INV';

  // Extract hash/numbers to form a deterministic 4-digit code
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash * 31 + rawId.charCodeAt(i)) % 9000;
  }
  const cleanNum = (1000 + Math.abs(hash)).toString();

  return `${prefix}-2026-${cleanNum}`;
};

export const formatOrderId = (id: string): string => {
  return formatCleanCode(id, 'PO');
};

export const formatPetaniId = (id: string): string => {
  if (!id) return '-';
  if (id.startsWith('PTN-') && id.length <= 12) return id;
  if (id.startsWith('PTN')) {
    const numPart = id.replace('PTN', '').replace('_', '');
    if (numPart.length > 5) {
      return `PTN-${numPart.slice(-4)}`;
    }
    return `PTN-${numPart}`;
  }
  return `PTN-${id.slice(0, 4).toUpperCase()}`;
};
