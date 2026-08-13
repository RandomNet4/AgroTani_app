// =====================================================
// DATA LAHAN & POLA TANAM (MONITORING TANAM) - PETANI
// =====================================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ArrowLeft, MapPin, Calendar, Scale, Plus, TrendingUp, ShoppingCart, Leaf, Clock, CheckCircle2, X, MoreVertical, Eye, Pencil, Trash2, BookOpen, Zap, PackageCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { DetailLahanModal, EditLahanModal, DeleteConfirmModal, DetailTanamanModal, EditTanamanModal, LogbookModal } from '../../components/LahanModals';
import { hitungHariMenuju } from '../../utils/formatters';
import { hitungProgressTanaman } from '../../utils/cropHelpers';

const DataLahanPage: React.FC = () => {
  const {
    lahan: allLahan,
    tanamanAktif: allTanamanAktif,
    pengajuanJual: allPengajuanJual,
    currentUser,
    deleteLahan,
    deleteTanaman,
    editTanaman,
  } = useData();
  const navigate = useNavigate();
  const petaniId = currentUser?.id || '';

  const lahanSaya = allLahan.filter(l => l.petaniId === petaniId).sort((a, b) => b.id.localeCompare(a.id));
  const tanamanSaya = allTanamanAktif.filter(t => t.petaniId === petaniId).sort((a, b) => b.id.localeCompare(a.id));
  const pengajuanSaya = allPengajuanJual.filter(p => p.petaniId === petaniId).sort((a, b) => b.id.localeCompare(a.id));

  // Modal Catat Panen State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form Panen State
  const [formPanen, setFormPanen] = useState({
    tanggalPanen: new Date().toISOString().split('T')[0],
    hasilPanen: '',
    keterangan: ''
  });

  // Detail/Edit/Hapus Lahan State
  const [detailLahan, setDetailLahan] = useState<any>(null);
  const [editLahanData, setEditLahanData] = useState<any>(null);
  const [hapusLahan, setHapusLahan] = useState<any>(null);
  const [menuLahan, setMenuLahan] = useState<string | null>(null);

  // Detail/Edit/Hapus Tanaman State
  const [detailTanaman, setDetailTanaman] = useState<{ tanaman: any; lahanNama: string } | null>(null);
  const [editTanamanData, setEditTanamanData] = useState<any>(null);
  const [hapusTanaman, setHapusTanaman] = useState<any>(null);
  const [batalTanaman, setBatalTanaman] = useState<any>(null);
  const [menuTanaman, setMenuTanaman] = useState<string | null>(null);
  const [openLogbook, setOpenLogbook] = useState<any>(null);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  // Summary stats
  const tanamanSiapPanen = tanamanSaya.filter(t => {
    const isHarvestReady = hitungHariMenuju(t.estimasiPanen) <= 14;
    const isAlreadySubmitted = pengajuanSaya.some(p => 
      p.tanamanAktifId === t.id && 
      !['rejected'].includes(p.status)
    ) || t.statusVerifikasi === 'selesai_panen';
    return isHarvestReady && !isAlreadySubmitted;
  });

  const openPanenModal = (tanaman: any) => {
    setSelectedTanaman(tanaman);
    setIsModalOpen(true);
  };

  const closePanenModal = () => {
    setIsModalOpen(false);
    setSelectedTanaman(null);
  };

  const handleCatatPanenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleHapusLahan = async () => {
    if (!hapusLahan) return;
    const success = await deleteLahan(hapusLahan.id);
    setHapusLahan(null);
    if (success) showToast('Lahan Berhasil Dihapus!');
    else showToast('Gagal menghapus lahan.');
  };

  const handleHapusTanaman = async () => {
    if (!hapusTanaman) return;
    const success = await deleteTanaman(hapusTanaman.id);
    setHapusTanaman(null);
    if (success) showToast('Tanaman Berhasil Dihapus!');
    else showToast('Gagal menghapus tanaman.');
  };

  const handleBatalTanaman = async () => {
    if (!batalTanaman) return;
    const success = await deleteTanaman(batalTanaman.id);
    setBatalTanaman(null);
    if (success) showToast('Proses Tanam Berhasil Dibatalkan!');
    else showToast('Gagal membatalkan proses tanam.');
  };

  const handleQuickSiapPanen = async (t: any) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const success = await editTanaman(t.id, {
      ...t,
      statusVerifikasi: 'approved',
      estimasiPanen: todayStr
    });
    if (success) {
      showToast(`${t.komoditasNama} diset SIAP PANEN! Masuk Mode Idle (Menunggu pilihan Petani: Jual Mandiri / Pesanan Gudang).`);
    } else {
      showToast('Gagal memproses otomatis panen.');
    }
  };

  const handleQuickPanenSemua = async () => {
    if (!window.confirm('Set semua tanaman aktif di lahan Anda menjadi SIAP PANEN untuk keperluan demo?')) return;
    const todayStr = new Date().toISOString().split('T')[0];
    let count = 0;
    for (const t of tanamanSaya) {
      const ok = await editTanaman(t.id, {
        ...t,
        statusVerifikasi: 'approved',
        estimasiPanen: todayStr
      });
      if (ok) count++;
    }
    showToast(`${count} tanaman berhasil diset SIAP PANEN!`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white px-5 pt-8 pb-7 rounded-b-3xl border-x-2 border-b-2 border-primary-500/30 shadow-lg shadow-primary-900/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.04] rounded-full -mr-24 -mt-24 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.04] rounded-full -ml-16 mb-4 blur-xl" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/petani/dashboard')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 transition-all active:scale-95">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">Daftar Lahan & Pola Tanam</h1>
              <p className="text-white/50 text-xs">Monitoring jadwal tanam terstruktur</p>
            </div>
          </div>
          {currentUser && (
            <div className="text-right">
              <span className="text-[9px] text-white/50 block uppercase font-bold tracking-wider">Petani</span>
              <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full">{currentUser.nama}</span>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
            <p className="text-2xl font-bold leading-none">{lahanSaya.length}</p>
            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1.5">Total Lahan</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
            <p className="text-2xl font-bold leading-none">{tanamanSaya.length}</p>
            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1.5">Siklus Tanam</p>
          </div>
          <div className={`${tanamanSiapPanen.length > 0 ? 'bg-amber-400/30 ring-1 ring-amber-400/50' : 'bg-white/15'} backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center`}>
            <p className="text-2xl font-bold leading-none text-white">{tanamanSiapPanen.length}</p>
            <p className={`${tanamanSiapPanen.length > 0 ? 'text-white' : 'text-white/60'} text-[10px] uppercase font-bold tracking-wider mt-1.5`}>Siap Panen</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {(showSuccess || toastMsg) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 size={18} /> {toastMsg || 'Data Panen Tersimpan!'}
          </div>
        </div>
      )}

      <div className="px-5 mt-6 space-y-5">
        {/* Info Box */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex gap-2.5">
          <TrendingUp size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Gunakan fitur <b>Pola Tanam</b> untuk memonitor progress tanam Anda secara teratur dan mencegah oversuplai saat panen raya.
          </p>
        </div>

        {/* Quick Demo Panen Button */}
        {tanamanSaya.length > 0 && (
          <button
            onClick={handleQuickPanenSemua}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-md hover:shadow-lg active:scale-98 transition-all border border-amber-300/40"
          >
            <Zap size={16} className="text-yellow-200 animate-bounce" />
            <span>Set Semua Tanaman Siap Panen (Mode Demo)</span>
          </button>
        )}

        {/* Tambah Lahan Button */}
        <button
          onClick={() => navigate('/petani/data-lahan/tambah-lahan')}
          className="w-full py-3.5 bg-white border-2 border-dashed border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm group"
        >
          <div className="p-1 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
            <Plus size={18} />
          </div>
          <span className="font-bold text-sm">Daftarkan Lahan Baru</span>
        </button>

        {/* Daftar Lahan */}
        <div className="space-y-5">
          {lahanSaya.map(lahan => {
            const tanamanDiLahan = tanamanSaya
              .filter(t => t.lahanId === lahan.id)
              .sort((a, b) => b.id.localeCompare(a.id));

            return (
              <div key={lahan.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header Lahan */}
                <div className="p-4 border-b border-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-emerald-100/50 overflow-hidden shrink-0">
                        {lahan.fotoLahan && (lahan.fotoLahan.startsWith('data:image/') || lahan.fotoLahan.startsWith('/images/') || (lahan.fotoLahan.startsWith('http') && !lahan.fotoLahan.includes('unsplash.com'))) ? (
                          <img src={lahan.fotoLahan} alt="Foto Lahan" className="w-full h-full object-cover" />
                        ) : (
                          <span>{!lahan.fotoLahan || lahan.fotoLahan.includes('unsplash.com') ? (lahan.jenisLahan === 'sawah' ? '🌾' : '🥬') : lahan.fotoLahan}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[15px] text-gray-800">{lahan.namaLahan}</h3>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-emerald-500" /> {lahan.kecamatan}, {lahan.kabupaten}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={lahan.statusVerifikasi} size="sm" />
                      <div className="relative">
                        <button onClick={() => setMenuLahan(menuLahan === lahan.id ? null : lahan.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                          <MoreVertical size={16} />
                        </button>
                        {menuLahan === lahan.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 w-40">
                            <button onClick={() => { setDetailLahan(lahan); setMenuLahan(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Eye size={14} className="text-blue-500" /> Detail Lahan</button>
                            <button onClick={() => { setEditLahanData(lahan); setMenuLahan(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Pencil size={14} className="text-amber-500" /> Edit Lahan</button>
                            <button onClick={() => { setHapusLahan(lahan); setMenuLahan(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Hapus Lahan</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-gray-600">
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                      <Scale size={12} className="text-primary-500" /> {lahan.luasHektar} Ha
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-lg capitalize">
                      <Leaf size={12} className="text-primary-500" /> {lahan.jenisLahan}
                    </span>
                  </div>
                </div>

                {/* Bagian Pola Tanam / Monitoring Tanam */}
                <div className="p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary-600" />
                      Monitoring Tanam
                    </h4>
                    <button
                      onClick={() => navigate('/petani/data-lahan/tambah-tanaman')}
                      className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} /> Jadwalkan
                    </button>
                  </div>

                  {tanamanDiLahan.length > 0 ? (
                    <div className="relative border-l-2 border-emerald-100 ml-2 pl-4 space-y-4 py-1">
                      {tanamanDiLahan.map((t) => {
                        const hariMenujuPanen = hitungHariMenuju(t.estimasiPanen);
                        const sudahDiajukan = pengajuanSaya.some(p => 
                          p.tanamanAktifId === t.id && 
                          !['rejected'].includes(p.status)
                        ) || t.statusVerifikasi === 'selesai_panen';

                        let progress = hitungProgressTanaman(t.tanggalTanam, t.estimasiPanen, t.statusVerifikasi);

                        let statusText = "Ditanam";
                        let statusColor = "bg-blue-100 text-blue-700";
                        let progressColor = "bg-blue-500";

                        if (sudahDiajukan || t.statusVerifikasi === 'selesai_panen') {
                          statusText = "Selesai Dipanen";
                          statusColor = "bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold";
                          progressColor = "bg-emerald-600";
                          progress = 100;
                        } else if (t.statusVerifikasi === 'pending') {
                          statusText = "Menunggu Verifikasi";
                          statusColor = "bg-amber-50 border border-amber-200 text-amber-800";
                          progressColor = "bg-amber-300";
                          progress = 0;
                        } else if (t.statusVerifikasi === 'rejected') {
                          statusText = "Ditolak";
                          statusColor = "bg-red-50 border border-red-200 text-red-800";
                          progressColor = "bg-red-300";
                          progress = 0;
                        } else if (progress >= 100 || hariMenujuPanen <= 14) {
                          statusText = "Siap Panen";
                          statusColor = "bg-amber-100 text-amber-700";
                          progressColor = "bg-amber-500";
                          progress = 100;
                        } else if (progress >= 20) {
                          statusText = "Pemeliharaan";
                          statusColor = "bg-emerald-100 text-emerald-700";
                          progressColor = "bg-emerald-500";
                        }

                        const blnTanam = new Date(t.tanggalTanam).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                        const blnPanen = new Date(t.estimasiPanen).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                        return (
                          <div key={t.id} className="relative">
                            <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${t.statusVerifikasi === 'pending' ? 'bg-amber-400 animate-pulse' :
                              t.statusVerifikasi === 'rejected' ? 'bg-red-400' :
                                statusText === 'Selesai Dipanen' ? 'bg-emerald-600 shadow-[0_0_0_2px_rgba(16,185,129,0.3)]' :
                                progress === 100 ? 'bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.3)]' :
                                  'bg-emerald-400'
                              }`}></div>

                            <div className={`bg-white rounded-xl border ${t.statusVerifikasi === 'pending' ? 'border-amber-100 shadow-sm' :
                              t.statusVerifikasi === 'rejected' ? 'border-red-100 shadow-sm' :
                                statusText === 'Selesai Dipanen' ? 'border-emerald-200 shadow-sm' :
                                progress === 100 ? 'border-amber-200 shadow-sm' :
                                  'border-gray-100'
                              } p-3 relative`}>
                              <div className="absolute right-2 top-2">
                                <button onClick={() => setMenuTanaman(menuTanaman === t.id ? null : t.id)} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-300 hover:text-gray-500"><MoreVertical size={14} /></button>
                                {menuTanaman === t.id && (
                                  <div className="absolute right-0 top-7 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 w-40">
                                    <button onClick={() => { setDetailTanaman({ tanaman: t, lahanNama: lahan.namaLahan }); setMenuTanaman(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Eye size={14} className="text-blue-500" /> Detail</button>
                                    <button onClick={() => { setEditTanamanData(t); setMenuTanaman(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Pencil size={14} className="text-amber-500" /> Edit</button>
                                    {(() => {
                                      const isDraftOrActive = (statusText === 'Ditanam' || statusText === 'Pemeliharaan' || statusText === 'Menunggu Verifikasi');
                                      if (!isDraftOrActive) return null;

                                      const tglTanam = new Date(t.tanggalTanam);
                                      const tglTanamDate = new Date(tglTanam.getFullYear(), tglTanam.getMonth(), tglTanam.getDate());
                                      const today = new Date();
                                      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                      
                                      const diffTime = todayDate.getTime() - tglTanamDate.getTime();
                                      const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                      const canCancel = diffDays <= 2;

                                      if (canCancel) {
                                        return (
                                          <button onClick={() => { setBatalTanaman(t); setMenuTanaman(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                            <X size={14} /> Batalkan Tanam
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
                                    <button onClick={() => { setOpenLogbook(t); setMenuTanaman(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                                      <BookOpen size={14} /> Logbook Tanam
                                    </button>
                                    <button onClick={() => { setHapusTanaman(t); setMenuTanaman(null); }} className="w-full px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Hapus</button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg bg-gray-50 w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100">{t.fotoTanaman}</span>
                                  <div>
                                    <p className="text-xs font-bold text-gray-800">{t.komoditasNama}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Periode: {blnTanam} - {blnPanen}</p>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                                  {statusText}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-3 mb-3">
                                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                                  <span>Progress Masa Tanam</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                  <div className={`${progressColor} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-[10px] bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Scale size={11} className="text-emerald-500" />
                                  <span className="font-bold">{t.estimasiHasilKg.toLocaleString()} kg</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 border-l pl-4 border-gray-200">
                                  <Clock size={11} className="text-emerald-500" />
                                  <span>{new Date(t.estimasiPanen).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              </div>

                              {/* Panel Status Tanaman: Selesai Dipanen ATAU Standby (Idle) */}
                              {sudahDiajukan || t.statusVerifikasi === 'selesai_panen' ? (
                                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                      <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide">
                                        ✅ Status: Selesai Dipanen & Diserahkan
                                      </span>
                                    </div>
                                    <span className="text-[9px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-md">
                                      {t.estimasiHasilKg.toLocaleString()} kg
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                                    Hasil panen tanaman ini telah diserahkan untuk distribusi BUMD. Silakan lacak jadwal penimbangan, pickup & pembayaran di menu <strong>Jual Panen / Pesanan Gudang</strong>.
                                  </p>
                                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                                    <button
                                      onClick={() => navigate('/petani/jual-panen')}
                                      className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                                    >
                                      <FileText size={12} /> Lacak Status & Tracking Penjualan →
                                    </button>
                                  </div>
                                </div>
                              ) : statusText === 'Siap Panen' && t.statusVerifikasi === 'approved' ? (
                                <div className="mt-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                                  {/* Header Status Idle */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                                      <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wide">
                                        🌾 Status: Standby (Idle) — Siap Panen
                                      </span>
                                    </div>
                                    <span className="text-[9px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-md">
                                      Est. {t.estimasiHasilKg.toLocaleString()} kg
                                    </span>
                                  </div>

                                  <p className="text-[10px] text-amber-900/90 leading-relaxed font-medium">
                                    Sayur telah matang/dipercepat. Hasil tanam berada dalam mode <strong className="text-amber-950 font-bold">Standby (Idle)</strong>. Silakan pilih opsi saluran distribusi Anda:
                                  </p>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                    {/* Opsi 1: Menjual Mandiri */}
                                    <button
                                      onClick={() => navigate('/petani/jual-panen/form', { state: { tanamanId: t.id } })}
                                      className="py-2.5 px-3 bg-white hover:bg-emerald-50/80 border border-emerald-500/80 text-emerald-800 rounded-xl font-bold text-[10px] flex items-center justify-between shadow-sm active:scale-95 transition-all text-left group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <ShoppingCart size={15} className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                                        <div>
                                          <span className="block font-bold leading-tight text-gray-900">1. Jual Mandiri</span>
                                          <span className="text-[8px] font-medium text-emerald-700">Pengajuan Panen BUMD</span>
                                        </div>
                                      </div>
                                    </button>

                                    {/* Opsi 2: Memenuhi Pesanan Gudang (PO) */}
                                    <button
                                      onClick={() => navigate('/petani/pesanan-gudang')}
                                      className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-[10px] flex items-center justify-between shadow-md active:scale-95 transition-all text-left group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <PackageCheck size={15} className="text-emerald-200 shrink-0 group-hover:scale-110 transition-transform" />
                                        <div>
                                          <span className="block font-bold leading-tight">2. Pesanan Gudang</span>
                                          <span className="text-[8px] font-normal text-emerald-100">Penuhi Purchase Order</span>
                                        </div>
                                      </div>
                                    </button>
                                  </div>

                                  {/* Footer Catat Panen Logbook */}
                                  <div className="pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[9px] text-amber-800">
                                    <span>Logbook Tanam</span>
                                    <button onClick={() => openPanenModal(t)} className="font-bold flex items-center gap-1 hover:underline">
                                      <CheckCircle2 size={12} /> Catat Hasil Panen Lahan
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              {/* Tombol Batalkan Tanam / Info Menunggu Panen & Logbook */}
                              {(() => {
                                const isDraftOrActive = (statusText === 'Ditanam' || statusText === 'Pemeliharaan' || statusText === 'Menunggu Verifikasi');
                                if (!isDraftOrActive) return null;

                                const tglTanam = new Date(t.tanggalTanam);
                                const tglTanamDate = new Date(tglTanam.getFullYear(), tglTanam.getMonth(), tglTanam.getDate());
                                const today = new Date();
                                const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                
                                const diffTime = todayDate.getTime() - tglTanamDate.getTime();
                                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                const canCancel = diffDays <= 2;

                                return (
                                  <div className="mt-3 space-y-2">
                                    {canCancel ? (
                                      <button
                                        onClick={() => setBatalTanaman(t)}
                                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all border border-red-200"
                                      >
                                        <X size={12} /> Batalkan Tanam
                                      </button>
                                    ) : (
                                      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 flex items-start gap-2">
                                        <Clock size={12} className="text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-[10px] text-amber-800 leading-normal font-medium">
                                          <span className="font-bold">Sedang Menunggu Panen</span>. Masa pembatalan (2 hari) telah berakhir dan penanaman telah disetujui.
                                        </div>
                                      </div>
                                    )}

                                     <button
                                       onClick={() => handleQuickSiapPanen(t)}
                                       className="w-full py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                                     >
                                       <Zap size={12} className="text-yellow-200" />
                                       <span>Otomatis Siap Panen (Mode Demo)</span>
                                     </button>

                                     <button
                                       onClick={() => setOpenLogbook(t)}
                                       className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all border border-emerald-100"
                                     >
                                       <BookOpen size={12} /> Logbook & Catatan
                                     </button>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Belum ada jadwal pola tanam.</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Jadwalkan komoditas untuk menjaga panen rutin Anda.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL CATAT PANEN */}
      {isModalOpen && selectedTanaman && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Catat Hasil Panen</h3>
                <p className="text-[11px] text-gray-500">Kelola data panen untuk {selectedTanaman.komoditasNama}</p>
              </div>
              <button onClick={closePanenModal} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCatatPanenSubmit} className="p-5 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedTanaman.fotoTanaman}</span>
                  <div>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Estimasi Awal</p>
                    <p className="text-sm font-bold text-emerald-800">{selectedTanaman.estimasiHasilKg.toLocaleString()} Kg</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Tanggal Panen Aktual</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formPanen.tanggalPanen}
                  onChange={e => setFormPanen({ ...formPanen, tanggalPanen: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Hasil Panen Aktual (Kg)</label>
                <input
                  required
                  type="number"
                  placeholder="Jumlah panen riil"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formPanen.hasilPanen}
                  onChange={e => setFormPanen({ ...formPanen, hasilPanen: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Keterangan Panen</label>
                <textarea
                  rows={3}
                  placeholder="Kondisi panen, cuaca, serangan hama, dll"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  value={formPanen.keterangan}
                  onChange={e => setFormPanen({ ...formPanen, keterangan: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                  Simpan Data Panen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LAHAN */}
      {detailLahan && (
        <DetailLahanModal
          lahan={detailLahan}
          tanamanCount={tanamanSaya.filter(t => t.lahanId === detailLahan.id).length}
          onClose={() => setDetailLahan(null)}
        />
      )}

      {/* MODAL EDIT LAHAN */}
      {editLahanData && (
        <EditLahanModal
          lahan={editLahanData}
          onClose={() => setEditLahanData(null)}
          onSave={() => { setEditLahanData(null); showToast('Data Lahan Diperbarui!'); }}
        />
      )}

      {/* MODAL HAPUS LAHAN */}
      {hapusLahan && (
        <DeleteConfirmModal
          title="Hapus Lahan?"
          message={`Lahan "${hapusLahan.namaLahan}" dan seluruh data tanaman di dalamnya akan dihapus secara permanen.`}
          onCancel={() => setHapusLahan(null)}
          onConfirm={handleHapusLahan}
        />
      )}

      {/* MODAL DETAIL TANAMAN */}
      {detailTanaman && (
        <DetailTanamanModal
          tanaman={detailTanaman.tanaman}
          lahanNama={detailTanaman.lahanNama}
          onClose={() => setDetailTanaman(null)}
        />
      )}

      {/* MODAL EDIT TANAMAN */}
      {editTanamanData && (
        <EditTanamanModal
          tanaman={editTanamanData}
          onClose={() => setEditTanamanData(null)}
          onSave={() => { setEditTanamanData(null); showToast('Data Tanaman Diperbarui!'); }}
        />
      )}

      {/* MODAL HAPUS TANAMAN */}
      {hapusTanaman && (
        <DeleteConfirmModal
          title="Hapus Tanaman?"
          message={`Data tanaman "${hapusTanaman.komoditasNama}" akan dihapus dari monitoring tanam.`}
          onCancel={() => setHapusTanaman(null)}
          onConfirm={handleHapusTanaman}
        />
      )}

      {/* MODAL BATAL TANAMAN */}
      {batalTanaman && (
        <DeleteConfirmModal
          title="Batalkan Tanam?"
          message={`Apakah Anda yakin ingin membatalkan proses tanam untuk tanaman "${batalTanaman.komoditasNama}"? Seluruh data terkait tanaman ini akan dihapus dari sistem.`}
          onCancel={() => setBatalTanaman(null)}
          onConfirm={handleBatalTanaman}
        />
      )}

      {/* MODAL LOGBOOK TANAMAN */}
      {openLogbook && (
        <LogbookModal
          tanaman={openLogbook}
          onClose={() => setOpenLogbook(null)}
          onSave={() => showToast('Logbook Tanaman Diperbarui!')}
        />
      )}
    </div>
  );
};

export default DataLahanPage;
