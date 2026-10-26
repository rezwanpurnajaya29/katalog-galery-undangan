import React, { useState } from 'react';
import { X, Database, CheckCircle2, RefreshCw, ExternalLink, Save, Image as ImageIcon, HelpCircle, Copy, Check } from 'lucide-react';
import { APPS_SCRIPT_URL, SPREADSHEET_ID, SHEET_NAME, SHEET_GID } from '../services/catalogService.ts';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScriptUrl: string;
  onSaveScriptUrl: (newUrl: string) => void;
  onTestSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt?: Date;
  syncSource?: string;
  totalRecords: number;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  currentScriptUrl,
  onSaveScriptUrl,
  onTestSync,
  isSyncing,
  lastSyncedAt,
  syncSource = 'apps_script',
  totalRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'drive_guide'>('drive_guide');
  const [inputUrl, setInputUrl] = useState(currentScriptUrl);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    onSaveScriptUrl(inputUrl);
    setStatusMessage('URL berhasil disimpan!');
    await onTestSync();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleResetDefault = () => {
    setInputUrl(APPS_SCRIPT_URL);
  };

  const sheetWebUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${SHEET_GID}`;

  const copyScriptCode = () => {
    const code = `// Pasang script ini di Google Spreadsheet Anda (Extensions > Apps Script):
function sinkronkanGambarDariFolderDrive() {
  var FOLDER_ID = "MASUKKAN_ID_FOLDER_GOOGLE_DRIVE_ANDA_DISINI";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("KATALOG");
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  var fileMap = {};

  while (files.hasNext()) {
    var file = files.next();
    fileMap[file.getName().toLowerCase().trim()] = file.getUrl();
  }

  var data = sheet.getDataRange().getValues();
  // Asumsi Kolom J adalah kolom ke-10 (indeks 9)
  for (var i = 1; i < data.length; i++) {
    var namaFile = String(data[i][9] || "").trim().toLowerCase();
    if (fileMap[namaFile]) {
      sheet.getRange(i + 1, 10).setValue(fileMap[namaFile]);
    }
  }
}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Mobile Drag Indicator Handle */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center bg-[#faf8f5]">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#faf8f5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 truncate">
                Integrasi Spreadsheet & Gambar Drive
              </h3>
              <p className="text-[11px] text-stone-500 truncate">
                Koneksi data real-time UD REZ WAN JAYA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer touch-manipulation"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 gap-3 sm:gap-4 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('drive_guide')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'drive_guide'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Panduan Gambar Google Drive (Kolom J)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Koneksi & URL Apps Script</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
          {activeTab === 'drive_guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  Cara Menampilkan Gambar Produk dari Google Drive ke Kolom J:
                </h4>
                <p className="mt-1 text-xs text-stone-700 leading-relaxed">
                  Web katalog ini sudah dilengkapi konverter otomatis yang mengubah link sharing Google Drive menjadi gambar beresolusi tinggi. Ikuti 3 langkah mudah berikut:
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Atur Izin File Gambar di Google Drive ke "Public / Siapa saja"
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      Buka Google Drive &gt; Klik kanan pada foto undangan (atau pada folder gambar Anda) &gt; pilih <strong>Bagikan (Share)</strong>. Di menu Akses umum, ubah dari <em>"Dibatasi (Restricted)"</em> menjadi <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong> dengan peran <strong>Pelihat (Viewer)</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Salin Link Google Drive & Tempelkan ke Kolom J (Lihat gambar)
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      Klik <strong>Salin Link (Copy Link)</strong> di Google Drive, lalu paste langsung ke sel pada Kolom J di sheet <strong>KATALOG</strong> (menggantikan nama file seperti <code>Baby-08.jpg</code>).
                    </p>
                    <div className="mt-2 p-2 rounded bg-stone-100 font-mono text-[10px] text-stone-800 break-all border border-stone-200">
                      Contoh: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Klik Tombol "Segarkan Data" di Web
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      Setelah link dimasukkan ke spreadsheet, tekan tombol <strong>"Segarkan Data"</strong> di pojok kanan atas web ini. Foto undangan akan langsung tampil secara otomatis!
                    </p>
                  </div>
                </div>
              </div>

              {/* Automatic Drive Folder Script Helper */}
              <div className="mt-4 p-3.5 rounded-xl bg-stone-100 border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-700" />
                    Punya 1 Folder Berisi Semua Foto Undangan? (Otomatisasi)
                  </h5>
                  <button
                    type="button"
                    onClick={copyScriptCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-stone-50 border border-stone-300 font-semibold text-[11px] text-stone-700 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Script'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Jika semua foto Anda (Baby-08.jpg, dll.) berada di satu folder Google Drive, Anda bisa menempelkan script ini ke menu <em>Extensions &gt; Apps Script</em> di Google Spreadsheet agar link foto terisi otomatis tanpa perlu copas satu per satu.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    Sinkronisasi Otomatis Aktif
                  </h4>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    Setiap perubahan baris pada sheet <strong>{SHEET_NAME}</strong> akan otomatis diperbarui pada katalog web ini tanpa perlu deploy ulang.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-emerald-950 font-medium">
                    <span>Sumber: <strong className="uppercase">{syncSource}</strong></span>
                    <span>•</span>
                    <span>Total Model: <strong>{totalRecords} item</strong></span>
                    <span>•</span>
                    <span>Terakhir Sinkron: <strong>{lastSyncedAt ? lastSyncedAt.toLocaleTimeString('id-ID') : 'Baru saja'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Spreadsheet Identity Details */}
              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Spreadsheet ID:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-stone-200 font-mono text-[11px] text-stone-800">
                    {SPREADSHEET_ID}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Nama Sheet / GID:</span>
                  <span className="font-bold text-stone-800 font-mono">{SHEET_NAME} (GID: {SHEET_GID})</span>
                </div>
                <div className="pt-1 flex justify-end">
                  <a
                    href={sheetWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold hover:underline"
                  >
                    <span>Buka Google Spreadsheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Apps Script Endpoint URL Configuration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1">
                  URL Google Apps Script Web App
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSyncing}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan</span>
                  </button>
                </div>
                {statusMessage && (
                  <p className="mt-1 text-emerald-600 font-semibold text-[11px]">
                    {statusMessage}
                  </p>
                )}
                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="text-[11px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                  >
                    Kembalikan ke URL Default
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 pb-safe">
          <button
            type="button"
            onClick={onTestSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer min-h-[44px] touch-manipulation text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Uji &amp; Sinkron Ulang</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors cursor-pointer min-h-[44px] touch-manipulation text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
