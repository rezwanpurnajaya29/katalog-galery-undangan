import React, { useState, useMemo } from 'react';
import type { UndanganItem } from '../types/catalog.ts';
import { extractGoogleDriveFileId, getGoogleDriveImageUrls } from '../utils/filterAndSort.ts';

interface GeneratedCardCoverProps {
  item: UndanganItem;
  aspectClass?: string;
  className?: string;
}

// Color palettes for generated card cover based on Warna Dominan
const COLOR_THEMES: Record<string, { bgGradient: string; textClass: string; sealBg: string; borderClass: string; accentColor: string }> = {
  'putih': {
    bgGradient: 'from-stone-50 via-white to-amber-50/40',
    textClass: 'text-stone-800',
    sealBg: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-stone-900',
    borderClass: 'border-stone-200/90',
    accentColor: '#d4af37',
  },
  'hijau': {
    bgGradient: 'from-emerald-950 via-emerald-900 to-stone-900',
    textClass: 'text-emerald-100',
    sealBg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-stone-900',
    borderClass: 'border-emerald-700/60',
    accentColor: '#6ee7b7',
  },
  'biru': {
    bgGradient: 'from-sky-950 via-blue-900 to-slate-900',
    textClass: 'text-sky-100',
    sealBg: 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-stone-900',
    borderClass: 'border-blue-700/60',
    accentColor: '#93c5fd',
  },
  'krem': {
    bgGradient: 'from-[#fbf8f2] via-[#f5ede0] to-[#eae0cf]',
    textClass: 'text-stone-800',
    sealBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-white',
    borderClass: 'border-amber-200/80',
    accentColor: '#b8860b',
  },
  'hitam': {
    bgGradient: 'from-stone-950 via-neutral-900 to-stone-900',
    textClass: 'text-stone-100',
    sealBg: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 text-stone-950',
    borderClass: 'border-amber-500/40',
    accentColor: '#f59e0b',
  },
  'cokelat': {
    bgGradient: 'from-[#3e2723] via-[#4e342e] to-[#271510]',
    textClass: 'text-amber-100',
    sealBg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-stone-950',
    borderClass: 'border-amber-600/50',
    accentColor: '#fcd34d',
  },
  'pink': {
    bgGradient: 'from-rose-50 via-pink-100/70 to-rose-100/50',
    textClass: 'text-rose-950',
    sealBg: 'bg-gradient-to-br from-rose-300 via-amber-300 to-amber-500 text-rose-950',
    borderClass: 'border-rose-200',
    accentColor: '#fb7185',
  },
  'abu-abu': {
    bgGradient: 'from-slate-100 via-stone-200 to-slate-300',
    textClass: 'text-slate-800',
    sealBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-white',
    borderClass: 'border-slate-300',
    accentColor: '#64748b',
  },
  'kuning / emas': {
    bgGradient: 'from-[#fffcf0] via-[#fbf3d5] to-[#f4e4a6]',
    textClass: 'text-amber-950',
    sealBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-white',
    borderClass: 'border-amber-300',
    accentColor: '#d97706',
  },
  'ungu': {
    bgGradient: 'from-purple-950 via-violet-900 to-stone-950',
    textClass: 'text-purple-100',
    sealBg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-stone-950',
    borderClass: 'border-purple-600/50',
    accentColor: '#c084fc',
  },
  'merah': {
    bgGradient: 'from-red-950 via-rose-900 to-stone-950',
    textClass: 'text-rose-100',
    sealBg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-stone-950',
    borderClass: 'border-red-600/50',
    accentColor: '#fca5a5',
  },
};

export const GeneratedCardCover: React.FC<GeneratedCardCoverProps> = ({
  item,
  aspectClass = 'aspect-[3/4]',
  className = '',
}) => {
  // Collect candidate image URLs
  const candidateUrls = useMemo(() => {
    const urls: string[] = [];
    const source = item.thumbnailUrl || item.driveUrl || item.gambar || '';
    const fileId = extractGoogleDriveFileId(source);

    if (fileId) {
      urls.push(...getGoogleDriveImageUrls(fileId));
    } else if (source.startsWith('http://') || source.startsWith('https://')) {
      urls.push(source);
    }
    return urls;
  }, [item.thumbnailUrl, item.driveUrl, item.gambar]);

  const [urlIndex, setUrlIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageError = () => {
    if (urlIndex < candidateUrls.length - 1) {
      setUrlIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  const currentSrc = !allFailed && candidateUrls.length > 0 ? candidateUrls[urlIndex] : null;

  // Color theme for fallback generated cover
  const colorKey = (item.warnaDominan || '').toLowerCase().trim();
  const theme = COLOR_THEMES[colorKey] || COLOR_THEMES['krem'];
  const initial = item.series ? item.series.charAt(0).toUpperCase() : 'U';

  return (
    <div
      className={`relative overflow-hidden w-full ${aspectClass} select-none transition-transform duration-300 bg-stone-100 ${className}`}
    >
      {currentSrc ? (
        <div className="relative w-full h-full">
          <img
            src={currentSrc}
            alt={`Blangko Undangan ${item.series} No ${item.nomorKode}`}
            className={`w-full h-full object-cover object-center transition-all duration-500 hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center text-xs text-stone-400">
              <span>Memuat gambar...</span>
            </div>
          )}
        </div>
      ) : (
        /* Generated Cover Visual matching Stitch Warm Elegance Atelier design */
        <div
          className={`w-full h-full bg-gradient-to-b ${theme.bgGradient} flex flex-col items-center justify-between p-4 border ${theme.borderClass} shadow-inner transition-all duration-300 hover:shadow-md`}
        >
          {/* Top Decorative Filigree border */}
          <div className="w-full flex items-center justify-between opacity-70">
            <div className="w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm" />
            <span className="text-[10px] tracking-[0.25em] uppercase font-serif opacity-80 font-semibold px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5">
              UD REZ WAN JAYA
            </span>
            <div className="w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm" />
          </div>

          {/* Center Monogram Seal & Series Name */}
          <div className="flex flex-col items-center my-auto text-center px-2">
            {/* Elegant Monogram Seal with Golden Ring */}
            <div className="relative mb-3 group-hover:scale-110 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-lg flex items-center justify-center">
                <div className={`w-full h-full rounded-full ${theme.sealBg} flex items-center justify-center border border-white/40 shadow-inner`}>
                  <span className="font-serif font-bold text-xl tracking-tight leading-none drop-shadow-sm">
                    {initial}
                  </span>
                </div>
              </div>
              <div className="absolute -inset-1 rounded-full border border-amber-400/30 pointer-events-none" />
            </div>

            {/* Series Title */}
            <h4 className={`font-serif text-lg md:text-xl font-bold tracking-wide uppercase ${theme.textClass} drop-shadow-xs`}>
              {item.series}
            </h4>

            {/* Kode Badge */}
            <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">No.</span>
              <span className="text-xs font-bold tracking-wider font-mono">{item.nomorKode}</span>
            </div>

            {/* Sub details: Lipatan & Orientasi */}
            <p className="mt-2 text-[11px] opacity-75 font-medium tracking-tight">
              {item.lipatan} • {item.orientasi}
            </p>
          </div>

          {/* Bottom Decorative Filigree border */}
          <div className="w-full flex items-center justify-between opacity-70">
            <div className="w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              <span className="text-[9px] tracking-widest uppercase opacity-75">Galeri Undangan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
            </div>
            <div className="w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm" />
          </div>
        </div>
      )}
    </div>
  );
};
