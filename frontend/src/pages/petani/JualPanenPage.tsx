// =====================================================
// JUAL PANEN - PETANI (REDESIGN — Supply Intelligence)
// =====================================================

import React, { useState } from 'react';
import {
  ArrowLeft, Plus, CheckCircle2, CircleDashed, Calendar,
  Wallet, ChevronRight, Phone,
  // Sprout,
  MapPin, Truck, MessageCircle, FileText, Clock,
  AlertCircle, X, Camera, Banknote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatTanggal, formatRupiah } from '../../utils/formatters';
import { formatPOCode } from '../../utils/kode';
import { getKomoditasImageMap } from '../../utils/cropHelpers';

type FilterType = 'semua' | 'po_gudang' | 'mandiri' | 'aktif' | 'selesai' | 'ditolak';

const JualPanenPage: React.FC = () => {
  const {
    pengajuanJual,
    tenderPetani: myTenderPetani,
    tender: tendersList,
    pembayaran,
    pickup,
    komoditas: listKomoditas,
    qualityControl,
    currentUser,
    refreshData
  } = useData();
  const navigate = useNavigate();
  const petaniId = currentUser?.id || '';
  const [filter, setFilter] = useState<FilterType>('semua');
  const [showBukti, setShowBukti] = useState<string | null>(null);
  const [pembayaranForBukti, setPembayaranForBukti] = useState<any>(null);

  React.useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // === DATA SYNCHRONIZATION ===
  // Auto-combine pengajuanJual with PO Allocations from TenderPetani so data is 100% unified!
  const poAllocationsAsPJ = (myTenderPetani || [])
    .filter(tp => {
      if (!currentUser) return false;
      const belongsToMe = tp.petaniId === currentUser.id || (tp.petaniNama && currentUser.nama && tp.petaniNama.toLowerCase().trim() === currentUser.nama.toLowerCase().trim());
      if (!belongsToMe) return false;

      const tenderInfo = (tendersList || []).find(t => t.id === tp.tenderId);
      const kNama = tenderInfo?.komoditasNama || 'Sayuran Organik';
      const cleanPOCode = formatPOCode(tp.tenderId.replace('TDR_', ''), kNama);

      const existing = pengajuanJual.find(pj =>
        (pj.petaniId === petaniId || pj.petaniNama === currentUser?.nama) &&
        (pj.catatanAdmin?.includes(cleanPOCode) || pj.catatanPetani?.includes(cleanPOCode) || (pj.tipePenjualan === 'PO_GUDANG' && pj.komoditasNama.toLowerCase() === kNama.toLowerCase()))
      );
      return !existing;
    })
    .map(tp => {
      const tenderInfo = (tendersList || []).find(t => t.id === tp.tenderId);
      const kNama = tenderInfo?.komoditasNama || 'Sayuran Organik';
      const cleanPOCode = formatPOCode(tp.tenderId.replace('TDR_', ''), kNama);

      const unitPrice = (tenderInfo?.hargaPerKg && tenderInfo.hargaPerKg > 2000)
        ? tenderInfo.hargaPerKg
        : (kNama.toLowerCase().includes('buncis') ? 15000 : kNama.toLowerCase().includes('jagung') ? 8000 : 12000);

      const statusMap: Record<string, string> = {
        'pending': 'pending',
        'approved': 'approved',
        'survey': 'survey',
        'dikirim': 'proses_timbang',
        'proses_timbang': 'proses_timbang',
        'selesai': 'selesai'
      };

      return {
        id: `PJB_PO_${tp.id}`,
        petaniId: tp.petaniId || petaniId,
        petaniNama: tp.petaniNama || currentUser?.nama || 'Petani',
        komoditasId: tenderInfo?.komoditasId || 'KMD001',
        komoditasNama: kNama,
        beratEstimasiKg: tp.kesanggupanKg || 100,
        tanggalSiapPickup: tp.batasWaktu || new Date().toISOString().split('T')[0],
        fotoPanen: '📦',
        status: statusMap[tp.statusApproval] || (tp.statusApproval === 'dikirim' ? 'proses_timbang' : 'pending'),
        tanggalPengajuan: tp.tanggalDaftar || new Date().toISOString(),
        catatanAdmin: `Pemenuhan PO Gudang (${cleanPOCode})`,
        metodePembayaran: 'Cash',
        tanamanAktifId: null,
        lahanId: null,
        lahanNama: 'Lahan Petani',
        hargaAcuanKg: unitPrice,
        estimasiPendapatan: (tp.kesanggupanKg || 100) * unitPrice,
        catatanPetani: `[PEMENUHAN PO GUDANG] Order ID: ${cleanPOCode}`,
        gudangTujuanId: null,
        gudangTujuanNama: 'Gudang Cianjur',
        tipePenjualan: 'PO_GUDANG'
      } as any;
    });

  const pengajuanSaya = [
    ...pengajuanJual.filter(jp => jp.petaniId === petaniId || (jp.petaniNama && currentUser?.nama && jp.petaniNama.toLowerCase().trim() === currentUser.nama.toLowerCase().trim())),
    ...poAllocationsAsPJ
  ];

  // Filter pengajuan
  const filteredPengajuan = pengajuanSaya.filter(p => {
    if (!p) return false;
    if (filter === 'po_gudang') return p.tipePenjualan === 'PO_GUDANG' || p.catatanAdmin?.includes('PO Gudang') || p.catatanPetani?.includes('PO GUDANG');
    if (filter === 'mandiri') return p.tipePenjualan !== 'PO_GUDANG' && !p.catatanAdmin?.includes('PO Gudang') && !p.catatanPetani?.includes('PO GUDANG');
    if (filter === 'aktif') return !['selesai', 'rejected'].includes(p.status);
    if (filter === 'selesai') return p.status === 'selesai';
    if (filter === 'ditolak') return p.status === 'rejected';
    return true;
  });

  // Helper: status label bahasa manusia
  const getStatusLabel = (status: string, beratEstimasiKg: number, hasQC: boolean): string => {
    if (status === 'proses_timbang' && hasQC) {
      return '💸 Menunggu Pembayaran Admin';
    }
    const labels: Record<string, string> = {
      'pending': '⏳ Menunggu Review',
      'approved': '✅ Disetujui — Siap Kirim',
      'survey': '🔎 Survei Lapangan',
      'dikirim': '📦 Dikirim ke Gudang (Menunggu Timbang)',
      'pickup_dijadwalkan': beratEstimasiKg < 300 ? '📦 Silakan Antar ke Gudang' : '🚗 Pickup Terjadwal',
      'proses_timbang': '⚖️ Sedang Ditimbang Gudang',
      'selesai': '💰 Selesai & Dibayar',
      'rejected': '❌ Ditolak',
    };
    return labels[status] || status;
  };

  // Helper: tracker step status
  const getStepStatus = (status: string, stepIndex: number, hasQC: boolean) => {
    if (status === 'rejected') return 'upcoming';

    if (stepIndex === 0) {
      return status === 'pending' ? 'current' : 'completed';
    }
    if (stepIndex === 1) {
      if (status === 'pending') return 'upcoming';
      return status === 'approved' || status === 'survey' ? 'current' : 'completed';
    }
    if (stepIndex === 2) {
      if (['pending', 'approved', 'survey'].includes(status)) return 'upcoming';
      if (status === 'proses_timbang' && hasQC) return 'completed';
      return status === 'pickup_dijadwalkan' || status === 'proses_timbang' || status === 'dikirim' ? 'current' : 'completed';
    }
    if (stepIndex === 3) {
      if (status === 'selesai') return 'completed';
      if (status === 'proses_timbang' && hasQC) return 'current';
      return 'upcoming';
    }
    return 'upcoming';
  };

  // Helper: get pickup data for a pengajuan
  const getPickupData = (pengajuanObj: any) => {
    if (!pengajuanObj) return undefined;
    const direct = pickup.find(p => p.pengajuanJualId === pengajuanObj.id);
    if (direct) return direct;
    return pickup.find(p => 
      (p.petaniId === pengajuanObj.petaniId || (p.petaniNama && pengajuanObj.petaniNama && p.petaniNama.toLowerCase().trim() === pengajuanObj.petaniNama.toLowerCase().trim())) &&
      (p.komoditasNama.toLowerCase().includes(pengajuanObj.komoditasNama.toLowerCase()) || pengajuanObj.komoditasNama.toLowerCase().includes(p.komoditasNama.toLowerCase()))
    );
  };

  // Helper: get pembayaran for a pickup or pengajuan
  const getPembayaranData = (pickupObj: any, pengajuanObj: any) => {
    if (pickupObj) {
      const direct = pembayaran.find(p => p.pickupId === pickupObj.id);
      if (direct) return direct;
    }
    if (pengajuanObj) {
      return pembayaran.find(p => 
        (p.petaniId === pengajuanObj.petaniId || (p.petaniNama && pengajuanObj.petaniNama && p.petaniNama.toLowerCase().trim() === pengajuanObj.petaniNama.toLowerCase().trim())) &&
        (p.komoditasNama.toLowerCase().includes(pengajuanObj.komoditasNama.toLowerCase()) || pengajuanObj.komoditasNama.toLowerCase().includes(p.komoditasNama.toLowerCase()))
      );
    }
    return undefined;
  };

  // === COMPONENTS ===
  const TrackerStep = ({ label, status, isLast }: { label: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }) => (
    <div className={`flex flex-col items-center flex-1 ${!isLast ? 'relative' : ''}`}>
      {!isLast && (
        <div className={`absolute top-3 left-1/2 w-full h-0.5 ${status === 'completed' ? 'bg-primary-600' : 'bg-gray-200'}`} />
      )}
      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 
        ${status === 'completed' ? 'border-primary-600 text-primary-600' :
          status === 'current' ? 'border-primary-600 bg-primary-600 text-white' :
            'border-gray-300 text-gray-300'}`}>
        {status === 'completed' ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}
      </div>
      <p className={`text-[9px] font-medium mt-1.5 text-center leading-tight ${status !== 'upcoming' ? 'text-primary-700' : 'text-gray-400'}`}>
        {label}
      </p>
    </div>
  );

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'semua', label: 'Semua', count: pengajuanSaya.filter(Boolean).length },
    { key: 'po_gudang', label: '📦 PO Gudang', count: pengajuanSaya.filter(p => p && (p.tipePenjualan === 'PO_GUDANG' || p.catatanAdmin?.includes('PO Gudang') || p.catatanPetani?.includes('PO GUDANG'))).length },
    { key: 'mandiri', label: '🧑‍🌾 Mandiri', count: pengajuanSaya.filter(p => p && (p.tipePenjualan !== 'PO_GUDANG' && !p.catatanAdmin?.includes('PO Gudang') && !p.catatanPetani?.includes('PO GUDANG'))).length },
    { key: 'aktif', label: 'Aktif', count: pengajuanSaya.filter(p => p && !['selesai', 'rejected'].includes(p.status)).length },
    { key: 'selesai', label: 'Selesai', count: pengajuanSaya.filter(p => p && p.status === 'selesai').length },
    { key: 'ditolak', label: 'Ditolak', count: pengajuanSaya.filter(p => p && p.status === 'rejected').length },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-b from-primary-700 to-primary-600 text-white px-5 pt-12 pb-8 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/petani/dashboard')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all active:scale-95">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">Jual Panen</h1>
              <p className="text-primary-100 text-xs">Kelola penjualan hasil panen Anda</p>
            </div>
          </div>
          {currentUser && (
            <div className="text-right">
              <span className="text-[9px] text-primary-200 block uppercase font-bold tracking-wider">Petani</span>
              <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full">{currentUser.nama}</span>
            </div>
          )}
        </div>

        {/* Ringkasan Keuangan */}
        {/* <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary-100 text-xs font-medium flex items-center gap-1.5"><Wallet size={14} /> Total Pendapatan</p>
            <div className="flex items-center gap-2 text-[10px]">
              {totalSelesai > 0 && <span className="bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-full font-bold">✅ {totalSelesai} lunas</span>}
              {totalPending > 0 && <span className="bg-amber-400/20 text-amber-100 px-2 py-0.5 rounded-full font-bold">⏳ {totalPending} proses</span>}
            </div>
          </div>
          <p className="text-2xl font-bold">{formatRupiah(totalDibayar)}</p>
        </div> */}

        {/* CTA Selalu Visible */}
        <button
          onClick={() => navigate('/petani/jual-panen/form')}
          className="w-full mt-4 py-3.5 bg-white text-primary-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} /> Ajukan Jual Panen Baru
        </button>
      </div>

      <div className="px-5 mt-3 space-y-4">
        {/* ── TICKER HARGA BUMD TERBARU ── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              📢 Acuan Harga BUMD Agro Jabar Terbaru
            </span>
            <span className="text-[9px] text-emerald-600 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
              Live Sync
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {(listKomoditas || []).map(k => {
              const imgData = getKomoditasImageMap(k.nama || k.gambar);
              return (
                <div key={k.id} className="bg-white rounded-xl p-2 border border-emerald-100/80 shadow-2xs">
                  <p className="text-[10px] font-bold text-gray-700 flex items-center justify-center gap-1.5 truncate">
                    <img src={imgData.url} alt={k.nama} className="w-5 h-5 rounded-md object-cover shrink-0 border border-gray-100" />
                    <span className="truncate">{k.nama}</span>
                  </p>
                  <p className="text-xs font-black text-emerald-700 mt-0.5">
                    {formatRupiah(k.hargaSaatIni || 12000)}<span className="text-[9px] font-normal text-gray-400">/kg</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="flex gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${filter === f.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-primary-200'
                }`}
            >
              {f.label} {f.count > 0 && <span className="ml-1 opacity-70">({f.count})</span>}
            </button>
          ))}
        </div>

        {/* ── PENGAJUAN LIST ── */}
        {filteredPengajuan.length > 0 ? (
          <div className="space-y-4">
            {filteredPengajuan.map(pj => {
              const pickup = getPickupData(pj);
              const pembayaran = getPembayaranData(pickup, pj);
              const hasQC = pickup ? qualityControl.some(qc => qc.pickupId === pickup.id) : false;
              const komoditas = listKomoditas.find(k => k.id === pj.komoditasId || k.nama?.toLowerCase() === pj.komoditasNama?.toLowerCase());

              const imgData = getKomoditasImageMap(pj.fotoPanen && pj.fotoPanen !== '🌾' && pj.fotoPanen !== '📦' ? pj.fotoPanen : (pj.komoditasNama || komoditas?.nama || komoditas?.gambar));

              // Synchronize with latest updated commodity price from database
              const hargaTerbaru = (komoditas?.hargaSaatIni && komoditas.hargaSaatIni > 2000)
                ? komoditas.hargaSaatIni
                : ((pj.hargaAcuanKg && pj.hargaAcuanKg > 2000)
                  ? pj.hargaAcuanKg
                  : (pj.komoditasNama?.toLowerCase().includes('buncis') ? 15000 : pj.komoditasNama?.toLowerCase().includes('jagung') ? 8000 : 12000));

              const hargaUnit = hargaTerbaru;
              const estimasi = (pj.beratEstimasiKg || 0) * hargaUnit;

              return (
                <div
                  key={pj.id}
                  className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-gray-100 flex items-center justify-center">
                          <img src={imgData.url} alt={pj.komoditasNama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[15px] text-gray-800">{pj.komoditasNama}</h3>
                            {pj.tipePenjualan === 'PO_GUDANG' || pj.id.includes('_PO_') || pj.catatanPetani?.includes('PO GUDANG') ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-extrabold rounded-full border border-blue-200">
                                📦 Pemenuhan PO Gudang
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded-full border border-emerald-200">
                                🧑‍🌾 Penjualan Mandiri
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500">{(pj.beratEstimasiKg || 0).toLocaleString()} kg</p>
                          {pj.lahanNama && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={9} /> {pj.lahanNama}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={pj.status} size="sm" />
                    </div>

                    {/* Status Label Bahasa Manusia */}
                    <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                      <p className="text-xs text-gray-600 font-medium">{getStatusLabel(pj.status, pj.beratEstimasiKg || 0, hasQC)}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Diajukan</p>
                        <p className="font-semibold text-[11px] text-gray-700 mt-0.5">
                          {pj.tanggalPengajuan ? formatTanggal(pj.tanggalPengajuan).split(' ').slice(0, 2).join(' ') : '-'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pickup</p>
                        <p className="font-semibold text-[11px] text-gray-700 mt-0.5">
                          {pj.tanggalSiapPickup ? formatTanggal(pj.tanggalSiapPickup).split(' ').slice(0, 2).join(' ') : '-'}
                        </p>
                      </div>
                      <div className="bg-primary-50 rounded-xl p-2.5">
                        <p className="text-[9px] text-primary-500 font-bold uppercase tracking-wider">Est. Harga</p>
                        <p className="font-bold text-[11px] text-primary-700 mt-0.5">{formatRupiah(hargaUnit)}/kg</p>
                      </div>
                    </div>

                    {/* Estimasi Pendapatan */}
                    {estimasi > 0 && pj.status !== 'rejected' && (
                      <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Wallet size={12} /> Estimasi Pendapatan
                          </p>
                          <p className="font-bold text-emerald-700">{formatRupiah(estimasi)}</p>
                        </div>
                        <p className="text-[9px] text-emerald-500 mt-1 italic">*Harga final ditentukan setelah timbang fisik</p>
                      </div>
                    )}
                  </div>

                  {/* Tracker Timeline — Active only */}
                  {!['selesai', 'rejected'].includes(pj.status) && (
                    <div className="px-4 pb-3">
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Tracking Penjualan</p>
                        <div className="flex justify-between w-full px-1">
                          <TrackerStep label="Pengajuan" status={getStepStatus(pj.status, 0, hasQC)} />
                          <TrackerStep label="Disetujui" status={getStepStatus(pj.status, 1, hasQC)} />
                          <TrackerStep label={(pj.beratEstimasiKg || 0) < 300 ? "Antar Mandiri" : "Pickup"} status={getStepStatus(pj.status, 2, hasQC)} />
                          <TrackerStep label={pj.status === 'proses_timbang' && hasQC ? "Pembayaran" : "Selesai"} status={getStepStatus(pj.status, 3, hasQC)} isLast />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Driver — when pickup scheduled */}
                  {pickup && (
                    <div className="px-4 pb-3">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Truck size={12} /> Info Pickup & Pengiriman
                        </p>
                        <div className="space-y-1.5 text-xs text-gray-700">
                          <p className="flex items-center gap-2">
                            <Calendar size={12} className="text-blue-500" />
                            <span className="font-medium">{pickup.tanggalPickup ? formatTanggal(pickup.tanggalPickup) : '-'}, {pickup.waktuBerangkat || '-'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Truck size={12} className="text-blue-500" />
                            <span>{pickup.armada || 'Armada'} — {pickup.platNomor || '-'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            <span className="font-semibold">{pickup.driverNama || 'Driver Logistik'}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {pickup.driverNoHp && pickup.driverNoHp !== '-' && (
                            <a
                              href={`tel:${pickup.driverNoHp}`}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                            >
                              <Phone size={12} /> Telepon
                            </a>
                          )}
                          {pickup.driverNoHp && pickup.driverNoHp !== '-' && (
                            <a
                              href={`https://wa.me/${pickup.driverNoHp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                            >
                              <MessageCircle size={12} /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pembayaran Info */}
                  {pembayaran && (
                    <div className="px-4 pb-3">
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">💰 Pembayaran</p>
                          <StatusBadge status={pembayaran.status} size="sm" />
                        </div>
                        {pembayaran.totalBayar > 0 && (
                          <p className="text-xl font-bold text-emerald-700 mb-1">{formatRupiah(pembayaran.totalBayar)}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span>{pembayaran.nomorInvoice}</span>
                          <span>{pembayaran.metodeBayar === 'TDF' ? 'Transfer Bank' : 'Tunai'}</span>
                        </div>
                        {pembayaran.status === 'dibayar' && (
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
                              <FileText size={12} /> Invoice
                            </button>
                            <button
                              onClick={() => {
                                setPembayaranForBukti(pembayaran);
                                setShowBukti(pembayaran.metodeBayar === 'TDF'
                                  ? (pembayaran.buktiTransfer || 'TRANSFER')
                                  : ((pembayaran as any).buktiTunai || 'TUNAI'));
                              }}
                              className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                            >
                              {pembayaran.metodeBayar === 'TDF'
                                ? <><Banknote size={12} /> Bukti Transfer</>
                                : <><Camera size={12} /> Bukti Tunai</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Catatan Admin */}
                  {pj.catatanAdmin && (
                    <div className="px-4 pb-3">
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[10px] text-amber-600 uppercase tracking-wider mb-0.5">Catatan Admin</p>
                          <p>{pj.catatanAdmin}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => navigate(`/petani/jual-panen/${pj.id}`)}
                      className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      Lihat Detail Lengkap <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 mt-2">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-200" />
            </div>
            <h3 className="font-bold text-gray-800">Belum ada pengajuan</h3>
            <p className="text-xs text-gray-400 mt-1">
              {filter === 'ditolak'
                ? 'Tidak ada pengajuan yang ditolak'
                : filter === 'selesai'
                  ? 'Belum ada transaksi selesai'
                  : 'Yuk ajukan penjualan panen pertama Anda! 🌱'}
            </p>
            {filter !== 'semua' && (
              <button onClick={() => setFilter('semua')} className="mt-3 text-xs text-primary-600 font-bold">
                Lihat Semua Pengajuan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bukti Pembayaran Modal — Petani */}
      {showBukti && pembayaranForBukti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowBukti(null); setPembayaranForBukti(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`px-5 py-4 flex items-center justify-between ${
              pembayaranForBukti.metodeBayar === 'TDF' ? 'bg-blue-600' : 'bg-orange-500'
            } text-white`}>
              <div className="flex items-center gap-2">
                {pembayaranForBukti.metodeBayar === 'TDF'
                  ? <Banknote size={18} />
                  : <Camera size={18} />}
                <h3 className="font-bold text-base">
                  {pembayaranForBukti.metodeBayar === 'TDF' ? 'Bukti Transfer Bank' : 'Bukti Pembayaran Tunai'}
                </h3>
              </div>
              <button onClick={() => { setShowBukti(null); setPembayaranForBukti(null); }}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {pembayaranForBukti.metodeBayar === 'TDF' ? (
                /* === BUKTI TRANSFER === */
                pembayaranForBukti.buktiTransfer?.startsWith('data:image') ? (
                  <div className="rounded-xl overflow-hidden border border-blue-100">
                    <img src={pembayaranForBukti.buktiTransfer} alt="Bukti Transfer" className="w-full max-h-64 object-contain bg-gray-50" />
                    <div className="p-3 bg-blue-50 text-center">
                      <p className="text-xs text-blue-700 font-bold">Bukti Transfer Terverifikasi ✓</p>
                      <p className="text-lg font-bold text-gray-800">{formatRupiah(pembayaranForBukti.totalBayar || 0)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center space-y-1.5">
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Transfer Berhasil ✓</p>
                    <p className="text-2xl font-bold text-gray-800">{formatRupiah(pembayaranForBukti.totalBayar || 0)}</p>
                    <div className="text-xs text-gray-500 text-left space-y-1 border-t pt-3 mt-3">
                      <p><span className="text-gray-400">Pengirim:</span> BUMD AGRO JABAR</p>
                      <p><span className="text-gray-400">Penerima:</span> {currentUser?.nama || 'Petani'}</p>
                      <p><span className="text-gray-400">Bank:</span> Bank BJB</p>
                      <p><span className="text-gray-400">No. Referensi:</span> {pembayaranForBukti.buktiTransfer || showBukti}</p>
                    </div>
                  </div>
                )
              ) : (
                /* === BUKTI TUNAI === */
                (pembayaranForBukti as any).buktiTunai ? (
                  <div className="rounded-xl overflow-hidden border border-orange-100">
                    <img src={(pembayaranForBukti as any).buktiTunai} alt="Bukti Tunai" className="w-full max-h-64 object-contain bg-gray-50" />
                    <div className="p-3 bg-orange-50 text-center">
                      <p className="text-xs text-orange-700 font-bold">Pembayaran Tunai Terverifikasi ✓</p>
                      <p className="text-lg font-bold text-gray-800">{formatRupiah(pembayaranForBukti.totalBayar || 0)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center space-y-1.5">
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Pembayaran Tunai Lunas ✓</p>
                    <p className="text-2xl font-bold text-gray-800">{formatRupiah(pembayaranForBukti.totalBayar || 0)}</p>
                    <p className="text-xs text-gray-500 mt-2">Uang tunai telah diterima dan diverifikasi di lokasi oleh admin Agro.</p>
                  </div>
                )
              )}

              {/* Invoice info */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Nomor Invoice</span>
                <span className="font-mono text-xs text-gray-700 font-medium">{pembayaranForBukti.nomorInvoice}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JualPanenPage;
