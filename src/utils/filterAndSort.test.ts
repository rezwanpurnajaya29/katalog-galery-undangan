import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterItems,
  sortItems,
  calculateStats,
  determineSegmentFromPrice,
  resolveDriveThumbnail,
  extractGoogleDriveFileId,
  getGoogleDriveImageUrls,
  generateWhatsAppLink,
  getColorHex,
  ALL_SERIES_KEY
} from './filterAndSort.ts';
import type { UndanganItem, FilterState } from '../types/catalog.ts';

const mockItems: UndanganItem[] = [
  {
    id: '1',
    series: 'BABY',
    nomorKode: '8',
    warnaDominan: 'Cokelat',
    warnaSekunder: 'Krem',
    lipatan: 'Lipat 3',
    orientasi: 'Potrait',
    amplop: 'Dengan Amplop',
    segmenHarga: 'Premium',
  },
  {
    id: '2',
    series: 'BELIYA',
    nomorKode: '2',
    warnaDominan: 'Hijau',
    warnaSekunder: 'Emas',
    lipatan: 'Lipat 2',
    orientasi: 'Landscape',
    amplop: 'Tanpa Amplop',
    segmenHarga: 'Ekonomis',
  },
  {
    id: '3',
    series: 'FALAH',
    nomorKode: '110',
    warnaDominan: 'Biru',
    warnaSekunder: 'Putih',
    lipatan: 'Single Card',
    orientasi: 'Potrait',
    amplop: 'Tanpa Amplop',
    segmenHarga: 'Super Hemat',
  },
  {
    id: '4',
    series: 'ZIGNA',
    nomorKode: '5',
    warnaDominan: 'Hitam',
    warnaSekunder: 'Emas',
    lipatan: 'Lipat 2',
    orientasi: 'Square',
    amplop: 'Dengan Amplop',
    segmenHarga: 'Menengah',
  },
];

const defaultFilters: FilterState = {
  searchQuery: '',
  selectedSeries: ALL_SERIES_KEY,
  selectedSegments: [],
  selectedColors: [],
  selectedLipatan: [],
  selectedOrientasi: [],
  selectedAmplop: [],
  sortBy: 'series_asc',
};

test('extractGoogleDriveFileId extracts file IDs from all sharing and formula formats', () => {
  const url1 = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing';
  assert.equal(extractGoogleDriveFileId(url1), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');

  const url2 = 'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs';
  assert.equal(extractGoogleDriveFileId(url2), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');

  const url3 = 'https://drive.google.com/uc?export=view&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs';
  assert.equal(extractGoogleDriveFileId(url3), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');

  const formula = '=HYPERLINK("https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view", "Baby-08.jpg")';
  assert.equal(extractGoogleDriveFileId(formula), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');

  const plainId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs';
  assert.equal(extractGoogleDriveFileId(plainId), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');

  const filenameOnly = 'Baby-08.jpg';
  assert.equal(extractGoogleDriveFileId(filenameOnly), null);
});

test('resolveDriveThumbnail converts Google Drive URLs to previewable thumbnail URL and ignores local filenames', () => {
  const gDriveUrl = 'https://drive.google.com/file/d/1aB2c3D4e5F6G7H8I9J0K1L2M/view?usp=sharing';
  const resolved = resolveDriveThumbnail(gDriveUrl);
  assert.equal(resolved, 'https://lh3.googleusercontent.com/d/1aB2c3D4e5F6G7H8I9J0K1L2M');

  const plainFilename = 'Baby-08.jpg';
  assert.equal(resolveDriveThumbnail(plainFilename), undefined);
});

test('determineSegmentFromPrice categorizes prices accurately without leaking numeric value', () => {
  assert.equal(determineSegmentFromPrice('Rp 32,000'), 'Super Hemat');
  assert.equal(determineSegmentFromPrice(47000), 'Super Hemat');
  assert.equal(determineSegmentFromPrice('Rp 57.000'), 'Ekonomis');
  assert.equal(determineSegmentFromPrice('Rp 70,000'), 'Menengah');
  assert.equal(determineSegmentFromPrice('Rp 170.000'), 'Premium');
  assert.equal(determineSegmentFromPrice(255000), 'Premium');
});

test('filterItems filters by Series correctly', () => {
  const filters: FilterState = { ...defaultFilters, selectedSeries: 'BABY' };
  const result = filterItems(mockItems, filters);
  assert.equal(result.length, 1);
  assert.equal(result[0].series, 'BABY');
});

test('filterItems filters by Price Segment correctly', () => {
  const filters: FilterState = { ...defaultFilters, selectedSegments: ['Premium', 'Menengah'] };
  const result = filterItems(mockItems, filters);
  assert.equal(result.length, 2);
  const segments = result.map((r) => r.segmenHarga);
  assert.ok(segments.includes('Premium'));
  assert.ok(segments.includes('Menengah'));
  assert.ok(!segments.includes('Super Hemat'));
});

test('filterItems filters by Color Dominan correctly', () => {
  const filters: FilterState = { ...defaultFilters, selectedColors: ['Cokelat'] };
  const result = filterItems(mockItems, filters);
  assert.equal(result.length, 1);
  assert.equal(result[0].warnaDominan, 'Cokelat');
});

test('filterItems filters by Search Query across Series, Kode and Color', () => {
  const filters: FilterState = { ...defaultFilters, searchQuery: '110' };
  const result = filterItems(mockItems, filters);
  assert.equal(result.length, 1);
  assert.equal(result[0].series, 'FALAH');
});

test('sortItems sorts by series ascending and descending', () => {
  const sortedAsc = sortItems(mockItems, 'series_asc');
  assert.equal(sortedAsc[0].series, 'BABY');
  assert.equal(sortedAsc[sortedAsc.length - 1].series, 'ZIGNA');

  const sortedDesc = sortItems(mockItems, 'series_desc');
  assert.equal(sortedDesc[0].series, 'ZIGNA');
  assert.equal(sortedDesc[sortedDesc.length - 1].series, 'BABY');
});

test('sortItems sorts by price segment weight', () => {
  const sortedSegAsc = sortItems(mockItems, 'segment_asc');
  assert.equal(sortedSegAsc[0].segmenHarga, 'Super Hemat');
  assert.equal(sortedSegAsc[sortedSegAsc.length - 1].segmenHarga, 'Premium');
});

test('calculateStats aggregates totals and category counters accurately', () => {
  const stats = calculateStats(mockItems, mockItems);
  assert.equal(stats.total, 4);
  assert.equal(stats.countsBySegment['Premium'], 1);
  assert.equal(stats.countsBySegment['Super Hemat'], 1);
  assert.equal(stats.countsBySegment['Ekonomis'], 1);
  assert.equal(stats.countsBySegment['Menengah'], 1);
  assert.equal(stats.countsBySeries['BABY'], 1);
  assert.equal(stats.countsBySeries['FALAH'], 1);
});

test('generateWhatsAppLink produces safe inquiry without numerical price', () => {
  const linkDefault = generateWhatsAppLink(mockItems[0]);
  assert.ok(linkDefault.includes('wa.me/6285103580450'));
  assert.ok(linkDefault.includes('BABY'));
  assert.ok(linkDefault.includes('Premium'));
  assert.ok(!linkDefault.includes('Rp'));
  assert.ok(!linkDefault.includes('255000'));

  const linkLocal = generateWhatsAppLink(mockItems[0], '085103580450');
  assert.ok(linkLocal.includes('wa.me/6285103580450'));
});

test('getColorHex maps Indonesian color names to appropriate hex codes', () => {
  assert.equal(getColorHex('Putih'), '#ffffff');
  assert.equal(getColorHex('Hitam'), '#1c1917');
  assert.equal(getColorHex('Biru'), '#1e3a8a');
  assert.equal(getColorHex('Hijau'), '#1b4d3e');
  assert.equal(getColorHex('Krem'), '#f5ede0');
  assert.equal(getColorHex('Kuning / Emas'), '#d4af37');
  assert.equal(getColorHex('Cokelat'), '#5d4037');
});
