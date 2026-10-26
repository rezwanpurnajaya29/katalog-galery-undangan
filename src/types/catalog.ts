export type PriceSegment = 'Super Hemat' | 'Ekonomis' | 'Menengah' | 'Premium';
export type ViewMode = 'grid4' | 'grid6' | 'table';
export type LipatanType = 'Lipat 2' | 'Lipat 3' | 'Single Card' | 'Lainnya';
export type OrientasiType = 'Potrait' | 'Landscape' | 'Square';
export type AmplopType = 'Dengan Amplop' | 'Tanpa Amplop';

export interface UndanganItem {
  id: string;
  series: string;
  nomorKode: string | number;
  warnaDominan: string;
  warnaSekunder?: string;
  lipatan: string;
  orientasi: string;
  amplop: string;
  segmenHarga: PriceSegment;
  gambar?: string;
  driveUrl?: string;
  thumbnailUrl?: string;
  keterangan?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedSeries: string; // 'SEMUA' or specific series name
  selectedSegments: PriceSegment[];
  selectedColors: string[];
  selectedLipatan: string[];
  selectedOrientasi: string[];
  selectedAmplop: string[];
  sortBy: 'series_asc' | 'series_desc' | 'kode_asc' | 'kode_desc' | 'segment_asc' | 'segment_desc';
}

export interface CatalogStats {
  total: number;
  filteredCount: number;
  countsBySegment: Record<PriceSegment, number>;
  countsBySeries: Record<string, number>;
  countsByLipatan: Record<string, number>;
  countsByOrientasi: Record<string, number>;
  countsByAmplop: Record<string, number>;
  countsByColor: Record<string, number>;
}
