// =====================================================
// REKOMENDASI TANAM - PETANI (PROYEKSI MASA DEPAN)
// =====================================================
// Halaman ini membantu petani merencanakan TANAM BERIKUTNYA
// berdasarkan proyeksi kebutuhan gudang di masa depan,
// bukan menampilkan PO aktif (itu ada di Pesanan Gudang).
// =====================================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ArrowLeft, Sprout, TrendingUp, AlertTriangle, Search,
  BarChart3, List, Lightbulb, Calendar, Zap, Target,
  ChevronRight, Users, ShieldAlert, Clock, ArrowUpRight,
  Wheat, PackageCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { formatRupiah } from '../../utils/formatters';
import { getKomoditasImageMap } from '../../utils/cropHelpers';

type TabType = 'rekomendasi' | 'daftar-produk' | 'supply-tracking';

interface ProyeksiKomoditas {
  komoditas: {
    id: string;
    nama: string;
    gambar: string;
    kategori: string;
    hargaSaatIni: number;
    kebutuhanBulananKg: number;
    totalEstimasiProduksiKg: number;
    supplyStatus: string;
    umurPanenHari?: number;
    estimasiBulanPanen: string;
    jumlahPetaniAktif: number;
  };
  skorUrgensi: number;           // 0–100, makin tinggi makin dibutuhkan
  defisitKg: number;             // Selisih kebutuhan – supply saat ini
  kompetitorKg: number;          // Volume petani lain yang sudah menanam
  bulanMenujuPanen: number;      // Berapa bulan hingga bisa panen
  urgensiLabel: 'Sangat Dibutuhkan' | 'Dibutuhkan' | 'Cukup' | 'Hindari';
  urgensiColor: string;
  alasanUtama: string;
  potensiPendapatan: number;     // Estimasi jika lahan 0.25 Ha ditanami
}

const RekomendasiTanamPage: React.FC = () => {
  const {
    komoditas: listKomoditas,
    tender: listTender,
    currentUser,
    lahan: listLahan,
    tanamanAktif: listTanamanAktif,
  } = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('rekomendasi');
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('semua');
  const [horizonBulan, setHorizonBulan] = useState<1 | 3 | 6>(3);

  // ── Informasi Petani ──────────────────────────────────────────
  const petaniLahan = listLahan.filter(
    l => l.petaniId === currentUser?.id && l.statusVerifikasi === 'approved'
  );
  const totalLuasLahan = petaniLahan.reduce((sum, l) => sum + l.luasHektar, 0);
  const lahanDigunakanKomoditas = new Set(
    listTanamanAktif
      .filter(t => t.petaniId === currentUser?.id && t.statusVerifikasi !== 'rejected')
      .map(t => t.komoditasNama.toLowerCase())
  );

  // ── Volume kompetitor (petani lain sedang menanam) ────────────
  const kompetitorVolume: Record<string, number> = {};
  listTanamanAktif.forEach(t => {
    if (t.petaniId !== currentUser?.id && t.statusVerifikasi === 'approved') {
      const key = t.komoditasNama.toLowerCase();
      kompetitorVolume[key] = (kompetitorVolume[key] || 0) + t.estimasiHasilKg;
    }
  });

  // ── Volume permintaan tender historis (tren kebutuhan pasar) ──
  const tenderDemand: Record<string, number> = {};
  listTender.forEach(t => {
    const key = t.komoditasNama.toLowerCase();
    tenderDemand[key] = (tenderDemand[key] || 0) + t.kebutuhanKg;
  });

  // ── Bangun Proyeksi per Komoditas ─────────────────────────────
  const proyeksiList: ProyeksiKomoditas[] = listKomoditas.map(k => {
    const key = k.nama.toLowerCase();
    const umurHari = k.umurPanenHari || 75;
    const bulanMenujuPanen = Math.ceil(umurHari / 30);

    // Hanya rekomendasikan jika bisa panen dalam horizon yang dipilih
    // (lebih dari 0 karena perlu waktu tanam, kurang dari horizon)
    const relevantHorizon = bulanMenujuPanen <= horizonBulan;

    const defisitKg = Math.max(0, k.kebutuhanBulananKg * horizonBulan - k.totalEstimasiProduksiKg);
    const kompetitorKg = kompetitorVolume[key] || 0;
    const trendPermintaan = tenderDemand[key] || 0;

    // Faktor lahan petani (lahan sempit → prioritaskan cepat panen)
    let lahanFaktor = 0;
    if (totalLuasLahan > 0.5) {
      lahanFaktor = umurHari >= 60 ? 25 : 15;
    } else {
      lahanFaktor = umurHari < 60 ? 25 : 8;
    }

    // Penalti jika sudah ada banyak kompetitor
    const kompetitorPenalti = Math.min(30, (kompetitorKg / 5000) * 15);

    // Bonus jika defisit besar
    const defisitBonus = Math.min(35, (defisitKg / 10000) * 25);

    // Bonus jika permintaan historis tinggi
    const trendBonus = trendPermintaan > 5000 ? 15 : trendPermintaan > 1000 ? 8 : 0;

    // Penalti jika sudah oversupply
    const supplyPenalti = k.supplyStatus === 'berlebih' ? 30 : 0;

    // Bonus relevansi horizon
    const horizonBonus = relevantHorizon ? 10 : -20;

    const rawSkor = 30 + defisitBonus + trendBonus + lahanFaktor + horizonBonus - kompetitorPenalti - supplyPenalti;
    const skorUrgensi = Math.max(0, Math.min(98, Math.round(rawSkor)));

    // Label & warna
    let urgensiLabel: ProyeksiKomoditas['urgensiLabel'];
    let urgensiColor: string;
    if (k.supplyStatus === 'berlebih') {
      urgensiLabel = 'Hindari';
      urgensiColor = 'bg-red-50 text-red-700 border border-red-200';
    } else if (skorUrgensi >= 72) {
      urgensiLabel = 'Sangat Dibutuhkan';
      urgensiColor = 'bg-emerald-50 text-emerald-800 border border-emerald-300';
    } else if (skorUrgensi >= 50) {
      urgensiLabel = 'Dibutuhkan';
      urgensiColor = 'bg-amber-50 text-amber-800 border border-amber-200';
    } else {
      urgensiLabel = 'Cukup';
      urgensiColor = 'bg-blue-50 text-blue-700 border border-blue-200';
    }

    // Alasan utama
    let alasanUtama = '';
    if (k.supplyStatus === 'berlebih') {
      alasanUtama = `Stok ${k.nama} sudah berlebih (${(k.totalEstimasiProduksiKg / 1000).toFixed(1)} ton). Tunda penanaman untuk mencegah oversupply.`;
    } else if (defisitKg > 5000) {
      alasanUtama = `Defisit ${(defisitKg / 1000).toFixed(1)} ton untuk ${horizonBulan} bulan ke depan. Gudang sangat membutuhkan komoditas ini!`;
    } else if (kompetitorKg > 3000) {
      alasanUtama = `${(kompetitorKg / 1000).toFixed(1)} ton sudah ditanam petani lain. Tanam secukupnya atau pilih komoditas lain.`;
    } else if (trendPermintaan > 2000 && kompetitorKg < 1000) {
      alasanUtama = `Tren permintaan gudang tinggi (${(trendPermintaan / 1000).toFixed(1)} ton historis) dan kompetitor masih sedikit. Peluang besar!`;
    } else if (totalLuasLahan <= 0.5 && umurHari < 60) {
      alasanUtama = `Lahan Anda ${totalLuasLahan.toFixed(2)} Ha. ${k.nama} (${umurHari} hari) ideal untuk lahan kecil — panen cepat, perputaran modal cepat.`;
    } else {
      alasanUtama = `Supply ${k.nama} masih seimbang. Harga saat ini ${formatRupiah(k.hargaSaatIni)}/kg.`;
    }

    // Potensi pendapatan (asumsi 0.25 Ha atau lahan petani jika ada)
    const luasEfektif = Math.min(totalLuasLahan > 0 ? totalLuasLahan * 0.4 : 0.25, 1);
    const estimasiHasilKg = luasEfektif * 10000 * 0.3; // 30% dari bobot penuh
    const potensiPendapatan = estimasiHasilKg * k.hargaSaatIni;

    return {
      komoditas: k,
      skorUrgensi,
      defisitKg,
      kompetitorKg,
      bulanMenujuPanen,
      urgensiLabel,
      urgensiColor,
      alasanUtama,
      potensiPendapatan
    };
  }).sort((a, b) => b.skorUrgensi - a.skorUrgensi);

  // ── Filter halaman "Semua Produk" ─────────────────────────────
  const kategoris = ['semua', ...new Set(listKomoditas.map(k => k.kategori))];
  const filteredKomoditas = listKomoditas.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === 'semua' || k.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const supplyKurang = listKomoditas.filter(k => k.supplyStatus === 'kurang');
  const supplyCukup = listKomoditas.filter(k => k.supplyStatus === 'cukup');
  const supplyBerlebih = listKomoditas.filter(k => k.supplyStatus === 'berlebih');

  // ── Badge warna urgensi ───────────────────────────────────────
  const getLeftBorderColor = (label: ProyeksiKomoditas['urgensiLabel']) => {
    if (label === 'Sangat Dibutuhkan') return 'border-l-emerald-500';
    if (label === 'Dibutuhkan') return 'border-l-amber-400';
    if (label === 'Hindari') return 'border-l-red-400';
    return 'border-l-blue-300';
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-600 text-white px-4 py-4 pb-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl active:scale-95 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Rekomendasi Tanam</h1>
            <p className="text-green-100 text-xs">Proyeksi kebutuhan gudang masa depan untuk rencana tanam Anda</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setTab('rekomendasi')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab === 'rekomendasi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            <Lightbulb size={13} /> Proyeksi
          </button>
          <button
            onClick={() => setTab('daftar-produk')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab === 'daftar-produk' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            <List size={13} /> Semua Produk
          </button>
          <button
            onClick={() => setTab('supply-tracking')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab === 'supply-tracking' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            <BarChart3 size={13} /> Supply
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-4">

        {/* ══════════════════════════════════════════
            TAB PROYEKSI REKOMENDASI TANAM
        ══════════════════════════════════════════ */}
        {tab === 'rekomendasi' && (
          <>
            {/* Info konteks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Target size={16} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Proyeksi Kebutuhan Gudang</p>
                  <p className="text-[10px] text-gray-500">Berdasarkan data supply vs kebutuhan bulanan BUMD</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Tanam komoditas yang <strong>dibutuhkan gudang masa depan</strong> — bukan yang sedang tren saja.
                Ini mencegah <span className="text-red-600 font-semibold">oversupply</span> dan memastikan hasil panen Anda langsung terserap.
              </p>

              {/* Info lahan petani */}
              <div className="mt-3 flex items-center gap-3 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                <Wheat size={20} className="text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-800">
                    Lahan Anda: {totalLuasLahan > 0 ? `${totalLuasLahan.toFixed(2)} Ha (${petaniLahan.length} lahan)` : 'Belum ada lahan terverifikasi'}
                  </p>
                  {lahanDigunakanKomoditas.size > 0 && (
                    <p className="text-emerald-600 text-[10px] mt-0.5">
                      Sedang ditanam: {[...lahanDigunakanKomoditas].join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Selector Horizon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={11} /> Proyeksi untuk berapa bulan ke depan?
              </p>
              <div className="flex gap-2">
                {([1, 3, 6] as const).map(bln => (
                  <button
                    key={bln}
                    onClick={() => setHorizonBulan(bln)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      horizonBulan === bln
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    {bln} Bulan
                  </button>
                ))}
              </div>
            </div>

            {/* Peringatan Oversupply */}
            {supplyBerlebih.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex gap-3">
                <ShieldAlert size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700 mb-1">⚠️ Komoditas Sedang Oversupply — Hindari Menanam</p>
                  <p className="text-[11px] text-red-600">
                    {supplyBerlebih.map(k => `${k.gambar} ${k.nama}`).join(', ')} — stok sudah melampaui kebutuhan gudang. Tanam ini sekarang berisiko <strong>tidak terserap</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Top 2 Rekomendasi — Panel Personal AI */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-700 text-white rounded-2xl p-4 shadow-md relative overflow-hidden border border-emerald-600/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] rounded-full -mr-12 -mt-12 blur-xl" />
              <div className="flex items-center gap-2 mb-1 relative z-10">
                <Zap size={14} className="text-amber-300" />
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200">Saran Terbaik Untuk Anda</p>
              </div>
              <p className="text-[11px] text-white/80 mb-3 leading-relaxed relative z-10">
                Berdasarkan <strong>lahan {totalLuasLahan.toFixed(2)} Ha</strong>, jadwal panen kompetitor, dan defisit supply gudang {horizonBulan} bulan ke depan:
              </p>
              <div className="space-y-2.5 relative z-10">
                {proyeksiList.filter(p => p.urgensiLabel !== 'Hindari').slice(0, 2).map(item => (
                  <div key={item.komoditas.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-start gap-3">
                      <img 
                        src={getKomoditasImageMap(item.komoditas.nama || item.komoditas.gambar).url} 
                        alt={item.komoditas.nama} 
                        className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0 shadow-sm" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{item.komoditas.nama}</h4>
                          <div className="text-center shrink-0 ml-2">
                            <span className="text-[8px] text-white/60 block font-semibold uppercase tracking-wider">Urgensi</span>
                            <span className="text-sm font-extrabold text-amber-300">{item.skorUrgensi}%</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/80 mt-0.5 leading-snug">{item.alasanUtama}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[8px] bg-white/15 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Clock size={8} /> {item.bulanMenujuPanen} bln panen
                          </span>
                          {item.defisitKg > 0 && (
                            <span className="text-[8px] bg-red-400/20 text-red-200 px-1.5 py-0.5 rounded font-semibold">
                              Defisit {(item.defisitKg / 1000).toFixed(1)} ton
                            </span>
                          )}
                          <span className="text-[8px] bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded font-semibold">
                            Est. {formatRupiah(item.potensiPendapatan)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/petani/data-lahan/tambah-tanaman?komoditasId=${item.komoditas.id}&komoditasNama=${encodeURIComponent(item.komoditas.nama)}`)}
                      className="mt-2.5 w-full py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Sprout size={12} /> Jadwalkan Tanam {item.komoditas.nama} →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shortcut ke Pesanan Gudang */}
            <button
              onClick={() => navigate('/petani/pesanan-gudang')}
              className="w-full bg-white border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <PackageCheck size={18} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-800">Lihat Pesanan Gudang Aktif</p>
                  <p className="text-[10px] text-gray-500">Penuhi Purchase Order yang sudah dibuka BUMD</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-blue-500 shrink-0" />
            </button>

            {/* Semua Kartu Proyeksi */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart3 size={11} /> Proyeksi Semua Komoditas ({horizonBulan} Bulan)
              </p>
              <div className="space-y-3">
                {proyeksiList.map(item => (
                  <div
                    key={item.komoditas.id}
                    className={`bg-white rounded-2xl border-l-4 border border-gray-100 shadow-sm p-4 ${getLeftBorderColor(item.urgensiLabel)}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={getKomoditasImageMap(item.komoditas.nama || item.komoditas.gambar).url} 
                          alt={item.komoditas.nama} 
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0 shadow-xs" 
                        />
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{item.komoditas.nama}</h3>
                          <p className="text-[10px] text-gray-400 capitalize">{item.komoditas.kategori}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-full ${item.urgensiColor}`}>
                        {item.urgensiLabel}
                      </span>
                    </div>

                    {/* Alasan */}
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-3 bg-gray-50 rounded-xl px-3 py-2">
                      {item.alasanUtama}
                    </p>

                    {/* Metrik */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Urgensi</p>
                        <p className={`font-extrabold text-sm mt-0.5 ${item.skorUrgensi >= 72 ? 'text-emerald-600' : item.skorUrgensi >= 50 ? 'text-amber-600' : item.urgensiLabel === 'Hindari' ? 'text-red-500' : 'text-blue-500'}`}>
                          {item.skorUrgensi}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Panen</p>
                        <p className="font-bold text-xs text-gray-700 mt-0.5">{item.bulanMenujuPanen} bln</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2">
                        <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">Harga/kg</p>
                        <p className="font-bold text-xs text-emerald-700 mt-0.5">{formatRupiah(item.komoditas.hargaSaatIni)}</p>
                      </div>
                    </div>

                    {/* Defisit & Kompetitor */}
                    {(item.defisitKg > 0 || item.kompetitorKg > 0) && (
                      <div className="flex gap-2 mb-3">
                        {item.defisitKg > 0 && (
                          <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-2">
                            <p className="text-[8px] text-red-400 font-bold uppercase tracking-wider">Defisit Gudang</p>
                            <p className="font-bold text-xs text-red-600 mt-0.5">{(item.defisitKg / 1000).toFixed(1)} ton</p>
                          </div>
                        )}
                        {item.kompetitorKg > 0 && (
                          <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-2">
                            <p className="text-[8px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1"><Users size={8} /> Kompetitor</p>
                            <p className="font-bold text-xs text-amber-600 mt-0.5">{(item.kompetitorKg / 1000).toFixed(1)} ton</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Estimasi pendapatan */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center justify-between mb-3">
                      <p className="text-[10px] text-emerald-600 font-medium">Est. Pendapatan ({(Math.min(totalLuasLahan > 0 ? totalLuasLahan * 0.4 : 0.25, 1)).toFixed(2)} Ha)</p>
                      <p className="font-bold text-xs text-emerald-700">~{formatRupiah(item.potensiPendapatan)}</p>
                    </div>

                    {/* CTA */}
                    {item.urgensiLabel !== 'Hindari' ? (
                      <button
                        onClick={() => navigate(`/petani/data-lahan/tambah-tanaman?komoditasId=${item.komoditas.id}&komoditasNama=${encodeURIComponent(item.komoditas.nama)}`)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Sprout size={13} /> Jadwalkan Tanam Sekarang <ArrowUpRight size={13} />
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                        <ShieldAlert size={13} /> Tunda Penanaman Komoditas Ini
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            TAB DAFTAR SEMUA PRODUK / SAYURAN
        ══════════════════════════════════════════ */}
        {tab === 'daftar-produk' && (
          <>
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk/sayuran..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
              />
            </div>

            {/* Kategori */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {kategoris.map(k => (
                <button
                  key={k}
                  onClick={() => setKategoriFilter(k)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    kategoriFilter === k
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {k === 'semua' ? 'Semua' : k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Total {filteredKomoditas.length} produk ditemukan</p>
            </div>

            {filteredKomoditas.map(k => (
              <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getKomoditasImageMap(k.nama || k.gambar).url} 
                      alt={k.nama} 
                      className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0 shadow-xs" 
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-800">{k.nama}</h3>
                      <p className="text-xs text-gray-400 capitalize">{k.kategori}</p>
                    </div>
                  </div>
                  <StatusBadge status={k.supplyStatus} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Petani Aktif</p>
                    <p className="font-bold text-lg text-emerald-700">{k.jumlahPetaniAktif}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Estimasi Produksi</p>
                    <p className="font-bold text-lg">{(k.totalEstimasiProduksiKg / 1000).toFixed(1)} <span className="text-xs font-normal">ton</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Est. Panen</p>
                    <p className="font-semibold text-[11px] text-gray-700 mt-0.5">{k.estimasiBulanPanen}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Harga/kg</p>
                    <p className="font-semibold text-[11px] text-gray-700 mt-0.5">{formatRupiah(k.hargaSaatIni)}</p>
                  </div>
                </div>
                {/* Supply bar */}
                <div>
                  <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                    <span>Supply vs Kebutuhan</span>
                    <span>{((k.totalEstimasiProduksiKg / k.kebutuhanBulananKg) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${k.supplyStatus === 'kurang' ? 'bg-red-400' : k.supplyStatus === 'cukup' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min((k.totalEstimasiProduksiKg / k.kebutuhanBulananKg) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>Supply: {(k.totalEstimasiProduksiKg / 1000).toFixed(1)} ton</span>
                    <span>Kebutuhan: {(k.kebutuhanBulananKg / 1000).toFixed(1)} ton/bln</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══════════════════════════════════════════
            TAB SUPPLY TRACKING
        ══════════════════════════════════════════ */}
        {tab === 'supply-tracking' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{supplyKurang.length}</p>
                <p className="text-[10px] text-red-500 font-medium mt-0.5">Kurang</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{supplyCukup.length}</p>
                <p className="text-[10px] text-emerald-500 font-medium mt-0.5">Cukup</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{supplyBerlebih.length}</p>
                <p className="text-[10px] text-amber-500 font-medium mt-0.5">Berlebih</p>
              </div>
            </div>

            {/* Kurang */}
            {supplyKurang.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-red-700 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Komoditas Kurang Supply — Sangat Dibutuhkan
                </h3>
                <div className="space-y-2">
                  {supplyKurang.map(k => (
                    <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-400 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={getKomoditasImageMap(k.nama || k.gambar).url} alt={k.nama} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-gray-800">{k.nama}</p>
                            <p className="text-xs text-gray-500">{k.jumlahPetaniAktif} petani aktif</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-red-600 font-bold">
                            Kurang {((k.kebutuhanBulananKg - k.totalEstimasiProduksiKg) / 1000).toFixed(1)} ton
                          </p>
                          <p className="text-[10px] text-gray-400">Panen: {k.estimasiBulanPanen}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/petani/data-lahan/tambah-tanaman?komoditasId=${k.id}&komoditasNama=${encodeURIComponent(k.nama)}`)}
                        className="mt-2.5 w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Sprout size={12} /> Tanam Sekarang
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cukup */}
            {supplyCukup.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-emerald-700 mb-2 flex items-center gap-1.5">
                  <Sprout size={14} /> Supply Cukup — Bisa Ditanam Secukupnya
                </h3>
                <div className="space-y-2">
                  {supplyCukup.map(k => (
                    <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-400 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={getKomoditasImageMap(k.nama || k.gambar).url} alt={k.nama} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                          <p className="font-semibold text-sm text-gray-800">{k.nama}</p>
                        </div>
                        <p className="text-xs text-emerald-600 font-medium">{k.jumlahPetaniAktif} petani</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Berlebih */}
            {supplyBerlebih.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-amber-700 mb-2 flex items-center gap-1.5">
                  <TrendingUp size={14} /> Supply Berlebih — Hindari Menanam
                </h3>
                <div className="space-y-2">
                  {supplyBerlebih.map(k => (
                    <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-amber-400 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={getKomoditasImageMap(k.nama || k.gambar).url} alt={k.nama} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{k.nama}</p>
                            <p className="text-xs text-gray-500">{k.jumlahPetaniAktif} petani aktif</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-amber-600 font-semibold">
                            Lebih {((k.totalEstimasiProduksiKg - k.kebutuhanBulananKg) / 1000).toFixed(1)} ton
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RekomendasiTanamPage;
