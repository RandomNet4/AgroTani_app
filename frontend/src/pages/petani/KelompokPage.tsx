import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Phone, MapPin, Search, ChevronRight, X, Calendar, Shield, ClipboardCheck, ShoppingCart, Truck, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatJarakTanam } from '../../utils/spacing';
import { hitungProgressTanaman } from '../../utils/cropHelpers';

const KelompokPage: React.FC = () => {
  const navigate = useNavigate();
  const { petani: allPetani, lahan: allLahan, tanamanAktif: allTanaman, pengajuanJual: allPengajuan, tenderPetani: allTenderPetani, pickup: allPickup, tender: allTender, currentUser } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'tanaman' | 'penjualan'>('tanaman');

  // Filter anggota kelompok tani yang dibawahi oleh kepala petani ini
  const anggotaList = allPetani.filter(
    (p) => p.kepalaPetaniId === currentUser?.id && p.role === 'petani'
  );

  const filteredAnggota = anggotaList.filter((a) =>
    a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberClick = (member: any) => {
    // Cari data lahan, tanaman, pengajuan jual, & tender milik anggota ini
    const lahanMember = allLahan.filter((l) => l.petaniId === member.id);
    const tanamanMember = allTanaman.filter((t) => t.petaniId === member.id);
    const pengajuanMember = allPengajuan.filter((p) => p.petaniId === member.id);
    const tenderMember = allTenderPetani.filter((tp) => tp.petaniId === member.id);
    const pickupMember = allPickup.filter((pk) => pk.petaniId === member.id);
    
    setSelectedMember({
      ...member,
      lahan: lahanMember,
      tanaman: tanamanMember,
      pengajuanJual: pengajuanMember,
      tender: tenderMember,
      pickup: pickupMember,
    });
    setActiveSubTab('tanaman');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-800 to-emerald-700 text-white px-4 pt-12 pb-8 rounded-b-3xl shadow-lg relative">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => navigate('/petani/dashboard')} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-bold text-lg">Kelompok Tani</h1>
        </div>
        <p className="text-emerald-100 text-xs ml-11 flex items-center gap-1.5">
          <Users size={12} />
          Binaan Wilayah Lembang & Sekitarnya
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Cari nama anggota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-sm transition-all"
          />
        </div>

        {/* Member Grid */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
            Daftar Anggota ({filteredAnggota.length})
          </p>

          {filteredAnggota.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-400">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm">Tidak ditemukan anggota kelompok.</p>
            </div>
          ) : (
            filteredAnggota.map((member) => {
              const totalLahan = allLahan.filter((l) => l.petaniId === member.id).length;
              const totalTanaman = allTanaman.filter((t) => t.petaniId === member.id).length;
              
              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="w-full bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md rounded-2xl p-4 flex items-center gap-4 transition-all text-left shadow-sm relative group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-lg flex items-center justify-center border border-emerald-100 shrink-0">
                    {member.nama.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{member.nama}</h3>
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin size={10} />
                      Desa {member.kecamatan}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
                        {totalLahan} Lahan
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        {totalTanaman} Tanaman Aktif
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Member Drawer/Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex justify-center items-end animate-fadeIn">
          <div className="bg-white rounded-t-[32px] w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl pb-10 transform translate-y-0 transition-transform duration-300">
            {/* Handle Drag bar */}
            <div className="sticky top-0 bg-white pt-3 pb-2 px-6 flex justify-between items-center border-b border-gray-100 z-10">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <h2 className="font-display font-bold text-gray-800 text-base mt-2">Detail Anggota Kelompok</h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 mt-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-2xl flex items-center justify-center border border-emerald-100 shrink-0 shadow-sm">
                  {selectedMember.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedMember.nama}</h3>
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <Phone size={10} /> {selectedMember.noHp}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {selectedMember.alamat}, Kec. {selectedMember.kecamatan}
                  </p>
                </div>
              </div>

              {/* Data KTP */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <h4 className="font-bold text-xs text-gray-700 flex items-center gap-2">
                  <Shield size={14} className="text-emerald-600" />
                  Verifikasi Data Diri (KTP)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">NIK Anggota</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{selectedMember.nik}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Status Akun</p>
                    <div className="mt-0.5">
                      <StatusBadge status={selectedMember.statusVerifikasi} size="sm" />
                    </div>
                  </div>
                </div>
                {selectedMember.fotoKtp && (
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-1.5">Berkas KTP</p>
                    <div className="w-full h-36 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center group relative cursor-pointer"
                         onClick={() => window.open(selectedMember.fotoKtp, '_blank')}>
                      {selectedMember.fotoKtp.startsWith('data:image/') || selectedMember.fotoKtp.startsWith('http') || selectedMember.fotoKtp.includes('.') ? (
                        <img src={selectedMember.fotoKtp} alt="KTP" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-gray-400 text-xs">Lihat Lampiran Foto KTP</span>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-[10px] font-bold bg-black/60 px-3 py-1 rounded-full">Buka Tab Baru</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab Selector inside Drawer */}
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveSubTab('tanaman')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'tanaman' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Lahan & Tanaman ({selectedMember.tanaman.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('penjualan')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeSubTab === 'penjualan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Jual Panen & Tender ({(selectedMember.pengajuanJual?.length || 0) + (selectedMember.tender?.length || 0)})
                </button>
              </div>

              {activeSubTab === 'tanaman' ? (
                <>
                  {/* Data Lahan Binaan */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider px-1">
                      Aset Lahan ({selectedMember.lahan.length})
                    </h4>
                    {selectedMember.lahan.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Belum ada lahan terdaftar.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedMember.lahan.map((l: any) => {
                          const activeCrop = selectedMember.tanaman.find((t: any) => t.lahanId === l.id);
                          return (
                            <div key={l.id} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm flex items-start gap-3 justify-between">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl pt-0.5 leading-none shrink-0">{l.fotoLahan || '🌾'}</span>
                                <div>
                                  <h5 className="font-bold text-xs text-gray-800">{l.namaLahan}</h5>
                                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{l.lokasi.alamat}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                      Luas: {l.luasHektar} Ha
                                    </span>
                                    {activeCrop && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMember(null);
                                          navigate(`/petani/inspeksi/${activeCrop.id}`);
                                        }}
                                        className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100 hover:bg-emerald-50 transition-colors"
                                      >
                                        <ClipboardCheck size={10} />
                                        {activeCrop.statusVerifikasi === 'pending' || activeCrop.statusVerifikasi === 'survey' 
                                          ? 'Inspeksi Lahan' 
                                          : 'Lihat Hasil'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <StatusBadge status={l.statusVerifikasi} size="sm" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Data Tanaman Aktif */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider px-1">
                      Tanaman Aktif / Pola Tanam ({selectedMember.tanaman.length})
                    </h4>
                    {selectedMember.tanaman.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Belum ada komoditas terdaftar.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedMember.tanaman.map((t: any) => {
                          const land = allLahan.find((l) => l.id === t.lahanId);
                          return (
                            <div key={t.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl leading-none">{t.fotoTanaman || '🥕'}</span>
                                  <div>
                                    <h5 className="font-bold text-xs text-gray-800">{t.komoditasNama}</h5>
                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                      ID Siklus: {t.id} • Lahan: <span className="font-semibold text-emerald-700">{land?.namaLahan || 'N/A'}</span>
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge status={t.statusVerifikasi} size="sm" />
                              </div>

                              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg text-center">
                                <div>
                                  <p className="text-[8px] text-gray-400 font-bold uppercase">Luas Pakai</p>
                                  <p className="text-[10px] font-bold text-gray-800 mt-0.5">
                                    {t.luasLahanDigunakan ? `${t.luasLahanDigunakan} m²` : '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[8px] text-gray-400 font-bold uppercase">Jarak Tanam</p>
                                  <p className="text-[10px] font-bold text-gray-800 mt-0.5">
                                    {formatJarakTanam(t.jarakTanam)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[8px] text-gray-400 font-bold uppercase">Keb. Bibit</p>
                                  <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                    {t.kebutuhanBibit ? (t.kebutuhanBibit >= 1000 ? `${(t.kebutuhanBibit / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Kg` : `${t.kebutuhanBibit.toLocaleString()} gram`) : '-'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="text-[9px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                                    <Calendar size={10} /> Tanggal Tanam
                                  </p>
                                  <p className="font-semibold text-gray-800 mt-0.5">{t.tanggalTanam}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                                    <Calendar size={10} /> Estimasi Panen
                                  </p>
                                  <p className="font-semibold text-gray-800 mt-0.5">{t.estimasiPanen}</p>
                                </div>
                              </div>

                              {(() => {
                                const pct = hitungProgressTanaman(t.tanggalTanam, t.estimasiPanen, t.statusVerifikasi);

                                return (
                                  <div className="space-y-1.5 pt-2.5 border-t border-gray-100">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-bold text-gray-500 uppercase tracking-wider">Progres Tanam</span>
                                      <span className={`font-bold ${pct === 100 ? 'text-emerald-600' : 'text-primary-600'}`}>
                                        {pct === 100 ? 'Siap Panen! 🎉' : `${pct}%`}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          pct === 100 ? 'bg-emerald-500' : 'bg-primary-500'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}

                              {t.catatanInspeksi && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-xs space-y-1">
                                  <p className="font-bold text-[10px] text-amber-800">CATATAN INSPEKSI LAPANGAN:</p>
                                  <p className="text-amber-700 leading-relaxed">{t.catatanInspeksi}</p>
                                  {t.fotoInspeksi && (
                                    <div className="w-16 h-16 bg-white border border-amber-200 rounded-lg overflow-hidden mt-1 cursor-pointer"
                                         onClick={() => window.open(t.fotoInspeksi, '_blank')}>
                                      <img src={t.fotoInspeksi} alt="Inspeksi" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="pt-2.5 border-t border-gray-100 flex gap-2">
                                {t.statusVerifikasi === 'pending' || t.statusVerifikasi === 'survey' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedMember(null);
                                      navigate(`/petani/inspeksi/${t.id}`);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                  >
                                    <ClipboardCheck size={14} />
                                    Mulai Inspeksi Lahan
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedMember(null);
                                      navigate(`/petani/inspeksi/${t.id}`);
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <ClipboardCheck size={14} />
                                    Lihat Hasil Inspeksi
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* TAB PENJUALAN & TENDER ANGGOTA */
                <div className="space-y-4">
                  {/* Section Pengajuan Jual */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                      <ShoppingCart size={13} className="text-emerald-600" />
                      Pengajuan Jual Panen ({selectedMember.pengajuanJual?.length || 0})
                    </h4>
                    {(!selectedMember.pengajuanJual || selectedMember.pengajuanJual.length === 0) ? (
                      <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Belum ada pengajuan jual panen.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedMember.pengajuanJual.map((pj: any) => {
                          const pickupInfo = allPickup.find(pk => pk.pengajuanJualId === pj.id);
                          return (
                            <div key={pj.id} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-gray-800">{pj.komoditasNama}</h5>
                                <StatusBadge status={pj.status} size="sm" />
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <div>
                                  <span className="text-gray-400 uppercase font-semibold">Volume Panen</span>
                                  <p className="font-bold text-emerald-700 text-xs mt-0.5">{pj.beratEstimasiKg} Kg</p>
                                </div>
                                <div>
                                  <span className="text-gray-400 uppercase font-semibold">Tipe Penjualan</span>
                                  <p className="font-bold text-gray-800 text-xs mt-0.5">{pj.tipePenjualan || 'GUDANG'}</p>
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-50">
                                <span>Tgl Pengajuan: <b>{pj.tanggalPengajuan}</b></span>
                                <span>Gudang: <b>{pj.gudangTujuanNama || 'Utama'}</b></span>
                              </p>

                              {pickupInfo && (
                                <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg text-[10px] text-blue-900 space-y-1">
                                  <p className="font-bold flex items-center gap-1">
                                    <Truck size={11} className="text-blue-600" /> Status Penjemputan Armada:
                                  </p>
                                  <p>Driver: <b>{pickupInfo.driverNama}</b> ({pickupInfo.platNomor}) • Status: <span className="uppercase font-bold text-blue-700">{pickupInfo.status}</span></p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section Tender */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                      <FileText size={13} className="text-emerald-600" />
                      Partisipasi Tender / PO ({selectedMember.tender?.length || 0})
                    </h4>
                    {(!selectedMember.tender || selectedMember.tender.length === 0) ? (
                      <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Belum mengikuti program tender.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedMember.tender.map((tp: any) => {
                          const tDetail = allTender.find(t => t.id === tp.tenderId);
                          return (
                            <div key={tp.id} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-gray-800">{tDetail?.komoditasNama || 'Tender BUMD'}</h5>
                                <StatusBadge status={tp.statusApproval} size="sm" />
                              </div>
                              <div className="flex justify-between items-center text-[10px] bg-emerald-50/50 p-2 rounded-lg text-emerald-900">
                                <span>Kesanggupan Pasokan:</span>
                                <span className="font-bold text-xs text-emerald-800">{tp.kesanggupanKg} Kg</span>
                              </div>
                              <p className="text-[10px] text-gray-400 text-right">Tgl Daftar: {tp.tanggalDaftar}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelompokPage;
