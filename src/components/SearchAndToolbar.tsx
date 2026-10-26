import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, Grid3X3, Table, X } from 'lucide-react';
import type { ViewMode, FilterState } from '../types/catalog.ts';

interface SearchAndToolbarProps {
  filters: FilterState;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  filteredCount: number;
  totalCount: number;
}

export const SearchAndToolbar: React.FC<SearchAndToolbarProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  activeFilterCount,
  onToggleDrawer,
  isDrawerOpen,
  viewMode,
  onChangeViewMode,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="py-2.5 sm:py-3.5 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full">
      {/* Top Section: Search Input + Controls (Stacked on mobile, row on tablet/desktop) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Full-Width Mobile-Friendly Search Bar (>=44px touch height) */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            placeholder="Cari seri (BABY), kode (12), warna, dll..."
            className="w-full pl-9 pr-10 py-2.5 sm:py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-2xs transition-all min-h-[44px]"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onUpdateFilters({ searchQuery: '' })}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-2.5 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls Row: Filter Lanjutan, Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          {/* Advanced Filter Drawer Trigger */}
          <button
            type="button"
            onClick={onToggleDrawer}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] touch-manipulation ${
              isDrawerOpen || activeFilterCount > 0
                ? 'bg-amber-500/10 text-amber-900 border-amber-400/80 shadow-2xs font-bold'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="w-full sm:w-auto appearance-none bg-white border border-stone-300 rounded-xl px-3 py-2 pr-7 text-xs font-semibold text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-2xs cursor-pointer min-h-[44px] touch-manipulation"
            >
              <option value="series_asc">Seri & Kode (A-Z)</option>
              <option value="series_desc">Seri & Kode (Z-A)</option>
              <option value="segment_asc">Segmen: Terhemat</option>
              <option value="segment_desc">Segmen: Termahal</option>
              <option value="kode_asc">Kode (Kecil-Besar)</option>
              <option value="kode_desc">Kode (Besar-Kecil)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-[10px]">
              ▼
            </div>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 shadow-2xs shrink-0 min-h-[44px]">
            <button
              type="button"
              onClick={() => onChangeViewMode('grid4')}
              className={`p-2 rounded-lg transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation ${
                viewMode === 'grid4'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Mode Grid Standar"
              aria-label="Mode Grid Standar"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('grid6')}
              className={`p-2 rounded-lg transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation ${
                viewMode === 'grid6'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Mode Grid Ringkas"
              aria-label="Mode Grid Ringkas"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('table')}
              className={`p-2 rounded-lg transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation ${
                viewMode === 'table'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Mode Tabel / List"
              aria-label="Mode Tabel / List"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Information Counter & Active Filter Pills */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>
            Menampilkan <strong className="text-stone-900 font-semibold">{filteredCount}</strong> dari{' '}
            <strong className="text-stone-900 font-semibold">{totalCount}</strong> model
          </span>

          {filters.selectedSeries && filters.selectedSeries !== 'SEMUA_SERI' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 font-semibold text-[11px] border border-amber-300">
              Seri: {filters.selectedSeries}
              <button
                type="button"
                onClick={() => onUpdateFilters({ selectedSeries: 'SEMUA_SERI' })}
                className="hover:text-amber-950 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.selectedSegments.map((seg) => (
            <span
              key={seg}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-medium text-[11px]"
            >
              {seg}
              <button
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    selectedSegments: filters.selectedSegments.filter((s) => s !== seg),
                  })
                }
                className="hover:text-stone-950 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer py-1 touch-manipulation"
          >
            Reset Semua Filter
          </button>
        )}
      </div>
    </div>
  );
};
