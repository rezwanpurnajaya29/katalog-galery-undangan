import type { UndanganItem, PriceSegment } from '../types/catalog.ts';
import { determineSegmentFromPrice, resolveDriveThumbnail } from '../utils/filterAndSort.ts';
import { INITIAL_CATALOG_DATA } from '../data/seedData.ts';

// User-configurable constants
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqc3W6nIr8wMAsb4h0rsaEMBGKYpJoMHonGtIYTwba0WHdBOhG82WTpB9aFw3Rs1Nfyg/exec';
export const SPREADSHEET_ID = '11PIHSnOEufPAdjpYHguf6TRYG27VzpNxAu-QyQjltQI';
export const SHEET_NAME = 'KATALOG';
export const SHEET_GID = '621295984';

const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
const LOCAL_STORAGE_KEY = 'ud_rwj_catalog_cache_v2';
const LOCAL_STORAGE_TIME_KEY = 'ud_rwj_catalog_last_sync_v2';

export interface FetchResult {
  items: UndanganItem[];
  source: 'apps_script' | 'gviz' | 'cache' | 'seed';
  lastSyncedAt: Date;
  error?: string;
}

/**
 * Main fetcher function: tries Apps Script first, then Google Visualization API, then local cache / seed data
 */
export async function fetchLiveCatalog(customScriptUrl?: string): Promise<FetchResult> {
  const targetScriptUrl = customScriptUrl?.trim() || APPS_SCRIPT_URL;

  // 1. Try Google Apps Script Web App
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(targetScriptUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const rawData = Array.isArray(json) ? json : json?.data || json?.rows;
      if (Array.isArray(rawData) && rawData.length > 0) {
        const items = parseAppsScriptRows(rawData);
        if (items.length > 0) {
          saveToCache(items);
          return {
            items,
            source: 'apps_script',
            lastSyncedAt: new Date(),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Apps Script fetch failed, falling back to GViz:', err);
  }

  // 2. Try Google Visualization API (GViz)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(GVIZ_URL, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      const items = parseGvizText(text);
      if (items.length > 0) {
        saveToCache(items);
        return {
          items,
          source: 'gviz',
          lastSyncedAt: new Date(),
        };
      }
    }
  } catch (err) {
    console.warn('Google Visualization API fetch failed, falling back to cache/seed:', err);
  }

  // 3. Fallback to LocalStorage Cache
  const cached = loadFromCache();
  if (cached && cached.items.length > 0) {
    return {
      items: cached.items,
      source: 'cache',
      lastSyncedAt: cached.lastSyncedAt,
    };
  }

  // 4. Default Seed Data
  return {
    items: INITIAL_CATALOG_DATA,
    source: 'seed',
    lastSyncedAt: new Date(),
  };
}

/**
 * Parse rows returned from Google Apps Script Web App
 * Note: STRICTLY OMIT ANY NUMERIC PRICE FROM OUTPUT
 */
function parseAppsScriptRows(rows: Array<Record<string, unknown>>): UndanganItem[] {
  const items: UndanganItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const series = String(r['Series'] || r['series'] || r['SERIES'] || '').trim();
    if (!series) continue;

    const nomorKode = r['Nomor Kode'] ?? r['Kode'] ?? r['kode'] ?? (i + 1);
    const warnaDominan = String(r['Warna Dominan'] || r['warnaDominan'] || r['Warna'] || 'Krem').trim();
    const warnaSekunder = r['Warna Sekunder'] ? String(r['Warna Sekunder']).trim() : undefined;
    const lipatan = String(r['Lipatan'] || r['lipatan'] || 'Lipat 2').trim();
    const orientasi = String(r['Orientasi Layout'] || r['Orientasi'] || r['orientasi'] || 'Potrait').trim();
    const amplop = String(r['Amplop'] || r['amplop'] || 'Tanpa Amplop').trim();

    // Determine segment without exposing raw price
    let segmen: PriceSegment = 'Ekonomis';
    const rawSegmen = String(r['Segmen Harga'] || r['Segmen'] || '').trim();
    if (isValidSegment(rawSegmen)) {
      segmen = rawSegmen as PriceSegment;
    } else if (r['Harga (IDR)'] || r['Harga'] || r['harga']) {
      segmen = determineSegmentFromPrice(r['Harga (IDR)'] || r['Harga'] || r['harga']);
    }

    const rawGambar = String(r['Lihat Gambar'] || r['Gambar'] || r['gambar'] || '').trim();
    const rawDrive = r['DriveUrl'] ? String(r['DriveUrl']).trim() : '';
    const rawThumb = r['ThumbnailUrl'] ? String(r['ThumbnailUrl']).trim() : '';
    
    // Choose the best candidate among the columns
    let candidate = rawThumb || rawDrive || rawGambar;
    if (!candidate.startsWith('http')) {
      // Check other properties for any drive links
      for (const [k, v] of Object.entries(r)) {
        if (typeof v === 'string' && (v.includes('drive.google.com') || v.includes('googleusercontent.com') || v.startsWith('http'))) {
          candidate = v.trim();
          break;
        }
      }
    }

    const driveUrl = candidate.startsWith('http') ? candidate : (r['DriveUrl'] ? String(r['DriveUrl']).trim() : undefined);
    const thumbnailUrl = resolveDriveThumbnail(candidate);

    items.push({
      id: `${series}-${nomorKode}-${i}`,
      series,
      nomorKode: String(nomorKode),
      warnaDominan,
      warnaSekunder,
      lipatan,
      orientasi,
      amplop,
      segmenHarga: segmen,
      gambar: rawGambar || candidate,
      driveUrl,
      thumbnailUrl,
    });
  }

  return items;
}

/**
 * Parse JSONP/Text response from Google Visualization API:
 * /*O_o* /google.visualization.Query.setResponse({...});
 */
function parseGvizText(text: string): UndanganItem[] {
  try {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) return [];

    const jsonStr = text.substring(startIdx, endIdx + 1);
    const data = JSON.parse(jsonStr);

    const cols: Array<{ label: string }> = data?.table?.cols || [];
    const rows: Array<{ c: Array<{ v: unknown; f?: string } | null> }> = data?.table?.rows || [];

    const colIndexMap: Record<string, number> = {};
    cols.forEach((col, idx) => {
      const label = (col.label || '').trim().toLowerCase();
      colIndexMap[label] = idx;
    });

    const getVal = (rowCells: Array<{ v: unknown; f?: string } | null>, keyName: string): unknown => {
      const idx = colIndexMap[keyName.toLowerCase()];
      if (idx !== undefined && rowCells[idx]) {
        return rowCells[idx]?.f ?? rowCells[idx]?.v;
      }
      return undefined;
    };

    const items: UndanganItem[] = [];

    rows.forEach((row, i) => {
      const cells = row.c || [];
      const series = String(getVal(cells, 'Series') || cells[0]?.v || '').trim();
      if (!series) return;

      const nomorKode = getVal(cells, 'Nomor Kode') ?? cells[1]?.f ?? cells[1]?.v ?? (i + 1);
      const warnaDominan = String(getVal(cells, 'Warna Dominan') || cells[3]?.v || 'Krem').trim();
      const warnaSekunder = getVal(cells, 'Warna Sekunder') ? String(getVal(cells, 'Warna Sekunder')).trim() : undefined;
      const lipatan = String(getVal(cells, 'Lipatan') || cells[5]?.v || 'Lipat 2').trim();
      const orientasi = String(getVal(cells, 'Orientasi Layout') || cells[6]?.v || 'Potrait').trim();
      const amplop = String(getVal(cells, 'Amplop') || cells[7]?.v || 'Tanpa Amplop').trim();

      let segmen: PriceSegment = 'Ekonomis';
      const rawSegmen = String(getVal(cells, 'Segmen Harga') || cells[8]?.v || '').trim();
      if (isValidSegment(rawSegmen)) {
        segmen = rawSegmen as PriceSegment;
      } else {
        const rawPrice = getVal(cells, 'Harga (IDR)') ?? cells[2]?.v;
        segmen = determineSegmentFromPrice(rawPrice);
      }

      const rawColJ = String(getVal(cells, 'Lihat Gambar') || cells[9]?.v || '').trim();
      let candidateUrl = rawColJ;

      // If column J is not a direct URL, check if column K, L, M etc. contains a Drive URL
      if (!candidateUrl.startsWith('http') && !candidateUrl.includes('drive.google.com')) {
        for (let c = 10; c < cells.length; c++) {
          const val = String(cells[c]?.v || '').trim();
          if (val.startsWith('http') || val.includes('drive.google.com') || val.includes('googleusercontent.com')) {
            candidateUrl = val;
            break;
          }
        }
      }

      const driveUrl = candidateUrl.startsWith('http') ? candidateUrl : undefined;
      const thumbnailUrl = resolveDriveThumbnail(candidateUrl);

      items.push({
        id: `${series}-${nomorKode}-${i}`,
        series,
        nomorKode: String(nomorKode),
        warnaDominan,
        warnaSekunder,
        lipatan,
        orientasi,
        amplop,
        segmenHarga: segmen,
        gambar: rawColJ || candidateUrl,
        driveUrl,
        thumbnailUrl,
      });
    });

    return items;
  } catch (err) {
    console.error('Failed to parse GViz text:', err);
    return [];
  }
}

function isValidSegment(val: string): boolean {
  return ['Super Hemat', 'Ekonomis', 'Menengah', 'Premium'].includes(val);
}

function saveToCache(items: UndanganItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(LOCAL_STORAGE_TIME_KEY, new Date().toISOString());
  } catch {
    // Ignore quota errors
  }
}

function loadFromCache(): { items: UndanganItem[]; lastSyncedAt: Date } | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const timeRaw = localStorage.getItem(LOCAL_STORAGE_TIME_KEY);
    if (!raw) return null;
    const items = JSON.parse(raw);
    if (Array.isArray(items) && items.length > 0) {
      return {
        items,
        lastSyncedAt: timeRaw ? new Date(timeRaw) : new Date(),
      };
    }
  } catch {
    return null;
  }
  return null;
}
