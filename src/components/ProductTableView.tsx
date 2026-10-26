import React from 'react';
import { Eye, MessageCircle, Heart } from 'lucide-react';
import type { UndanganItem, PriceSegment } from '../types/catalog.ts';
import { GeneratedCardCover } from './GeneratedCardCover.tsx';
import { generateWhatsAppLink, getColorHex } from '../utils/filterAndSort.ts';

interface ProductTableViewProps {
  items: UndanganItem[];
  onOpenDetail: (item: UndanganItem) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const SEGMENT_BADGES: Record<PriceSegment, { label: string; badgeClass: string }> = {
  'Super Hemat': { label: 'Super Hemat', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  'Ekonomis': { label: 'Ekonomis', badgeClass: 'bg-sky-50 text-sky-800 border-sky-300' },
  'Menengah': { label: 'Menengah', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  'Premium': { label: 'Premium', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-bold' },
};

export const ProductTableView: React.FC<ProductTableViewProps> = ({
  items,
  onOpenDetail,
  favorites,
  onToggleFavorite,
}) => {
  return (
    <div className="w-full">
      {/* MOBILE LIST CARD VIEW (Visible on mobile screens < 768px) */}
      <div className="block md:hidden space-y-2.5">
        {items.map((item, idx) => {
          const seg = SEGMENT_BADGES[item.segmenHarga] || SEGMENT_BADGES['Ekonomis'];
          const isFav = favorites.includes(item.id);
          const waLink = generateWhatsAppLink(item);

          return (
            <article
              key={item.id}
              className="bg-white rounded-xl border border-stone-200/90 p-3 shadow-2xs hover:border-amber-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail Preview */}
                <div
                  className="w-20 h-24 rounded-lg overflow-hidden border border-stone-200 shrink-0 cursor-pointer relative"
                  onClick={() => onOpenDetail(item)}
                >
                  <GeneratedCardCover item={item} aspectClass="aspect-[4/5]" />
                  <span className="absolute bottom-1 left-1 px-1 py-0.2 bg-stone-900/70 text-white rounded text-[9px] font-mono">
                    #{idx + 1}
                  </span>
                </div>

                {/* Info Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <h4
                        className="font-serif font-bold text-sm text-stone-900 truncate cursor-pointer hover:text-amber-800"
                        onClick={() => onOpenDetail(item)}
                      >
                        {item.series}
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-stone-700">
                        Kode: #{item.nomorKode}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${seg.badgeClass} shrink-0`}
                    >
                      {item.segmenHarga}
                    </span>
                  </div>

                  {/* Specifications & Overlapping Colors */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-stone-600">
                    <span className="px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200">
                      {item.lipatan}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200">
                      {item.orientasi}
                    </span>
                    <div
                      className="inline-flex items-center -space-x-1 pl-1"
                      title={`Warna: ${item.warnaDominan}${item.warnaSekunder ? `, ${item.warnaSekunder}` : ''}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-300 relative z-10"
                        style={{ backgroundColor: getColorHex(item.warnaDominan) }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-300 relative z-20"
                        style={{ backgroundColor: getColorHex(item.warnaSekunder || item.warnaDominan) }}
                      />
                    </div>
                  </div>

                  {/* Mobile Touch Action Buttons (>=44px touch height) */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      className={`min-w-[44px] min-h-[44px] rounded-lg border flex items-center justify-center transition-colors touch-manipulation cursor-pointer ${
                        isFav
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'text-stone-400 hover:text-rose-600 bg-stone-50 border-stone-200'
                      }`}
                      aria-label="Favoritkan"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetail(item)}
                      className="flex-1 min-h-[44px] py-2 px-3 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors touch-manipulation cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-500" />
                      <span>Detail</span>
                    </button>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[44px] py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs touch-manipulation"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Tanya WA</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (Visible on screens >= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#faf8f5] text-stone-600 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 w-16">SAMPEL</th>
                <th className="py-3 px-3">Seri</th>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-3">Warna</th>
                <th className="py-3 px-3">Lipatan</th>
                <th className="py-3 px-3">Orientasi</th>
                <th className="py-3 px-3">Amplop</th>
                <th className="py-3 px-3">Kategori Segmen</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {items.map((item, idx) => {
                const seg = SEGMENT_BADGES[item.segmenHarga] || SEGMENT_BADGES['Ekonomis'];
                const isFav = favorites.includes(item.id);
                const waLink = generateWhatsAppLink(item);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                    onClick={() => onOpenDetail(item)}
                  >
                    {/* Row Index */}
                    <td className="py-2.5 px-3 text-center text-stone-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* SAMPEL Thumbnail */}
                    <td className="py-2.5 px-3">
                      <div className="w-12 h-14 rounded overflow-hidden border border-stone-200 shadow-2xs group-hover:scale-105 transition-transform bg-stone-100">
                        <GeneratedCardCover item={item} aspectClass="aspect-[4/5]" />
                      </div>
                    </td>

                    {/* Seri */}
                    <td className="py-2.5 px-3 font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                      {item.series}
                    </td>

                    {/* Kode */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px] border border-stone-200">
                        #{item.nomorKode}
                      </span>
                    </td>

                    {/* Warna with Swatches */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300 relative z-10"
                            style={{ backgroundColor: getColorHex(item.warnaDominan) }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300 relative z-20"
                            style={{ backgroundColor: getColorHex(item.warnaSekunder || item.warnaDominan) }}
                          />
                        </div>
                        <span className="font-medium">{item.warnaDominan}</span>
                        {item.warnaSekunder && (
                          <span className="text-stone-400 text-[10px]">({item.warnaSekunder})</span>
                        )}
                      </div>
                    </td>

                    {/* Lipatan */}
                    <td className="py-2.5 px-3 text-stone-600">
                      {item.lipatan}
                    </td>

                    {/* Orientasi */}
                    <td className="py-2.5 px-3 text-stone-600">
                      {item.orientasi}
                    </td>

                    {/* Amplop */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.amplop.toLowerCase().includes('dengan')
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {item.amplop}
                      </span>
                    </td>

                    {/* Segmen Harga */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${seg.badgeClass}`}
                      >
                        {seg.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer touch-manipulation ${
                            isFav
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'text-stone-400 hover:text-rose-600 hover:bg-stone-50 border-transparent hover:border-stone-200'
                          }`}
                          title="Favorit"
                          aria-label="Favorit"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDetail(item)}
                          className="p-2 rounded-lg text-stone-600 hover:text-amber-800 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer touch-manipulation"
                          title="Lihat Detail Model"
                          aria-label="Detail Model"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-2xs touch-manipulation"
                          title="Tanya ketersediaan via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WA</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
