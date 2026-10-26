import React, { useState } from 'react';
import { X, MessageCircle, Heart, Share2, Check, Sparkles, ShieldCheck } from 'lucide-react';
import type { UndanganItem, PriceSegment } from '../types/catalog.ts';
import { GeneratedCardCover } from './GeneratedCardCover.tsx';
import { generateWhatsAppLink, getColorHex } from '../utils/filterAndSort.ts';

interface ProductDetailModalProps {
  item: UndanganItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const SEGMENT_CONFIG: Record<PriceSegment, { title: string; badge: string; description: string }> = {
  'Super Hemat': {
    title: 'Super Hemat',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Pilihan paling bersahabat dan terjangkau, cocok untuk kebutuhan cetak dalam jumlah besar tanpa mengurangi estetika momen bahagia Anda.',
  },
  'Ekonomis': {
    title: 'Ekonomis',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
    description: 'Keseimbangan ideal antara kualitas bahan blangko dan efisiensi biaya, menjadi favorit banyak calon pengantin.',
  },
  'Menengah': {
    title: 'Menengah',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'Tampilan elegan dengan aksen ornamen berkelas dan bahan premium untuk sentuhan undangan yang anggun dan berkesan.',
  },
  'Premium': {
    title: 'Premium',
    badge: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
    description: 'Kategori mahakarya termewah dengan finishing eksklusif, kelengkapan amplop spesial, dan material blangko standar atelier tertinggi.',
  },
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const segInfo = SEGMENT_CONFIG[item.segmenHarga] || SEGMENT_CONFIG['Ekonomis'];
  const waLink = generateWhatsAppLink(item);

  const handleShare = () => {
    const text = `Katalog Blangko Undangan UD REZ WAN JAYA - Seri ${item.series} No ${item.nomorKode}`;
    if (navigator.share) {
      navigator.share({
        title: text,
        text: `${text} (Kategori Segmen: ${item.segmenHarga})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} - ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/65 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Bottom-Sheet on Mobile, Centered Dialog on Desktop) */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] z-10 transition-transform">
        {/* Mobile Drag Indicator Handle */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center bg-[#faf8f5]">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#faf8f5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-amber-800 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              UD REZ WAN JAYA
            </span>
            <span className="text-xs text-stone-500 font-medium">Spesifikasi Model</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors touch-manipulation cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'
              }`}
              title="Favoritkan model ini"
              aria-label="Favoritkan model ini"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="min-w-[40px] min-h-[40px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full flex items-center justify-center transition-colors touch-manipulation cursor-pointer"
              title="Bagikan model ini"
              aria-label="Bagikan model ini"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full flex items-center justify-center transition-colors touch-manipulation cursor-pointer"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
            {/* Visual Cover Preview */}
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-md bg-stone-50 max-w-sm mx-auto md:max-w-none w-full">
              <GeneratedCardCover item={item} aspectClass="aspect-[3/4]" />
            </div>

            {/* Product Metadata & Specifications */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 font-serif">
                    Seri Blangko Undangan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-stone-800">
                    No. {item.nomorKode}
                  </span>
                </div>

                <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {item.series} - {item.nomorKode}
                </h2>
              </div>

              {/* Price Segment Highlight Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Kategori Segmen
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${segInfo.badge}`}
                  >
                    {item.segmenHarga}
                  </span>
                </div>
                <p className="mt-2 text-xs text-amber-950/80 leading-relaxed">
                  {segInfo.description}
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="p-2.5 sm:p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-600 block uppercase font-bold tracking-wider">
                    Warna Dominan
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: getColorHex(item.warnaDominan) }}
                    />
                    <strong className="text-stone-900 font-medium truncate">
                      {item.warnaDominan}
                    </strong>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-600 block uppercase font-bold tracking-wider">
                    Warna Sekunder
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: getColorHex(item.warnaSekunder || item.warnaDominan) }}
                    />
                    <strong className="text-stone-900 font-medium truncate">
                      {item.warnaSekunder || '-'}
                    </strong>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-600 block uppercase font-bold tracking-wider">
                    Model Lipatan
                  </span>
                  <strong className="mt-1 block text-stone-900 font-medium truncate">
                    {item.lipatan}
                  </strong>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-600 block uppercase font-bold tracking-wider">
                    Orientasi
                  </span>
                  <strong className="mt-1 block text-stone-900 font-medium truncate">
                    {item.orientasi}
                  </strong>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-stone-50 border border-stone-200 col-span-2">
                  <span className="text-[10px] text-stone-600 block uppercase font-bold tracking-wider">
                    Kelengkapan Amplop
                  </span>
                  <strong className="mt-1 block text-stone-900 font-medium truncate">
                    {item.amplop}
                  </strong>
                </div>
              </div>

              {/* Quality Guarantee Strip */}
              <div className="flex items-center gap-2 text-stone-500 text-[11px] pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Blangko resmi cetak UD REZ WAN JAYA berkualitas tinggi.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Actions (>=46px touch targets, pb-safe) */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pb-safe">
          <p className="text-xs text-stone-500 text-center sm:text-left">
            Ingin tanya stok blangko model ini?
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer min-h-[46px] sm:min-h-[40px] flex items-center justify-center touch-manipulation"
            >
              Tutup
            </button>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-2 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs min-h-[46px] sm:min-h-[40px] touch-manipulation"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Tanya via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
