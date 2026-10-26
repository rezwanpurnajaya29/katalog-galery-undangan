import type { UndanganItem, FilterState, PriceSegment, CatalogStats } from '../types/catalog.ts';

export const ALL_SERIES_KEY = 'SEMUA';

export const PRICE_SEGMENT_WEIGHT: Record<PriceSegment, number> = {
  'Super Hemat': 1,
  'Ekonomis': 2,
  'Menengah': 3,
  'Premium': 4,
};

/**
 * Map Indonesian color names to their respective hex color codes
 */
export function getColorHex(colorName?: string): string {
  if (!colorName) return '#d4af37';
  const c = colorName.toLowerCase().trim();
  if (c.includes('putih') || c.includes('white')) return '#ffffff';
  if (c.includes('krem') || c.includes('cream')) return '#f5ede0';
  if (c.includes('kuning') || c.includes('emas') || c.includes('gold')) return '#d4af37';
  if (c.includes('cokelat') || c.includes('coklat') || c.includes('brown')) return '#5d4037';
  if (c.includes('hitam') || c.includes('black')) return '#1c1917';
  if (c.includes('hijau') || c.includes('green')) return '#1b4d3e';
  if (c.includes('biru') || c.includes('blue')) return '#1e3a8a';
  if (c.includes('pink') || c.includes('merah muda') || c.includes('rose')) return '#f472b6';
  if (c.includes('merah') || c.includes('red')) return '#991b1b';
  if (c.includes('ungu') || c.includes('purple')) return '#6b21a8';
  if (c.includes('abu') || c.includes('grey') || c.includes('gray')) return '#64748b';
  return '#d4af37';
}

/**
 * Determine price segment if not explicitly provided or for calculation.
 * Note: Numerical price is NEVER exposed to the UI or stored in the final item view.
 */
export function determineSegmentFromPrice(priceVal: unknown): PriceSegment {
  if (typeof priceVal === 'string') {
    const cleaned = priceVal.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      if (num < 50000) return 'Super Hemat';
      if (num < 70000) return 'Ekonomis';
      if (num < 150000) return 'Menengah';
      return 'Premium';
    }
  } else if (typeof priceVal === 'number' && !isNaN(priceVal)) {
    if (priceVal < 50000) return 'Super Hemat';
    if (priceVal < 70000) return 'Ekonomis';
    if (priceVal < 150000) return 'Menengah';
    return 'Premium';
  }
  return 'Ekonomis';
}

/**
 * Extract Google Drive file ID from various link formats, sharing URLs, or formulas
 */
export function extractGoogleDriveFileId(input?: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. If wrapped in Spreadsheet formula: =HYPERLINK("https://drive.google.com/...", "...")
  const hyperlinkMatch = trimmed.match(/=HYPERLINK\(\s*["']([^"']+)["']/i);
  const target = hyperlinkMatch ? hyperlinkMatch[1] : trimmed;

  // 2. Standard sharing: /file/d/FILE_ID/view or /file/d/FILE_ID
  const fileDMatch = target.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // 3. /open?id=FILE_ID or ?id=FILE_ID or &id=FILE_ID
  const idMatch = target.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);
  if (idMatch && idMatch[1]) return idMatch[1];

  // 4. /d/FILE_ID/
  const dMatch = target.match(/\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (dMatch && dMatch[1]) return dMatch[1];

  // 5. lh3 / drive thumbnail: /d/FILE_ID or id=FILE_ID
  const lh3Match = target.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  // 6. Direct Google Drive ID (25 to 45 alphanumeric characters with underscores/hyphens)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(target) && !target.includes('.')) {
    return target;
  }

  return null;
}

/**
 * Get prioritized list of direct Google Drive image CDN URLs for a file ID
 */
export function getGoogleDriveImageUrls(fileId: string): string[] {
  return [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
}

/**
 * Resolve direct image thumbnail from Google Drive URL or direct HTTP link
 */
export function resolveDriveThumbnail(urlOrName?: string): string | undefined {
  if (!urlOrName || typeof urlOrName !== 'string') return undefined;
  const trimmed = urlOrName.trim();
  if (!trimmed) return undefined;

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // If it's already an HTTP / HTTPS link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If it is just a filename like "Baby-08.jpg", return undefined so generated cover will render
  return undefined;
}

/**
 * Filter items according to user selections
 */
export function filterItems(items: UndanganItem[], filters: FilterState): UndanganItem[] {
  return items.filter((item) => {
    // 1. Search Query (Series, Nomor Kode, Warna, etc.)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchSeries = item.series.toLowerCase().includes(q);
      const matchKode = String(item.nomorKode).toLowerCase().includes(q);
      const matchWarna = item.warnaDominan.toLowerCase().includes(q) ||
        (item.warnaSekunder ? item.warnaSekunder.toLowerCase().includes(q) : false);
      const matchSegment = item.segmenHarga.toLowerCase().includes(q);
      const matchLipatan = item.lipatan.toLowerCase().includes(q);
      const matchOrientasi = item.orientasi.toLowerCase().includes(q);
      const matchAmplop = item.amplop.toLowerCase().includes(q);

      if (!matchSeries && !matchKode && !matchWarna && !matchSegment && !matchLipatan && !matchOrientasi && !matchAmplop) {
        return false;
      }
    }

    // 2. Selected Series
    if (filters.selectedSeries && filters.selectedSeries !== ALL_SERIES_KEY) {
      if (item.series.trim().toUpperCase() !== filters.selectedSeries.trim().toUpperCase()) {
        return false;
      }
    }

    // 3. Selected Segments
    if (filters.selectedSegments.length > 0) {
      if (!filters.selectedSegments.includes(item.segmenHarga)) {
        return false;
      }
    }

    // 4. Selected Colors (Warna Dominan)
    if (filters.selectedColors.length > 0) {
      const colorMatch = filters.selectedColors.some(
        (c) => item.warnaDominan.toLowerCase().includes(c.toLowerCase()) ||
               (item.warnaSekunder && item.warnaSekunder.toLowerCase().includes(c.toLowerCase()))
      );
      if (!colorMatch) return false;
    }

    // 5. Selected Lipatan
    if (filters.selectedLipatan.length > 0) {
      const lipatanMatch = filters.selectedLipatan.some((l) =>
        item.lipatan.toLowerCase().includes(l.toLowerCase())
      );
      if (!lipatanMatch) return false;
    }

    // 6. Selected Orientasi
    if (filters.selectedOrientasi.length > 0) {
      const orientasiMatch = filters.selectedOrientasi.some((o) => {
        const itemOri = item.orientasi.toLowerCase();
        const filterOri = o.toLowerCase();
        if ((filterOri.includes('square') || filterOri.includes('persegi')) && (itemOri.includes('square') || itemOri.includes('persegi'))) {
          return true;
        }
        return itemOri.includes(filterOri);
      });
      if (!orientasiMatch) return false;
    }

    // 7. Selected Amplop
    if (filters.selectedAmplop.length > 0) {
      const amplopMatch = filters.selectedAmplop.some((a) =>
        item.amplop.toLowerCase().includes(a.toLowerCase())
      );
      if (!amplopMatch) return false;
    }

    return true;
  });
}

/**
 * Sort items based on criteria
 */
export function sortItems(items: UndanganItem[], sortBy: FilterState['sortBy']): UndanganItem[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'series_asc': {
        const seriesCmp = a.series.localeCompare(b.series);
        if (seriesCmp !== 0) return seriesCmp;
        return compareKode(a.nomorKode, b.nomorKode);
      }
      case 'series_desc': {
        const seriesCmp = b.series.localeCompare(a.series);
        if (seriesCmp !== 0) return seriesCmp;
        return compareKode(b.nomorKode, a.nomorKode);
      }
      case 'kode_asc':
        return compareKode(a.nomorKode, b.nomorKode);
      case 'kode_desc':
        return compareKode(b.nomorKode, a.nomorKode);
      case 'segment_asc': {
        const wA = PRICE_SEGMENT_WEIGHT[a.segmenHarga] || 0;
        const wB = PRICE_SEGMENT_WEIGHT[b.segmenHarga] || 0;
        if (wA !== wB) return wA - wB;
        return a.series.localeCompare(b.series);
      }
      case 'segment_desc': {
        const wA = PRICE_SEGMENT_WEIGHT[a.segmenHarga] || 0;
        const wB = PRICE_SEGMENT_WEIGHT[b.segmenHarga] || 0;
        if (wA !== wB) return wB - wA;
        return a.series.localeCompare(b.series);
      }
      default:
        return 0;
    }
  });

  return sorted;
}

function compareKode(a: string | number, b: string | number): number {
  const numA = parseInt(String(a).replace(/[^0-9]/g, ''), 10);
  const numB = parseInt(String(b).replace(/[^0-9]/g, ''), 10);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return String(a).localeCompare(String(b));
}

/**
 * Calculate dynamic statistics from dataset
 */
export function calculateStats(all: UndanganItem[], filtered: UndanganItem[]): CatalogStats {
  const countsBySegment: Record<PriceSegment, number> = {
    'Super Hemat': 0,
    'Ekonomis': 0,
    'Menengah': 0,
    'Premium': 0,
  };

  const countsBySeries: Record<string, number> = {};
  const countsByLipatan: Record<string, number> = {};
  const countsByOrientasi: Record<string, number> = {};
  const countsByAmplop: Record<string, number> = {};
  const countsByColor: Record<string, number> = {};

  // Compute for all items so header and series pills reflect full inventory breakdown
  for (const item of all) {
    if (item.segmenHarga in countsBySegment) {
      countsBySegment[item.segmenHarga]++;
    }

    const s = item.series.trim().toUpperCase();
    countsBySeries[s] = (countsBySeries[s] || 0) + 1;

    const lip = item.lipatan.trim();
    if (lip) countsByLipatan[lip] = (countsByLipatan[lip] || 0) + 1;

    const ori = item.orientasi.trim();
    if (ori) {
      countsByOrientasi[ori] = (countsByOrientasi[ori] || 0) + 1;
      if (ori.toLowerCase().includes('square') || ori.toLowerCase().includes('persegi')) {
        countsByOrientasi['Persegi'] = (countsByOrientasi['Persegi'] || 0) + 1;
        countsByOrientasi['Square'] = (countsByOrientasi['Square'] || 0) + 1;
      }
    }

    const amp = item.amplop.trim();
    if (amp) countsByAmplop[amp] = (countsByAmplop[amp] || 0) + 1;

    const col = item.warnaDominan.trim();
    if (col) countsByColor[col] = (countsByColor[col] || 0) + 1;
  }

  return {
    total: all.length,
    filteredCount: filtered.length,
    countsBySegment,
    countsBySeries,
    countsByLipatan,
    countsByOrientasi,
    countsByAmplop,
    countsByColor,
  };
}

/**
 * Nomor WhatsApp resmi UD REZ WAN JAYA
 */
export const DEFAULT_WHATSAPP_NUMBER = '085103580450';

/**
 * Format nomor WhatsApp ke format internasional wa.me (misal 085103580450 -> 6285103580450)
 */
export function formatWhatsAppNumberForLink(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Generate WhatsApp inquiry URL with pre-filled message (strictly NO numerical price)
 */
export function generateWhatsAppLink(item: UndanganItem, phone: string = DEFAULT_WHATSAPP_NUMBER): string {
  const cleanPhone = formatWhatsAppNumberForLink(phone);
  const msg = `Halo UD REZ WAN JAYA,\nSaya tertarik dengan Blangko Undangan:\n- Seri: ${item.series}\n- Nomor Kode: ${item.nomorKode}\n- Segmen: ${item.segmenHarga}\n- Lipatan: ${item.lipatan}\n- Orientasi: ${item.orientasi}\n- Amplop: ${item.amplop}\n\nApakah model ini masih tersedia? Terima kasih!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
