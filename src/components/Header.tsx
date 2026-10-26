import React from 'react';
import { RefreshCw, Sparkles, Heart } from 'lucide-react';
import type { PriceSegment, CatalogStats } from '../types/catalog.ts';

interface HeaderProps {
  stats: CatalogStats;
  selectedSegments: PriceSegment[];
  onSelectSegment: (segment: PriceSegment | 'ALL') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastSyncedAt?: Date;
  onOpenSettings?: () => void;
  favoriteCount: number;
  onToggleFavoritesOnly: () => void;
  showFavoritesOnly: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  selectedSegments,
  onSelectSegment,
  onRefresh,
  isRefreshing,
  lastSyncedAt,
  favoriteCount,
  onToggleFavoritesOnly,
  showFavoritesOnly,
}) => {
  const isAllActive = selectedSegments.length === 0;

  const segmentConfig: Array<{
    name: PriceSegment;
    count: number;
    activeStyle: string;
    inactiveStyle: string;
    dotColor: string;
  }> = [
    {
      name: 'Super Hemat',
      count: stats.countsBySegment['Super Hemat'] || 0,
      activeStyle: 'bg-emerald-700 text-white border-emerald-700 shadow-sm',
      inactiveStyle: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100',
      dotColor: 'bg-emerald-500',
    },
    {
      name: 'Ekonomis',
      count: stats.countsBySegment['Ekonomis'] || 0,
      activeStyle: 'bg-sky-700 text-white border-sky-700 shadow-sm',
      inactiveStyle: 'bg-sky-50/90 text-sky-800 border-sky-200/90 hover:bg-sky-100',
      dotColor: 'bg-sky-500',
    },
    {
      name: 'Menengah',
      count: stats.countsBySegment['Menengah'] || 0,
      activeStyle: 'bg-indigo-700 text-white border-indigo-700 shadow-sm',
      inactiveStyle: 'bg-indigo-50/80 text-indigo-800 border-indigo-200/90 hover:bg-indigo-100',
      dotColor: 'bg-indigo-500',
    },
    {
      name: 'Premium',
      count: stats.countsBySegment['Premium'] || 0,
      activeStyle: 'bg-amber-600 text-white border-amber-600 shadow-sm',
      inactiveStyle: 'bg-amber-50/90 text-amber-900 border-amber-300/80 hover:bg-amber-100',
      dotColor: 'bg-amber-500',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        {/* Top Header Row: Mobile-First Brand & Quick Action Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-600 shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-amber-300 font-serif font-black text-xs sm:text-sm tracking-tighter">
                RWJ
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-tight text-stone-900 truncate leading-tight">
                  UD REZ WAN JAYA
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/70 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  <span>Katalog Galeri</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate hidden sm:block">
                Katalog Blangko Undangan Pernikahan Eksklusif & Lengkap
              </p>
            </div>
          </div>

          {/* Top Right Quick Action Bar with >=40px touch targets */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Favorites Toggle Button */}
            <button
              type="button"
              onClick={onToggleFavoritesOnly}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[38px] sm:min-h-[36px] cursor-pointer touch-manipulation ${
                showFavoritesOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
              title="Tampilkan Model Favorit"
              aria-label="Tampilkan Model Favorit"
            >
              <Heart className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${showFavoritesOnly ? 'fill-current' : 'text-rose-500'}`} />
              <span className="hidden md:inline">Favorit</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showFavoritesOnly ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {favoriteCount}
              </span>
            </button>

            {/* Refresh Data Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 disabled:opacity-60 transition-all shadow-2xs min-h-[38px] sm:min-h-[36px] cursor-pointer touch-manipulation"
              title={lastSyncedAt ? `Terakhir diperbarui: ${lastSyncedAt.toLocaleTimeString('id-ID')}` : 'Perbarui data'}
              aria-label="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* Dynamic Price Segment Summary Pills Bar - Wrap on mobile, zero horizontal scrollbar */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-stone-200/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap py-0.5 w-full">
            <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Kategori:
            </span>

            {/* "Semua" pill */}
            <button
              type="button"
              onClick={() => onSelectSegment('ALL')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 min-h-[36px] touch-manipulation ${
                isAllActive
                  ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>Semua</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isAllActive ? 'bg-amber-400/20 text-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {stats.total}
              </span>
            </button>

            {/* Segmen Harga pills with live counts */}
            {segmentConfig.map((seg) => {
              const isActive = selectedSegments.includes(seg.name);
              return (
                <button
                  key={seg.name}
                  type="button"
                  onClick={() => onSelectSegment(seg.name)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] touch-manipulation ${
                    isActive ? seg.activeStyle : seg.inactiveStyle
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : seg.dotColor}`} />
                  <span>{seg.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-stone-700 border border-stone-200/60'
                    }`}
                  >
                    {seg.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick sync status indicator (visible on large screen) */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-stone-500 shrink-0 pl-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Sync</span>
          </div>
        </div>
      </div>
    </header>
  );
};
