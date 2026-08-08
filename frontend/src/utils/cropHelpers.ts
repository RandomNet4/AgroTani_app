/**
 * Helper to calculate active crop planting progress.
 * Consistent across Petani, Kepala Petani, and Admin dashboards.
 */
export const hitungProgressTanaman = (
  tanggalTanam: string,
  estimasiPanen: string,
  statusVerifikasi?: string
): number => {
  if (statusVerifikasi === 'pending' || statusVerifikasi === 'rejected') {
    return 0;
  }

  const tanam = new Date(tanggalTanam);
  const panen = new Date(estimasiPanen);
  const today = new Date(); // Real current system date

  const total = panen.getTime() - tanam.getTime();
  if (total <= 0) return 0;

  const elapsed = today.getTime() - tanam.getTime();
  let progress = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));

  // If harvest is 14 days or less away, treat as 100% (Siap Panen)
  const selisih = panen.getTime() - today.getTime();
  const hariMenujuPanen = Math.ceil(selisih / (1000 * 60 * 60 * 24));

  if (progress >= 100 || hariMenujuPanen <= 14) {
    progress = 100;
  }

  return progress;
};

export interface LogbookEntry {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kategori: string;
  catatan: string;
}

export const parseLogbook = (catatanRaw: string | null | undefined, tanggalTanam: string): LogbookEntry[] => {
  if (!catatanRaw) {
    return [{
      id: 'init',
      tanggal: tanggalTanam,
      kategori: 'Penanaman',
      catatan: 'Awal penanaman komoditas.'
    }];
  }
  try {
    const parsed = JSON.parse(catatanRaw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Return backward compatible single entry
  }
  return [
    {
      id: 'init',
      tanggal: tanggalTanam,
      kategori: 'Penanaman',
      catatan: catatanRaw
    }
  ];
};

/**
 * Map commodity names to matching HD photos and emojis.
 * Ensures Wortel -> Wortel, Jagung -> Jagung, Buncis -> Buncis, etc.
 */
export const getKomoditasImageMap = (namaOrGambar?: string): { url: string; emoji: string } => {
  if (namaOrGambar && (namaOrGambar.startsWith('http://') || namaOrGambar.startsWith('https://') || namaOrGambar.startsWith('data:'))) {
    return { url: namaOrGambar, emoji: '🌾' };
  }
  const name = (namaOrGambar || '').toLowerCase();

  if (name.includes('wortel') || name.includes('carrot') || name === '🥕') {
    return {
      url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
      emoji: '🥕'
    };
  }
  if (name.includes('jagung') || name.includes('corn') || name === '🌽') {
    return {
      url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
      emoji: '🌽'
    };
  }
  if (name.includes('buncis') || name.includes('bean') || name === '🫛') {
    return {
      url: 'https://images.unsplash.com/photo-1583091931818-406c7e289ec0?w=600&q=80',
      emoji: '🫛'
    };
  }
  if (name.includes('cabai') || name.includes('cabe') || name.includes('chili') || name === '🌶️') {
    return {
      url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80',
      emoji: '🌶️'
    };
  }
  if (name.includes('bawang') || name.includes('shallot') || name.includes('onion') || name === '🧅') {
    return {
      url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
      emoji: '🧅'
    };
  }
  if (name.includes('tomat') || name.includes('tomato') || name === '🍅') {
    return {
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
      emoji: '🍅'
    };
  }
  if (name.includes('kentang') || name.includes('potato') || name === '🥔') {
    return {
      url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
      emoji: '🥔'
    };
  }
  if (name.includes('kubis') || name.includes('kol') || name.includes('cabbage') || name === '🥬') {
    return {
      url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80',
      emoji: '🥬'
    };
  }
  if (name.includes('padi') || name.includes('beras') || name === '🌾') {
    return {
      url: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&q=80',
      emoji: '🌾'
    };
  }

  // Fallback
  return {
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
    emoji: '🌱'
  };
};

