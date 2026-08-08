// =====================================================
// PETANI: PESANAN GUDANG (PO DARI GUDANG)
// =====================================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FileText, Calendar, Clock, Inbox, Sprout, CheckCircle2, ChevronRight, Truck, ShieldCheck, CheckCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah, formatOrderId } from '../../utils/formatters';
import { formatPOCode } from '../../utils/kode';
import StatusBadge from '../../components/StatusBadge';
import { getKomoditasImageMap } from '../../utils/cropHelpers';

const PesananGudangPage: React.FC = () => {
  const { 
    tenderPetani: myTenderPetani, 
    tender: tendersList, 
    komoditas: komoditasList,
    tanamanAktif: listTanamanAktif,
    pengajuanJual: listPengajuanJual,
    currentUser,
    verifyTenderPetani,
    applyTender,
    refreshData
  } = useData();
  const navigate = useNavigate();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'aktif' | 'tersedia' | 'historis'>('aktif');

  // Cek apakah petani yang login sedang menanam komoditas tersebut (aktif & belum dipanen/dijual)
  const isGrowingCommodity = (komoditasNama: string) => {
    if (!currentUser) return false;
    return listTanamanAktif.some(t => 
      t.petaniId === currentUser.id &&
      t.statusVerifikasi === 'approved' &&
      (t.komoditasNama.toLowerCase().includes(komoditasNama.toLowerCase()) || komoditasNama.toLowerCase().includes(t.komoditasNama.toLowerCase())) &&
      !listPengajuanJual.some(pj => pj.tanamanAktifId === t.id && ['selesai', 'proses_timbang', 'pickup_dijadwalkan'].includes(pj.status))
    );
  };

  // Filter PO allocations belonging to the logged-in farmer (by ID or Name)
  const myAllocations = myTenderPetani.filter(tp => {
    if (!currentUser) return false;
    if (tp.petaniId === currentUser.id) return true;
    if (tp.petaniNama && currentUser.nama && tp.petaniNama.toLowerCase().trim() === currentUser.nama.toLowerCase().trim()) return true;
    return false;
  });

  const activeAllocations = myAllocations.filter(alloc => alloc.statusApproval !== 'selesai');
  const historyAllocations = myAllocations.filter(alloc => alloc.statusApproval === 'selesai');
  const availableTenders = tendersList.filter(t => t.status === 'aktif' || t.status === 'pending');

  const getTenderInfo = (tenderId: string, alloc?: any) => {
    const found = tendersList.find(t => t.id === tenderId);
    if (found) return found;
    const kInfo = komoditasList.find(k => alloc?.catatanAdmin?.toLowerCase().includes(k.nama.toLowerCase()));
    return {
      id: tenderId,
      komoditasNama: kInfo?.nama || 'Sayuran Organik',
      kebutuhanKg: alloc?.kesanggupanKg || 100,
      hargaPerKg: kInfo?.hargaSaatIni || 12000,
      createdAt: alloc?.tanggalDaftar || new Date().toISOString()
    };
  };

  const getKomoditasGambar = (komoditasNama: string) => {
    const k = komoditasList.find(x => x.nama.toLowerCase() === komoditasNama.toLowerCase());
    return getKomoditasImageMap(komoditasNama || k?.gambar).url;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block">Masuk (Baru)</span>;
      case 'approved':
        return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block">Diproses</span>;
      case 'survey':
        return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block">Siap Kirim</span>;
      case 'dikirim':
      case 'proses_timbang':
        return <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block">📦 Dikirim (Menunggu Timbang)</span>;
      case 'selesai':
        return <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block">Dikirim (Selesai)</span>;
      default:
        return <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap inline-block">{status}</span>;
    }
  };

  const handleClaimPO = async (tender: any) => {
    if (!currentUser) return;
    const sisaKg = tender.kebutuhanKg - (tender.terpenuhinKg || 0);
    const claimKg = sisaKg > 0 ? sisaKg : tender.kebutuhanKg;

    if (!window.confirm(`Konfirmasi mengambil pesanan PO Gudang (${tender.komoditasNama} - ${claimKg} kg)?`)) return;

    setLoadingId(tender.id);
    const success = await applyTender({
      tenderId: tender.id,
      petaniId: currentUser.id,
      petaniNama: currentUser.nama,
      kesanggupanKg: claimKg,
      catatanPetani: `[PEMENUHAN PO GUDANG] Petani ${currentUser.nama} mengambil pesanan ${tender.komoditasNama}`,
      statusApproval: 'approved'
    });

    if (success) {
      alert(`✅ Berhasil mengambil pesanan PO ${tender.komoditasNama}! Pesanan ini sekarang aktif di daftar 'PO Aktif Saya'.`);
      setActiveTab('aktif');
      await refreshData();
    } else {
      alert(`⚠️ Gagal mengambil pesanan PO.`);
    }
    setLoadingId(null);
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    let nextStatus = '';
    let confirmMsg = '';

    if (currentStatus === 'pending') {
      nextStatus = 'approved';
      confirmMsg = 'Mulai memproses pesanan PO ini?';
    } else if (currentStatus === 'approved') {
      nextStatus = 'survey';
      confirmMsg = 'Konfirmasi bahwa sayuran telah dipanen dan siap kirim?';
    } else if (currentStatus === 'survey') {
      nextStatus = 'dikirim';
      confirmMsg = 'Konfirmasi bahwa sayuran telah dikirim ke Gudang Cianjur? (Hasil panen akan ditimbang oleh petugas gudang)';
    } else {
      return;
    }

    if (!window.confirm(confirmMsg)) return;

    setLoadingId(id);
    const success = await verifyTenderPetani(id, nextStatus, `Status diperbarui oleh petani pada ${new Date().toLocaleDateString('id-ID')}`);
    if (success) {
      await refreshData();
    } else {
      alert('Gagal memperbarui status pesanan');
    }
    setLoadingId(null);
  };

  // Calculations for history summary
  const totalVolumeHistory = historyAllocations.reduce((sum, a) => sum + a.kesanggupanKg, 0);
  const totalPendapatanHistory = historyAllocations.reduce((sum, a) => {
    const info = getTenderInfo(a.tenderId);
    return sum + (a.kesanggupanKg * (info?.hargaPerKg || 0));
  }, 0);

  return (
    <div className="animate-fade-in px-4 pt-4 pb-20">
      <div className="mb-4">
        <h1 className="page-title flex items-center gap-2"><Inbox size={24} className="text-primary-600" /> Pesanan Gudang</h1>
        <p className="text-xs text-gray-500 mt-1">Daftar Purchase Order (PO) Gudang Cianjur yang dialokasikan kepada Anda</p>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 border-b border-gray-100 no-scrollbar">
        <button
          onClick={() => setActiveTab('aktif')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeTab === 'aktif'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>📦 PO Aktif</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'aktif' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
            {activeAllocations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tersedia')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeTab === 'tersedia'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>🌱 Permintaan Tersedia</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'tersedia' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
            {availableTenders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('historis')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeTab === 'historis'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>📜 Historis PO Selesai</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'historis' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
            {historyAllocations.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: PO AKTIF SAYA ── */}
      {activeTab === 'aktif' && (
        <div>
          {activeAllocations.length === 0 ? (
            <div className="card text-center py-12 text-gray-400 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-6">
              <FileText size={48} className="text-gray-300 mb-3" />
              <p className="font-bold text-sm text-gray-700">Tidak Ada PO Aktif</p>
              <p className="text-[11px] text-gray-400 mt-1">Saat ini belum ada pesanan aktif dari gudang yang perlu diproses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAllocations.map(alloc => {
                const tenderInfo = getTenderInfo(alloc.tenderId, alloc);
                const komoditasGambar = tenderInfo ? getKomoditasGambar(tenderInfo.komoditasNama) : '🥕';
                const harga = tenderInfo?.hargaPerKg || 12000;
                const totalEstimasi = alloc.kesanggupanKg * harga;
                
                const tglPesan = tenderInfo?.createdAt 
                  ? new Date(tenderInfo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(alloc.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                
                const tglBatas = alloc.batasWaktu
                  ? new Date(alloc.batasWaktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '-';

                return (
                  <div key={alloc.id} className="card border border-gray-100 p-4 bg-white shadow-sm rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <img src={komoditasGambar} alt={tenderInfo?.komoditasNama || 'Komoditas'} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0" />
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{tenderInfo?.komoditasNama || 'Komoditas'}</h3>
                          <p className="text-[10px] text-gray-400">Order ID: {formatPOCode(alloc.tenderId.replace('TDR_', ''), tenderInfo?.komoditasNama)}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(alloc.statusApproval)}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs border border-gray-100/50">
                      {tenderInfo && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Kebutuhan Gudang:</span>
                          <span className="font-semibold text-gray-600">{tenderInfo.kebutuhanKg.toLocaleString('id-ID')} kg</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alokasi Untuk Anda:</span>
                        <span className="font-bold text-gray-800">{alloc.kesanggupanKg.toLocaleString('id-ID')} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Harga Beli Gudang:</span>
                        <span className="font-bold text-emerald-600">{formatRupiah(harga)}/kg</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/50 pb-2 mb-1">
                        <span className="text-gray-400">Estimasi Pendapatan:</span>
                        <span className="font-extrabold text-gray-800">{formatRupiah(totalEstimasi)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">Tanggal Pesan</span>
                          <span className="font-semibold text-gray-700 text-[11px] flex items-center gap-1"><Calendar size={10} /> {tglPesan}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">Batas Pengiriman</span>
                          <span className="font-semibold text-amber-700 text-[11px] flex items-center gap-1"><Clock size={10} /> {tglBatas}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(alloc.id, alloc.statusApproval)}
                      disabled={loadingId === alloc.id}
                      className={`mt-3 w-full font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                        alloc.statusApproval === 'pending'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : alloc.statusApproval === 'approved'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {loadingId === alloc.id ? (
                        'Memproses...'
                      ) : alloc.statusApproval === 'pending' ? (
                        <>Terima & Proses Pesanan <ChevronRight size={14} /></>
                      ) : alloc.statusApproval === 'approved' ? (
                        <>Selesai Panen (Siap Kirim) <Sprout size={14} /></>
                      ) : alloc.statusApproval === 'survey' ? (
                        <>Kirim Ke Gudang Cianjur <Truck size={14} /></>
                      ) : (
                        <>📦 Sedang Penimbangan & QC Gudang <Clock size={14} /></>
                      )}
                    </button>

                    <button
                      onClick={() => navigate('/petani/jual-panen')}
                      className="mt-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileText size={13} className="text-primary-600" /> Lihat Status & Tracking Penjualan →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PERMINTAAN GUDANG TERSEDIA ── */}
      {activeTab === 'tersedia' && (
        <div>
          {availableTenders.length === 0 ? (
            <div className="card text-center py-12 text-gray-400 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-6">
              <Sprout size={48} className="text-gray-300 mb-3" />
              <p className="font-bold text-sm text-gray-700">Belum Ada Permintaan Baru</p>
              <p className="text-[11px] text-gray-400 mt-1">Saat ini belum ada penawaran permintaan komoditas baru dari Gudang.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableTenders.map(tender => {
                const persen = (tender.terpenuhinKg / tender.kebutuhanKg) * 100;
                const sisaKg = tender.kebutuhanKg - tender.terpenuhinKg;
                const sudahDaftar = myAllocations.some(tp => tp.tenderId === tender.id);
                const isFull = persen >= 100;

                return (
                  <div key={tender.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                             <h3 className="font-bold text-[15px] text-gray-800">{tender.komoditasNama}</h3>
                             <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-md border border-blue-100">
                               <ShieldCheck size={10} /> Terverifikasi
                             </span>
                             {isGrowingCommodity(tender.komoditasNama) && (
                               <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded-md border border-emerald-200 animate-pulse">
                                 🌱 Disebar ke Tanaman Aktif Anda
                               </span>
                             )}
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2">{tender.deskripsi}</p>
                        </div>
                        <StatusBadge status={tender.status} size="sm" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Kebutuhan</p>
                          <p className="font-bold text-sm text-gray-800 mt-0.5">{tender.kebutuhanKg.toLocaleString('id-ID')} kg</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Terpenuhi</p>
                          <p className="font-bold text-sm text-gray-800 mt-0.5">{tender.terpenuhinKg.toLocaleString('id-ID')} kg</p>
                        </div>
                        <div className="bg-primary-50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-primary-500 font-bold uppercase tracking-wider">Harga/kg</p>
                          <p className="font-bold text-sm text-primary-700 mt-0.5">{formatRupiah(tender.hargaPerKg)}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress Pemenuhan</span>
                          <span className="font-bold">{persen.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isFull ? 'bg-emerald-500' : 'bg-primary-500'}`}
                            style={{ width: `${Math.min(persen, 100)}%` }}
                          />
                        </div>
                        {!isFull && (
                          <p className="text-[10px] text-gray-400 mt-1">Sisa: <span className="font-bold text-gray-600">{sisaKg.toLocaleString()} kg</span></p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 py-3 border-t border-gray-50">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium"><Clock size={12} className="text-primary-500" /> Periode Panen: {tender.periodePanen}</span>
                      </div>
                    </div>

                    {tender.status === 'aktif' && !sudahDaftar && !isFull && (
                      <div className="px-4 pb-4">
                        <button
                          onClick={() => handleClaimPO(tender)}
                          disabled={loadingId === tender.id}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loadingId === tender.id ? (
                            <span className="flex items-center gap-2">⏳ Memproses...</span>
                          ) : (
                            <>
                              <CheckCircle2 size={16} /> Terima & Ambil Pesanan Ini (1-Click)
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {isFull && !sudahDaftar && (
                      <div className="px-4 pb-4">
                        <div className="bg-gray-50 rounded-xl py-2.5 text-center">
                          <p className="text-xs text-gray-400 font-medium">Permintaan sudah terpenuhi</p>
                        </div>
                      </div>
                    )}

                    {sudahDaftar && (
                      <div className="px-4 pb-4">
                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 flex items-center gap-2">
                          <CheckCircle size={14} className="text-primary-600 shrink-0" />
                          <p className="text-xs text-primary-700 font-medium">Anda sudah mengambil pesanan ini</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: HISTORIS PO SELESAI ── */}
      {activeTab === 'historis' && (
        <div>
          {/* Ringkasan Keuangan Historis PO */}
          {historyAllocations.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-3 shadow-md">
                <p className="text-[9px] text-purple-200 uppercase font-bold tracking-wider">Total PO Selesai</p>
                <p className="text-lg font-extrabold mt-0.5">{historyAllocations.length} PO</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-2xl p-3 shadow-md">
                <p className="text-[9px] text-blue-200 uppercase font-bold tracking-wider">Total Terkirim</p>
                <p className="text-base font-extrabold mt-0.5">{totalVolumeHistory.toLocaleString('id-ID')} kg</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-3 shadow-md">
                <p className="text-[9px] text-emerald-200 uppercase font-bold tracking-wider">Total Pendapatan</p>
                <p className="text-xs font-extrabold mt-1 truncate">{formatRupiah(totalPendapatanHistory)}</p>
              </div>
            </div>
          )}

          {historyAllocations.length === 0 ? (
            <div className="card text-center py-12 text-gray-400 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-6">
              <History size={48} className="text-gray-300 mb-3" />
              <p className="font-bold text-sm text-gray-700">Belum Ada Historis PO</p>
              <p className="text-[11px] text-gray-400 mt-1">Pesanan PO Gudang yang telah selesai dikirim akan tersimpan di sini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyAllocations.map(alloc => {
                const tenderInfo = getTenderInfo(alloc.tenderId, alloc);
                const komoditasGambar = tenderInfo ? getKomoditasGambar(tenderInfo.komoditasNama) : '🥕';
                const harga = tenderInfo?.hargaPerKg || 12000;
                const totalEstimasi = alloc.kesanggupanKg * harga;
                
                const tglPesan = tenderInfo?.createdAt 
                  ? new Date(tenderInfo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(alloc.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div key={alloc.id} className="card border border-purple-100 p-4 bg-white shadow-sm rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <img src={komoditasGambar} alt={tenderInfo?.komoditasNama || 'Komoditas'} className="w-10 h-10 rounded-xl object-cover border border-purple-100 shrink-0" />
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{tenderInfo?.komoditasNama || 'Komoditas'}</h3>
                          <p className="text-[10px] text-gray-400">Order ID: {formatOrderId(alloc.tenderId)}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(alloc.statusApproval)}
                      </div>
                    </div>

                    <div className="bg-purple-50/40 rounded-xl p-3 space-y-2 text-xs border border-purple-100/50">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volume Terkirim:</span>
                        <span className="font-bold text-gray-800">{alloc.kesanggupanKg.toLocaleString('id-ID')} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Harga Beli Gudang:</span>
                        <span className="font-bold text-emerald-600">{formatRupiah(harga)}/kg</span>
                      </div>
                      <div className="flex justify-between border-b border-purple-200/50 pb-2 mb-1">
                        <span className="text-gray-500">Total Pendapatan:</span>
                        <span className="font-extrabold text-emerald-700">{formatRupiah(totalEstimasi)}</span>
                      </div>

                      <div className="flex justify-between pt-1 text-[11px] text-gray-600">
                        <span className="text-gray-400">Tanggal Pesan:</span>
                        <span className="font-semibold text-gray-700 flex items-center gap-1"><Calendar size={10} /> {tglPesan}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 rounded-xl py-2">
                      <CheckCircle2 size={14} className="text-purple-600" /> Pesanan Selesai & Dikirim ke Gudang
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PesananGudangPage;
