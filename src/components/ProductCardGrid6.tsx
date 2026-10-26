import React from 'react';
import { Eye, Heart } from 'lucide-react';
import type { UndanganItem, PriceSegment } from '../types/catalog.ts';
import { GeneratedCardCover } from './GeneratedCardCover.tsx';
import { getColorHex } from '../utils/filterAndSort.ts';

interface ProductCardGrid6Props {
  item: UndanganItem;
  onOpenDetail: (item: UndanganItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const SEGMENT_COLORS: Record<PriceSegment, { text: string; bg: string; border: string }> = {
  'Super Hemat': { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Ekonomis': { text: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-200' },
  'Menengah': { text: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Premium': { text: 'text-amber-900', bg: 'bg-amber-50', border: 'border-amber-300' },
};

/**
 * Format orientasi layout secara lengkap (Potrait / Landscape / Square)
 */
function getOrientasiLabel(orientasi?: string): string {
  if (!orientasi) return 'Potrait';
  const o = orientasi.toLowerCase().trim();
  if (o.includes('square') || o.includes('persegi')) return 'Square';
  if (o.includes('land')) return 'Landscape';
  if (o.includes('potr') || o.includes('port')) return 'Potrait';
  return orientasi;
}

export const ProductCardGrid6: React.FC<ProductCardGrid6Props> = ({
  item,
  onOpenDetail,
  isFavorite,
  onToggleFavorite,
}) => {
  const seg = SEGMENT_COLORS[item.segmenHarga] || SEGMENT_COLORS['Ekonomis'];

  return (
    <article
      onClick={() => onOpenDetail(item)}
      className="group bg-white rounded-xl border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer w-full touch-manipulation"
    >
      {/* Media Box (Aspect 4:5) */}
      <div className="relative overflow-hidden">
        <GeneratedCardCover item={item} aspectClass="aspect-[4/5]" />

        {/* Favorite heart on top right (touch target min-w-[36px] min-h-[36px]) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`absolute top-1 right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-xs min-w-[34px] min-h-[34px] touch-manipulation cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 text-stone-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Favoritkan"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Action Overlay on Desktop */}
        <div className="hidden sm:flex absolute inset-0 bg-stone-900/25 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
          <span className="p-1.5 rounded-full bg-white text-stone-900 shadow-md">
            <Eye className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Info Strip */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between gap-1.5">
        <div>
          {/* Series & Kode */}
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate group-hover:text-amber-700">
              {item.series}
            </h4>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-stone-100 rounded text-stone-700 shrink-0">
              #{item.nomorKode}
            </span>
          </div>

          {/* Irisan Warna di Kiri • Jenis Lipatan di Kanan */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-600">
            {/* Lingkaran kecil warna dominan & sekunder yang beririsan */}
            <div
              className="flex items-center -space-x-1 shrink-0"
              title={`Warna Dominan: ${item.warnaDominan}${item.warnaSekunder ? `, Sekunder: ${item.warnaSekunder}` : ''}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-stone-300/90 shadow-2xs relative z-10"
                style={{ backgroundColor: getColorHex(item.warnaDominan) }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full border border-stone-300/90 shadow-2xs relative z-20"
                style={{ backgroundColor: getColorHex(item.warnaSekunder || item.warnaDominan) }}
              />
            </div>
            <span className="text-stone-300">•</span>
            <span className="truncate font-medium">{item.lipatan}</span>
          </div>
        </div>

        {/* Segmen Harga Tag & Orientasi Lengkap (Potrait / Landscape / Square) */}
        <div className="mt-1.5 pt-1.5 border-t border-stone-100 flex items-center justify-between gap-1">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${seg.bg} ${seg.text} ${seg.border} truncate`}
          >
            {item.segmenHarga}
          </span>
          <span
            className="text-[9px] font-medium text-stone-500 whitespace-nowrap"
            title={`Orientasi: ${getOrientasiLabel(item.orientasi)}`}
          >
            {getOrientasiLabel(item.orientasi)}
          </span>
        </div>
      </div>
    </article>
  );
};
