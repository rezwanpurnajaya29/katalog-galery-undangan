import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { ALL_SERIES_KEY } from '../utils/filterAndSort.ts';

interface SeriesFilterBarProps {
  seriesList: string[]; // Dynamically generated unique series from spreadsheet
  countsBySeries: Record<string, number>;
  totalCount: number;
  selectedSeries: string;
  onSelectSeries: (series: string) => void;
}

export const SeriesFilterBar: React.FC<SeriesFilterBarProps> = ({
  seriesList,
  countsBySeries,
  totalCount,
  selectedSeries,
  onSelectSeries,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const isAllSelected = !selectedSeries || selectedSeries === ALL_SERIES_KEY;

  return (
    <div className="relative py-2 sm:py-2.5 bg-white border-b border-stone-200/80 shadow-2xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Label icon */}
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-700 uppercase tracking-wider shrink-0 pr-1.5 sm:pr-2 border-r border-stone-200">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] sm:text-xs">Seri:</span>
          </div>

          {/* Left Arrow (Visible on tablet/desktop) */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="hidden sm:flex p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer min-w-[32px] min-h-[32px] items-center justify-center"
            aria-label="Gulir ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Series Pills Ribbon - Completely hidden scrollbar */}
          <div
            ref={scrollRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full [&::-webkit-scrollbar]:hidden"
          >
            {/* ALL Series Pill */}
            <button
              type="button"
              onClick={() => onSelectSeries(ALL_SERIES_KEY)}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[36px] sm:min-h-[34px] touch-manipulation ${
                isAllSelected
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-transparent'
              }`}
            >
              <span>Semua Seri</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isAllSelected ? 'bg-amber-800/40 text-amber-100' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {totalCount}
              </span>
            </button>

            {/* Individual Series Pills */}
            {seriesList.map((seriesName) => {
              const isSelected = selectedSeries.trim().toUpperCase() === seriesName.trim().toUpperCase();
              const count = countsBySeries[seriesName.toUpperCase()] || 0;

              return (
                <button
                  key={seriesName}
                  type="button"
                  onClick={() => onSelectSeries(seriesName)}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[36px] sm:min-h-[34px] touch-manipulation ${
                    isSelected
                      ? 'bg-stone-900 text-amber-300 shadow-xs border border-stone-900'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
                  }`}
                >
                  <span>{seriesName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow (Visible on tablet/desktop) */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className="hidden sm:flex p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer min-w-[32px] min-h-[32px] items-center justify-center"
            aria-label="Gulir ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
