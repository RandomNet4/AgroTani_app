// =====================================================
// ADMIN LAYOUT - AGRO TANI DENGAN NOTIFIKASI
// =====================================================

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminActionNotification from './AdminActionNotification';
import { Bell, Check, AlertTriangle, ChevronRight, Package, CreditCard, Users, Sprout, Truck, ClipboardList, ShoppingCart } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatTanggal } from '../utils/formatters';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { notifikasi, readNotifikasi, refreshData, pengajuanJual, petani, tanamanAktif, pembayaran, pickup, qualityControl, tenderPetani, lahan } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'ACTIONS'>('ACTIONS');

  const unreadCount = notifikasi ? notifikasi.filter(n => !n.dibaca).length : 0;

  // Count pending actions for badge
  const actionItems = [
    { label: 'Pengajuan Jual Panen', count: (pengajuanJual || []).filter(p => p.status === 'pending').length, route: '/admin/jual-panen', icon: <Package size={14} />, color: 'text-red-600 bg-red-50 border-red-200', urgent: true },
    { label: 'Pembayaran Menunggu', count: (pembayaran || []).filter(p => p.status === 'menunggu').length, route: '/admin/pembayaran', icon: <CreditCard size={14} />, color: 'text-amber-600 bg-amber-50 border-amber-200', urgent: true },
    { label: 'Petani Baru', count: (petani || []).filter(p => p.statusVerifikasi === 'pending').length, route: '/admin/verifikasi-petani', icon: <Users size={14} />, color: 'text-blue-600 bg-blue-50 border-blue-200', urgent: false },
    { label: 'Pengajuan Tanam', count: (tanamanAktif || []).filter(t => t.statusVerifikasi === 'pending').length, route: '/admin/verifikasi-tanaman', icon: <Sprout size={14} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', urgent: false },
    { label: 'Panen di Gudang (QC)', count: (pickup || []).filter(pk => ['sudah_sampai', 'proses_timbang'].includes(pk.status) && !(qualityControl || []).some(qc => qc.pickupId === pk.id)).length, route: '/admin/quality-control', icon: <Truck size={14} />, color: 'text-purple-600 bg-purple-50 border-purple-200', urgent: true },
    { label: 'Lahan Perlu Verifikasi', count: (lahan || []).filter(l => l.statusVerifikasi === 'pending').length, route: '/admin/data-lahan', icon: <ClipboardList size={14} />, color: 'text-teal-600 bg-teal-50 border-teal-200', urgent: false },
    { label: 'Pendaftaran PO', count: (tenderPetani || []).filter(tp => tp.statusApproval === 'pending').length, route: '/admin/tender', icon: <ShoppingCart size={14} />, color: 'text-orange-600 bg-orange-50 border-orange-200', urgent: false },
  ].filter(a => a.count > 0);

  const pendingActions = actionItems.reduce((s, a) => s + a.count, 0);
  const totalBadge = Math.max(unreadCount, pendingActions);

  const handleRead = async (id: string) => {
    await readNotifikasi(id);
    await refreshData();
  };

  const handleMarkAllRead = async () => {
    if (!notifikasi) return;
    const unreadList = notifikasi.filter(n => !n.dibaca);
    for (const n of unreadList) {
      await readNotifikasi(n.id);
    }
    await refreshData();
  };

  const filteredNotifikasi = (notifikasi || []).filter(n => {
    if (filterTab === 'UNREAD') return !n.dibaca;
    return true;
  });

  const getTipeBadge = (tipe: string) => {
    switch (tipe) {
      case 'danger':
        return <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Penting / Penolakan" />;
      case 'warning':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Peringatan / Pending" />;
      case 'success':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Berhasil / Persetujuan" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Informasi Sistem" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header / Navbar */}
        <header className="bg-white border-b border-gray-100 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-gray-100/50">
          {/* Welcome Text */}
          <div className="text-sm font-semibold text-gray-500 pl-16 lg:pl-0">
            Selamat Datang, <span className="text-gray-900 font-bold">Admin Agro</span>
          </div>
          
          <div className="relative">
            {/* Notification Bell Button */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 active:scale-95 flex items-center justify-center border border-gray-100 shadow-sm"
              title="Pusat Notifikasi Admin"
            >
              <Bell size={18} />
              {totalBadge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold h-4 px-1.5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {totalBadge > 99 ? '99+' : totalBadge}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 md:w-[420px] bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-slide-up flex flex-col">
                  {/* Header Popover */}
                  <div className="p-4 border-b border-gray-100 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <Bell size={16} className="text-emerald-400" /> Pusat Notifikasi Sistem
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aktivitas pendaftaran, transaksi & logistik terkini</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg transition-colors border border-white/10"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex border-b border-gray-100 bg-gray-50/70 p-2 gap-1.5 text-xs">
                    <button
                      onClick={() => setFilterTab('ACTIONS')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center ${
                        filterTab === 'ACTIONS' ? 'bg-white text-gray-800 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🔔 Aksi ({pendingActions})
                    </button>
                    <button
                      onClick={() => setFilterTab('ALL')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center ${
                        filterTab === 'ALL' ? 'bg-white text-gray-800 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Semua ({notifikasi ? notifikasi.length : 0})
                    </button>
                    <button
                      onClick={() => setFilterTab('UNREAD')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center ${
                        filterTab === 'UNREAD' ? 'bg-white text-gray-800 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Baru ({unreadCount})
                    </button>
                  </div>
                  
                  {/* List Container */}
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar max-h-[400px]">
                    {/* ── ACTIONS TAB ── */}
                    {filterTab === 'ACTIONS' && (
                      <>
                        {actionItems.length === 0 ? (
                          <div className="p-8 text-center">
                            <span className="text-3xl">✅</span>
                            <p className="text-sm font-bold text-gray-800 mt-2">Semua beres!</p>
                            <p className="text-xs text-gray-400 mt-1">Tidak ada aksi yang perlu ditangani.</p>
                          </div>
                        ) : (
                          <>
                            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                              <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle size={11} /> {pendingActions} Item Perlu Perhatian Admin
                              </p>
                            </div>
                            {actionItems.map(item => (
                              <div
                                key={item.route}
                                className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${item.urgent ? 'border-red-400' : 'border-amber-300'}`}
                                onClick={() => { navigate(item.route); setShowNotifications(false); }}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-xl ${item.color.split(' ').slice(1).join(' ')} flex items-center justify-center border`}>
                                      <span className={item.color.split(' ')[0]}>{item.icon}</span>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-900">{item.label}</p>
                                      <p className="text-[10px] text-gray-400">{item.count} item menunggu</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-sm font-extrabold ${item.urgent ? 'text-red-600' : 'text-amber-600'}`}>{item.count}</span>
                                    <ChevronRight size={14} className="text-gray-400" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    )}

                    {/* ── NOTIFICATION TABS ── */}
                    {(filterTab === 'ALL' || filterTab === 'UNREAD') && (
                      <>
                        {filteredNotifikasi.length === 0 ? (
                          <div className="p-8 text-center text-xs text-gray-400">
                            Tidak ada notifikasi dalam kategori ini.
                          </div>
                        ) : (
                          filteredNotifikasi.map(n => (
                            <div
                              key={n.id}
                              className={`p-4 hover:bg-gray-50/70 transition-colors ${!n.dibaca ? 'bg-emerald-50/20' : 'bg-white'}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {getTipeBadge(n.tipe)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h5 className={`text-xs ${!n.dibaca ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                      {n.judul}
                                    </h5>
                                    {!n.dibaca && (
                                      <button
                                        onClick={() => handleRead(n.id)}
                                        className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors shrink-0"
                                        title="Tandai telah dibaca"
                                      >
                                        <Check size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed break-words">
                                    {n.pesan}
                                  </p>
                                  <p className="text-[9px] text-gray-400 mt-2 font-medium">
                                    {formatTanggal(n.tanggal)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

      {/* Content Panel */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Global Admin Action Notification System ── */}
      <AdminActionNotification />
    </div>
  );
};
