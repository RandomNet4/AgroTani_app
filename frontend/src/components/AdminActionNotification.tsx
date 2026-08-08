// =====================================================
// ADMIN ACTION NOTIFICATIONS - Real-time Interactive
// =====================================================
// Sistem notifikasi popup interaktif yang mendeteksi
// aksi yang perlu segera dilakukan admin secara otomatis
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ChevronRight, CheckCircle2, Clock,
  Sprout, Package, CreditCard, Truck, Users, ClipboardList,
  ShoppingCart, BellRing
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface ActionItem {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  route: string;
  color: {
    bg: string;
    border: string;
    icon: string;
    badge: string;
    badgeText: string;
    btn: string;
  };
}

// ── Komponen: Toast popup tunggal ──
const ActionToast: React.FC<{
  item: ActionItem;
  onClose: () => void;
  onAction: (route: string) => void;
  index: number;
}> = ({ item, onClose, onAction, index }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`w-full max-w-sm bg-white rounded-2xl shadow-2xl border ${item.color.border} overflow-hidden animate-slide-in-right`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Progress bar */}
      <div className={`h-1 ${item.color.badge} animate-shrink-bar`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl ${item.color.bg} flex items-center justify-center shrink-0`}>
            <span className={item.color.icon}>{item.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.color.badge} ${item.color.badgeText}`}>
                {item.type === 'urgent' ? '🔴 SEGERA' : item.type === 'warning' ? '🟡 PERLU AKSI' : item.type === 'success' ? '🟢 SELESAI' : '🔵 INFO'}
              </span>
              {item.count > 1 && (
                <span className="text-[10px] font-bold text-gray-500">{item.count} item</span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{item.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onAction(item.route)}
          className={`mt-3 w-full py-2 ${item.color.btn} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] hover:opacity-90`}
        >
          Tangani Sekarang <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Komponen: Badge count di bell icon ──
export const AdminActionBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
      {count > 99 ? '99+' : count}
    </span>
  );
};

// ── Komponen Utama: Action Notification System ──
const AdminActionNotification: React.FC = () => {
  const navigate = useNavigate();
  const {
    pengajuanJual,
    tanamanAktif,
    petani,
    pembayaran,
    pickup,
    qualityControl,
    tenderPetani,
    purchaseOrders,
    lahan,
    refreshData,
  } = useData();

  const [toasts, setToasts] = useState<ActionItem[]>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const prevDataRef = useRef<string>('');

  // ── Generate action items dari data real-time ──
  const generateActionItems = useCallback((): ActionItem[] => {
    const items: ActionItem[] = [];

    // 1. Pengajuan jual panen yang pending (belum diapprove)
    const pjPending = (pengajuanJual || []).filter(p => p.status === 'pending');
    if (pjPending.length > 0) {
      items.push({
        id: `pj-pending-${pjPending.length}`,
        type: 'urgent',
        icon: <Package size={18} />,
        title: 'Pengajuan Jual Panen Baru',
        description: `${pjPending.length} pengajuan penjualan petani menunggu review dan persetujuan Anda.`,
        count: pjPending.length,
        route: '/admin/jual-panen',
        color: {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100',
          badgeText: 'text-red-700',
          btn: 'bg-red-600 hover:bg-red-700',
        },
      });
    }

    // 2. Pengajuan jual yang sudah QC, menunggu pembayaran
    const pjQCDone = (pembayaran || []).filter(p => p.status === 'menunggu');
    if (pjQCDone.length > 0) {
      items.push({
        id: `bayar-pending-${pjQCDone.length}`,
        type: 'urgent',
        icon: <CreditCard size={18} />,
        title: 'Pembayaran Petani Menunggu',
        description: `${pjQCDone.length} tagihan pembayaran hasil panen siap diproses. Upload bukti bayar.`,
        count: pjQCDone.length,
        route: '/admin/pembayaran',
        color: {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          icon: 'text-amber-600',
          badge: 'bg-amber-100',
          badgeText: 'text-amber-700',
          btn: 'bg-amber-600 hover:bg-amber-700',
        },
      });
    }

    // 3. Petani baru menunggu verifikasi akun
    const petaniBaru = (petani || []).filter(p => p.statusVerifikasi === 'pending');
    if (petaniBaru.length > 0) {
      items.push({
        id: `petani-pending-${petaniBaru.length}`,
        type: 'warning',
        icon: <Users size={18} />,
        title: 'Pendaftaran Petani Baru',
        description: `${petaniBaru.length} petani baru menunggu verifikasi identitas dan koneksi gudang.`,
        count: petaniBaru.length,
        route: '/admin/verifikasi-petani',
        color: {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100',
          badgeText: 'text-blue-700',
          btn: 'bg-blue-600 hover:bg-blue-700',
        },
      });
    }

    // 4. Pengajuan tanaman aktif yang perlu divalidasi
    const tanamanPending = (tanamanAktif || []).filter(t => t.statusVerifikasi === 'pending');
    if (tanamanPending.length > 0) {
      items.push({
        id: `tanaman-pending-${tanamanPending.length}`,
        type: 'warning',
        icon: <Sprout size={18} />,
        title: 'Pengajuan Tanam Perlu Validasi',
        description: `${tanamanPending.length} rencana tanam petani menunggu persetujuan admin.`,
        count: tanamanPending.length,
        route: '/admin/verifikasi-tanaman',
        color: {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          badge: 'bg-emerald-100',
          badgeText: 'text-emerald-700',
          btn: 'bg-emerald-600 hover:bg-emerald-700',
        },
      });
    }

    // 5. Pickup dijadwalkan tapi belum ada QC
    const pickupTanpaQC = (pickup || []).filter(pk => {
      const sudahQC = (qualityControl || []).some(qc => qc.pickupId === pk.id);
      return ['sudah_sampai', 'proses_timbang'].includes(pk.status) && !sudahQC;
    });
    if (pickupTanpaQC.length > 0) {
      items.push({
        id: `pickup-qc-${pickupTanpaQC.length}`,
        type: 'urgent',
        icon: <Truck size={18} />,
        title: 'Panen Tiba — QC Diperlukan',
        description: `${pickupTanpaQC.length} panen sudah sampai gudang, segera lakukan quality control & timbang.`,
        count: pickupTanpaQC.length,
        route: '/admin/quality-control',
        color: {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'text-purple-600',
          badge: 'bg-purple-100',
          badgeText: 'text-purple-700',
          btn: 'bg-purple-600 hover:bg-purple-700',
        },
      });
    }

    // 6. Pengajuan survey lahan yang pending
    const lahanSurvey = (lahan || []).filter(l => l.statusVerifikasi === 'pending');
    if (lahanSurvey.length > 0) {
      items.push({
        id: `lahan-pending-${lahanSurvey.length}`,
        type: 'info',
        icon: <ClipboardList size={18} />,
        title: 'Lahan Baru Perlu Verifikasi',
        description: `${lahanSurvey.length} lahan petani terdaftar baru dan menunggu verifikasi data.`,
        count: lahanSurvey.length,
        route: '/admin/data-lahan',
        color: {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          icon: 'text-teal-600',
          badge: 'bg-teal-100',
          badgeText: 'text-teal-700',
          btn: 'bg-teal-600 hover:bg-teal-700',
        },
      });
    }

    // 7. TenderPetani yang pending approval
    const tenderPetaniPending = (tenderPetani || []).filter(tp => tp.statusApproval === 'pending');
    if (tenderPetaniPending.length > 0) {
      items.push({
        id: `tender-petani-${tenderPetaniPending.length}`,
        type: 'warning',
        icon: <ShoppingCart size={18} />,
        title: 'Pendaftaran PO Menunggu',
        description: `${tenderPetaniPending.length} petani mendaftar pemenuhan PO gudang, butuh konfirmasi.`,
        count: tenderPetaniPending.length,
        route: '/admin/tender',
        color: {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          badge: 'bg-orange-100',
          badgeText: 'text-orange-700',
          btn: 'bg-orange-600 hover:bg-orange-700',
        },
      });
    }

    // 8. Pickup yang dijadwalkan hari ini
    const today = new Date().toISOString().split('T')[0];
    const pickupHariIni = (pickup || []).filter(pk =>
      pk.tanggalPickup && pk.tanggalPickup.startsWith(today) &&
      ['dijadwalkan', 'berangkat'].includes(pk.status)
    );
    if (pickupHariIni.length > 0) {
      items.push({
        id: `pickup-hari-ini-${pickupHariIni.length}`,
        type: 'info',
        icon: <Truck size={18} />,
        title: `Pickup Hari Ini (${pickupHariIni.length})`,
        description: `${pickupHariIni.length} jadwal pickup panen berlangsung hari ini. Pastikan driver siap.`,
        count: pickupHariIni.length,
        route: '/admin/pickup',
        color: {
          bg: 'bg-sky-50',
          border: 'border-sky-200',
          icon: 'text-sky-600',
          badge: 'bg-sky-100',
          badgeText: 'text-sky-700',
          btn: 'bg-sky-600 hover:bg-sky-700',
        },
      });
    }

    return items;
  }, [pengajuanJual, tanamanAktif, petani, pembayaran, pickup, qualityControl, tenderPetani, purchaseOrders, lahan]);

  // ── Cek data baru dan tampilkan toast ──
  useEffect(() => {
    const items = generateActionItems();
    if (items.length === 0) return;

    const dataKey = items.map(i => i.id).join('|');
    if (dataKey === prevDataRef.current) return;
    prevDataRef.current = dataKey;

    // Hanya tampilkan toast untuk item yang belum pernah ditampilkan
    const newItems = items.filter(item => !shownIds.has(item.id));
    if (newItems.length === 0) return;

    // Tandai sebagai sudah ditampilkan
    setShownIds(prev => {
      const updated = new Set(prev);
      newItems.forEach(i => updated.add(i.id));
      return updated;
    });

    // Tampilkan max 3 toast sekaligus (urgent first)
    const urgentFirst = [...newItems].sort((a, b) => {
      const order = { urgent: 0, warning: 1, info: 2, success: 3 };
      return order[a.type] - order[b.type];
    }).slice(0, 3);

    setToasts(prev => [...prev, ...urgentFirst]);
  }, [generateActionItems, shownIds]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAction = (route: string) => {
    setToasts([]);
    setIsPanelOpen(false);
    navigate(route);
  };

  const allItems = generateActionItems();
  const totalUrgent = allItems.filter(i => i.type === 'urgent').length;
  const totalActions = allItems.length;

  return (
    <>
      {/* ── Panel Summary Button (sidebar addition, dapat digunakan) ──  */}
      {totalActions > 0 && (
        <div
          className="fixed bottom-6 right-6 z-40 group"
          title={`${totalActions} aksi perlu ditangani`}
        >
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm text-white shadow-2xl transition-all active:scale-95 hover:scale-105 ${
              totalUrgent > 0
                ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-200'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-200'
            }`}
          >
            <BellRing size={18} className="animate-swing" />
            <span>{totalUrgent > 0 ? `${totalUrgent} Aksi Mendesak` : `${totalActions} Aksi Pending`}</span>
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-extrabold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow border border-red-200">
              {totalActions}
            </span>
          </button>
        </div>
      )}

      {/* ── Action Panel (full list) ── */}
      {isPanelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="fixed bottom-20 right-6 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing size={18} className="text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm">Aksi yang Diperlukan</h4>
                  <p className="text-[10px] text-slate-400">{totalActions} item butuh perhatian Anda</p>
                </div>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Items */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
              {allItems.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-gray-800">Semua beres!</p>
                  <p className="text-xs text-gray-400 mt-1">Tidak ada aksi yang perlu ditangani saat ini.</p>
                </div>
              ) : (
                allItems.map(item => (
                  <div key={item.id} className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${item.color.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${item.color.bg} flex items-center justify-center shrink-0`}>
                        <span className={item.color.icon}>{item.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${item.color.badge} ${item.color.badgeText}`}>
                            {item.type === 'urgent' ? 'SEGERA' : item.type === 'warning' ? 'PERLU AKSI' : 'INFO'}
                          </span>
                          {item.count > 1 && <span className="text-[10px] text-gray-400 font-bold">{item.count} item</span>}
                        </div>
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAction(item.route)}
                      className={`mt-2.5 w-full py-2 ${item.color.btn} text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all`}
                    >
                      Tangani <ChevronRight size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-3 bg-gray-50 text-center">
              <button
                onClick={() => { setIsPanelOpen(false); refreshData(); }}
                className="text-xs text-gray-500 font-medium hover:text-gray-700 transition-colors flex items-center gap-1 mx-auto"
              >
                <Clock size={11} /> Refresh data
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Toast Stack (pojok kanan atas) ── */}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '360px' }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} className="pointer-events-auto">
            <ActionToast
              item={toast}
              onClose={() => removeToast(toast.id)}
              onAction={handleAction}
              index={index}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminActionNotification;
