import React from 'react';
import { X, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import type { FilterState, PriceSegment, CatalogStats } from '../types/catalog.ts';

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  onResetFilters: () => void;
  stats: CatalogStats;
}

const AVAILABLE_COLORS = [
  { name: 'Putih', hex: '#ffffff', border: true },
  { name: 'Krem', hex: '#f5ede0', border: true },
  { name: 'Kuning / Emas', hex: '#d4af37' },
  { name: 'Cokelat', hex: '#5d4037' },
  { name: 'Hitam', hex: '#1c1917' },
  { name: 'Hijau', hex: '#1b4d3e' },
  { name: 'Biru', hex: '#1e3a8a' },
  { name: 'Pink', hex: '#f472b6' },
  { name: 'Merah', hex: '#991b1b' },
  { name: 'Ungu', hex: '#6b21a8' },
  { name: 'Abu-abu', hex: '#64748b' },
];

const AVAILABLE_LIPATAN = ['Lipat 2', 'Lipat 3', 'Single Card'];
const AVAILABLE_ORIENTASI = ['Potrait', 'Landscape', 'Square'];
const AVAILABLE_AMPLOP = ['Dengan Amplop', 'Tanpa Amplop'];
const AVAILABLE_SEGMENTS: PriceSegment[] = ['Super Hemat', 'Ekonomis', 'Menengah', 'Premium'];

export const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  stats,
}) => {
  if (!isOpen) return null;

  const toggleSegment = (seg: PriceSegment) => {
    const exists = filters.selectedSegments.includes(seg);
    const updated = exists
      ? filters.selectedSegments.filter((s) => s !== seg)
      : [...filters.selectedSegments, seg];
    onUpdateFilters({ selectedSegments: updated });
  };

  const toggleColor = (color: string) => {
    const exists = filters.selectedColors.includes(color);
    const updated = exists
      ? filters.selectedColors.filter((c) => c !== color)
      : [...filters.selectedColors, color];
    onUpdateFilters({ selectedColors: updated });
  };

  const toggleLipatan = (lipatan: string) => {
    const exists = filters.selectedLipatan.includes(lipatan);
    const updated = exists
      ? filters.selectedLipatan.filter((l) => l !== lipatan)
      : [...filters.selectedLipatan, lipatan];
    onUpdateFilters({ selectedLipatan: updated });
  };

  const toggleOrientasi = (orientasi: string) => {
    const exists = filters.selectedOrientasi.includes(orientasi);
    const updated = exists
      ? filters.selectedOrientasi.filter((o) => o !== orientasi)
      : [...filters.selectedOrientasi, orientasi];
    onUpdateFilters({ selectedOrientasi: updated });
  };

  const toggleAmplop = (amplop: string) => {
    const exists = filters.selectedAmplop.includes(amplop);
    const updated = exists
      ? filters.selectedAmplop.filter((a) => a !== amplop)
      : [...filters.selectedAmplop, amplop];
    onUpdateFilters({ selectedAmplop: updated });
  };

  const totalActive =
    filters.selectedSegments.length +
    filters.selectedColors.length +
    filters.selectedLipatan.length +
    filters.selectedOrientasi.length +
    filters.selectedAmplop.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Full-width on mobile, Slide-over on Desktop) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#faf8f5] border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100/80 text-amber-900 rounded-lg">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Filter Spesifikasi
                </h3>
                <p className="text-[11px] text-stone-500">
                  Persempit pilihan katalog undangan
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer touch-manipulation"
              aria-label="Tutup filter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* 1. Kategori Segmen Harga */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Kategori Segmen
                </h4>
                {filters.selectedSegments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ selectedSegments: [] })}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SEGMENTS.map((seg) => {
                  const isChecked = filters.selectedSegments.includes(seg);
                  const count = stats.countsBySegment[seg] || 0;
                  return (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => toggleSegment(seg)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border text-left transition-all min-h-[44px] touch-manipulation cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                            isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <span className="text-[11px] font-semibold">{seg}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Warna Dominan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Warna Dominan
                </h4>
                {filters.selectedColors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ selectedColors: [] })}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_COLORS.map((col) => {
                  const isChecked = filters.selectedColors.includes(col.name);
                  const count = stats.countsByColor[col.name] || 0;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => toggleColor(col.name)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border text-left transition-all min-h-[44px] touch-manipulation cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-4 h-4 rounded-full shrink-0 shadow-2xs ${
                            col.border ? 'border border-stone-300' : ''
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-[11px] truncate">{col.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Model Lipatan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Model Lipatan
                </h4>
                {filters.selectedLipatan.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ selectedLipatan: [] })}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_LIPATAN.map((lip) => {
                  const isChecked = filters.selectedLipatan.includes(lip);
                  const count = stats.countsByLipatan[lip] || 0;
                  return (
                    <button
                      key={lip}
                      type="button"
                      onClick={() => toggleLipatan(lip)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs border text-center transition-all min-h-[48px] touch-manipulation cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-semibold text-[11px]">{lip}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Orientasi Layout */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Orientasi Layout
                </h4>
                {filters.selectedOrientasi.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ selectedOrientasi: [] })}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_ORIENTASI.map((ori) => {
                  const isChecked = filters.selectedOrientasi.includes(ori);
                  const count = stats.countsByOrientasi[ori] || 0;
                  return (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => toggleOrientasi(ori)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs border text-center transition-all min-h-[48px] touch-manipulation cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-semibold text-[11px]">{ori}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Kelengkapan Amplop */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Kelengkapan Amplop
                </h4>
                {filters.selectedAmplop.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ selectedAmplop: [] })}
                    className="text-[11px] text-amber-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_AMPLOP.map((amp) => {
                  const isChecked = filters.selectedAmplop.includes(amp);
                  const count = stats.countsByAmplop[amp] || 0;
                  return (
                    <button
                      key={amp}
                      type="button"
                      onClick={() => toggleAmplop(amp)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border text-left transition-all min-h-[44px] touch-manipulation cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                            isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <span className="text-[11px] font-semibold">{amp}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Sticky Action Controls (>=46px touch targets, pb-safe) */}
          <div className="p-4 bg-[#faf8f5] border-t border-stone-200 flex items-center gap-3 pb-safe">
            <button
              type="button"
              onClick={onResetFilters}
              disabled={totalActive === 0}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors min-h-[46px] touch-manipulation cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[46px] touch-manipulation cursor-pointer flex items-center justify-center"
            >
              Terapkan Filter {totalActive > 0 && `(${totalActive})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
