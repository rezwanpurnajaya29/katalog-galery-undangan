import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Heart,
  Check,
  Search,
  LayoutGrid,
  ArrowUp,
  Layers,
} from 'lucide-react';
import type { UndanganItem, FilterState, ViewMode, PriceSegment } from './types/catalog.ts';
import { ALL_SERIES_KEY, filterItems, sortItems, calculateStats } from './utils/filterAndSort.ts';
import { fetchLiveCatalog, APPS_SCRIPT_URL } from './services/catalogService.ts';
import { Header } from './components/Header.tsx';
import { SeriesFilterBar } from './components/SeriesFilterBar.tsx';
import { SearchAndToolbar } from './components/SearchAndToolbar.tsx';
import { AdvancedFilterDrawer } from './components/AdvancedFilterDrawer.tsx';
import { ProductCardGrid4 } from './components/ProductCardGrid4.tsx';
import { ProductCardGrid6 } from './components/ProductCardGrid6.tsx';
import { ProductTableView } from './components/ProductTableView.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { DataSourceModal } from './components/DataSourceModal.tsx';
import { Pagination } from './components/Pagination.tsx';

const FAVORITES_STORAGE_KEY = 'ud_rwj_favorites_v1';
const SCRIPT_URL_STORAGE_KEY = 'ud_rwj_apps_script_url_v1';

export default function App() {
  // Catalog Data States
  const [catalogItems, setCatalogItems] = useState<UndanganItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [syncSource, setSyncSource] = useState<string>('seed');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View & UI States
  const [viewMode, setViewMode] = useState<ViewMode>('grid4');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<UndanganItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Script URL Configuration
  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(SCRIPT_URL_STORAGE_KEY) || APPS_SCRIPT_URL;
    } catch {
      return APPS_SCRIPT_URL;
    }
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Filter & Sort State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedSeries: ALL_SERIES_KEY,
    selectedSegments: [],
    selectedColors: [],
    selectedLipatan: [],
    selectedOrientasi: [],
    selectedAmplop: [],
    sortBy: 'series_asc',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);

  // Scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota
      }
      return next;
    });
  }, []);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initial Data Fetch
  const loadData = useCallback(async (customUrl?: string, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetchLiveCatalog(customUrl);
      setCatalogItems(result.items);
      setLastSyncedAt(result.lastSyncedAt);
      setSyncSource(result.source);

      if (isManualRefresh) {
        showToast(`Sinkronisasi berhasil! ${result.items.length} model blangko diperbarui.`);
      }
    } catch (err) {
      console.error('Failed to load catalog data:', err);
      showToast('Gagal memuat data terbaru, menggunakan data katalog lokal.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData(scriptUrl);
  }, [loadData, scriptUrl]);

  // Handle URL change
  const handleSaveScriptUrl = (newUrl: string) => {
    setScriptUrl(newUrl);
    try {
      localStorage.setItem(SCRIPT_URL_STORAGE_KEY, newUrl);
    } catch {
      // Ignore
    }
    loadData(newUrl, true);
    setIsSettingsOpen(false);
  };

  // Base items consideration for favorites filter
  const baseItems = useMemo(() => {
    if (showFavoritesOnly) {
      return catalogItems.filter((it) => favorites.includes(it.id));
    }
    return catalogItems;
  }, [catalogItems, showFavoritesOnly, favorites]);

  // Dynamic Series List
  const dynamicSeriesList = useMemo(() => {
    const set = new Set<string>();
    catalogItems.forEach((it) => {
      if (it.series && it.series.trim()) {
        set.add(it.series.trim().toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [catalogItems]);

  // Filtered & Sorted items
  const sortedAndFilteredItems = useMemo(() => {
    const filtered = filterItems(baseItems, filters);
    return sortItems(filtered, filters.sortBy);
  }, [baseItems, filters]);

  // Dynamic Catalog Stats based on current baseItems
  const stats = useMemo(() => {
    return calculateStats(catalogItems, sortedAndFilteredItems);
  }, [catalogItems, sortedAndFilteredItems]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAndFilteredItems.slice(start, start + pageSize);
  }, [sortedAndFilteredItems, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, showFavoritesOnly]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedSeries && filters.selectedSeries !== ALL_SERIES_KEY) count++;
    count += filters.selectedSegments.length;
    count += filters.selectedColors.length;
    count += filters.selectedLipatan.length;
    count += filters.selectedOrientasi.length;
    count += filters.selectedAmplop.length;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  // Update filter partial
  const handleUpdateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedSeries: ALL_SERIES_KEY,
      selectedSegments: [],
      selectedColors: [],
      selectedLipatan: [],
      selectedOrientasi: [],
      selectedAmplop: [],
      sortBy: 'series_asc',
    });
    setShowFavoritesOnly(false);
  };

  // Segment click on Header
  const handleSelectHeaderSegment = (segment: PriceSegment | 'ALL') => {
    if (segment === 'ALL') {
      setFilters((prev) => ({ ...prev, selectedSegments: [] }));
    } else {
      setFilters((prev) => {
        const isCurrent = prev.selectedSegments.length === 1 && prev.selectedSegments[0] === segment;
        return {
          ...prev,
          selectedSegments: isCurrent ? [] : [segment],
        };
      });
    }
  };

  // Scroll to search or top
  const handleScrollToSearch = () => {
    window.scrollTo({ top: 100, behavior: 'smooth' });
    const input = document.querySelector<HTMLInputElement>("input[placeholder*='Cari seri']");
    if (input) {
      input.focus();
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-200 w-full overflow-x-hidden">
      {/* 1. Header with Brand & Dynamic Segment Carousel */}
      <Header
        stats={stats}
        selectedSegments={filters.selectedSegments}
        onSelectSegment={handleSelectHeaderSegment}
        onRefresh={() => loadData(scriptUrl, true)}
        isRefreshing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        onOpenSettings={() => setIsSettingsOpen(true)}
        favoriteCount={favorites.length}
        onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
        showFavoritesOnly={showFavoritesOnly}
      />

      {/* 2. Dynamic Series Filter Ribbon */}
      <SeriesFilterBar
        seriesList={dynamicSeriesList}
        countsBySeries={stats.countsBySeries}
        totalCount={stats.total}
        selectedSeries={filters.selectedSeries}
        onSelectSeries={(series) => handleUpdateFilters({ selectedSeries: series })}
      />

      {/* 3. Search and View Mode Toolbar */}
      <SearchAndToolbar
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        isDrawerOpen={isDrawerOpen}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        filteredCount={sortedAndFilteredItems.length}
        totalCount={catalogItems.length}
      />

      {/* 4. Main Product Catalog Section with safe mobile bottom spacing */}
      <main className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 w-full pb-24 sm:pb-16 md:pb-12">
        {isLoading ? (
          /* Loading Skeleton */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-4" />
            <p className="font-serif text-lg font-bold text-stone-800">
              Memuat Katalog Blangko Undangan...
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Menghubungkan ke Google Spreadsheet UD REZ WAN JAYA
            </p>
          </div>
        ) : sortedAndFilteredItems.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="py-12 sm:py-16 px-4 bg-white rounded-2xl border border-stone-200 text-center max-w-md mx-auto my-6 sm:my-8 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Tidak Ada Model yang Cocok
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Tidak ditemukan blangko undangan yang sesuai dengan kriteria pencarian atau filter yang dipilih.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px] touch-manipulation"
            >
              Reset Semua Filter & Pencarian
            </button>
          </div>
        ) : (
          /* Products View by Selected Mode */
          <div>
            {/* Mode 1: Grid 4-Kolom Standar (1 col mobile, 2 col tablet, 3-4 col desktop) */}
            {viewMode === 'grid4' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                {paginatedItems.map((item) => (
                  <ProductCardGrid4
                    key={item.id}
                    item={item}
                    onOpenDetail={setSelectedDetailItem}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {/* Mode 2: Grid 6-Kolom Ringkas (2 col mobile, 3-4 col tablet, 6 col desktop) */}
            {viewMode === 'grid6' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {paginatedItems.map((item) => (
                  <ProductCardGrid6
                    key={item.id}
                    item={item}
                    onOpenDetail={setSelectedDetailItem}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {/* Mode 3: Mode Tabel / List (Responsive cards on mobile, table on desktop) */}
            {viewMode === 'table' && (
              <ProductTableView
                items={paginatedItems}
                onOpenDetail={setSelectedDetailItem}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={sortedAndFilteredItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </main>

      {/* 5. Mobile Floating Action Dock at Bottom-Left (Icons only, no text) */}
      <nav
        aria-label="Navigasi Cepat"
        className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3.5 z-40 bg-white/95 backdrop-blur-md border border-stone-300/90 shadow-xl rounded-full p-1 flex items-center gap-1"
      >
        {/* Button 1: Katalog */}
        <button
          type="button"
          onClick={() => {
            handleResetFilters();
            handleScrollToTop();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-amber-800 hover:bg-amber-50 active:scale-95 transition-all touch-manipulation cursor-pointer"
          title="Katalog"
          aria-label="Katalog"
        >
          <LayoutGrid className="w-4 h-4 text-amber-700" />
        </button>

        {/* Button 2: Cari */}
        <button
          type="button"
          onClick={handleScrollToSearch}
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all touch-manipulation cursor-pointer"
          title="Cari"
          aria-label="Cari"
        >
          <Search className="w-4 h-4 text-stone-600" />
        </button>

        {/* Button 3: Filter */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all touch-manipulation cursor-pointer relative"
          title="Filter Lanjutan"
          aria-label="Filter Lanjutan"
        >
          <SlidersHorizontal className="w-4 h-4 text-stone-600" />
          {activeFilterCount > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-600 text-white text-[8px] font-bold flex items-center justify-center shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Button 4: Favorit */}
        <button
          type="button"
          onClick={() => {
            setShowFavoritesOnly((prev) => !prev);
            handleScrollToTop();
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all touch-manipulation cursor-pointer relative ${
            showFavoritesOnly
              ? 'bg-rose-50 text-rose-600'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
          title="Favorit"
          aria-label="Favorit"
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current text-rose-600' : 'text-rose-500'}`} />
          {favorites.length > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-bold min-w-[12px] text-center shadow-xs">
              {favorites.length}
            </span>
          )}
        </button>
      </nav>

      {/* Floating Scroll-to-Top Button (positioned at bottom-right) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3.5 z-40 w-10 h-10 rounded-full bg-stone-900/90 text-amber-300 shadow-xl border border-amber-500/30 flex items-center justify-center hover:bg-stone-900 active:scale-95 transition-all cursor-pointer touch-manipulation"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* 6. Collapsible Advanced Filter Drawer */}
      <AdvancedFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        stats={stats}
      />

      {/* 7. Product Detail Modal Dialog */}
      <ProductDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        isFavorite={selectedDetailItem ? favorites.includes(selectedDetailItem.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* 8. Data Source & Settings Modal */}
      <DataSourceModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentScriptUrl={scriptUrl}
        onSaveScriptUrl={handleSaveScriptUrl}
        onTestSync={() => loadData(scriptUrl, true)}
        isSyncing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        syncSource={syncSource}
        totalRecords={catalogItems.length}
      />

      {/* 9. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 right-4 md:right-5 z-50 bg-stone-900 text-amber-200 px-4 py-3 rounded-xl shadow-2xl border border-amber-500/40 text-xs flex items-center gap-2.5 max-w-sm">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-white">{toastMessage}</span>
        </div>
      )}

      {/* 10. Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 text-xs pt-8 pb-24 md:pb-8 border-t border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-xs border border-amber-500/30">
                RWJ
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-200 text-sm">
                  UD REZ WAN JAYA
                </h4>
                <p className="text-[11px] text-stone-500">
                  Pusat Grosir & Percetakan Blangko Undangan Pernikahan
                </p>
              </div>
            </div>

            <div className="text-center md:text-right text-[11px] text-stone-500">
              <p>
                © {new Date().getFullYear()} UD REZ WAN JAYA. Seluruh hak cipta dilindungi.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
