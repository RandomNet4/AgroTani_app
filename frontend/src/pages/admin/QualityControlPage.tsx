// =====================================================
// ADMIN: PENIMBANGAN GUDANG (AUTOMATED & SEAMLESS)
// =====================================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, Scale, AlertCircle, RefreshCw, User, Zap, Truck, Save, FileText } from 'lucide-react';
import { formatTanggal } from '../../utils/formatters';
import { kodeJejakPanen } from '../../utils/kode';
import { getKomoditasImageMap } from '../../utils/cropHelpers';

const QualityControlPage: React.FC = () => {
  const { 
    qualityControl: listQualityControl, 
    pickup: listPickup, 
    addQualityControl,
    refreshData
  } = useData();

  const [selectedPickup, setSelectedPickup] = useState<any | null>(null);
  const [beratDiterima, setBeratDiterima] = useState('');
  const [catatan, setCatatan] = useState('');
  const [petugas, setPetugas] = useState('Petugas Timbang Gudang');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  // Filter pengiriman/pickup yang BELUM ditimbang oleh Gudang
  const pickupsReadyForWeighing = (listPickup || []).filter(
    p => !listQualityControl.some(qc => qc.pickupId === p.id)
  );

  // 1-Click Fast Confirm Weighing (Uses estimated/timbang weight directly)
  const handleQuickWeigh = async (pickupItem: any) => {
    const weight = pickupItem.beratTimbangKg || 100;
    if (!window.confirm(`Konfirmasi penimbangan otomatis untuk ${pickupItem.komoditasNama} (${pickupItem.petaniNama}) sebesar ${weight.toLocaleString('id-ID')} kg?`)) {
      return;
    }

    setLoadingId(pickupItem.id);
    const qcId = kodeJejakPanen(pickupItem.komoditasNama);
    const success = await addQualityControl({
      id: qcId,
      pickupId: pickupItem.id,
      petaniNama: pickupItem.petaniNama,
      komoditasNama: pickupItem.komoditasNama,
      beratDiterimaKg: Number(weight),
      grade: 'A',
      catatanKerusakan: 'Hasil panen ditimbang fisik di Gudang Cianjur (Konfirmasi Otomatis)',
      petugasQC: 'Petugas Timbang Gudang',
      fotoQC: '',
    });
    setLoadingId(null);

    if (success) {
      await refreshData();
    } else {
      alert('Gagal menyimpan data penimbangan.');
    }
  };

  // Submit Detailed Weighing Form Modal
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickup || !beratDiterima || isNaN(Number(beratDiterima)) || Number(beratDiterima) <= 0) {
      alert('Masukkan berat timbang yang valid!');
      return;
    }

    setLoadingId(selectedPickup.id);
    const qcId = kodeJejakPanen(selectedPickup.komoditasNama);
    const success = await addQualityControl({
      id: qcId,
      pickupId: selectedPickup.id,
      petaniNama: selectedPickup.petaniNama,
      komoditasNama: selectedPickup.komoditasNama,
      beratDiterimaKg: Number(beratDiterima),
      grade: 'A',
      catatanKerusakan: catatan || 'Hasil panen ditimbang fisik dan diterima di Gudang Cianjur',
      petugasQC: petugas,
      fotoQC: '',
    });
    setLoadingId(null);

    if (success) {
      setSelectedPickup(null);
      setBeratDiterima('');
      setCatatan('');
      await refreshData();
    } else {
      alert('Gagal menyimpan data penimbangan.');
    }
  };

  // Calculate Stats
  const totalTimbangCount = (listQualityControl || []).length;
  const totalWeightKg = (listQualityControl || []).reduce((sum, qc) => sum + (qc.beratDiterimaKg || 0), 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── HEADER & STATS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Scale size={26} className="text-primary-600" /> Penimbangan Hasil Panen (QC Gudang)
          </h1>
          <p className="text-xs text-gray-500 mt-1">Data pengiriman masuk otomatis tampil di antrean penimbangan tanpa perlu input manual</p>
        </div>
        
        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider block">Antrean Pending</span>
            <span className="text-lg font-black text-amber-800">{pickupsReadyForWeighing.length} Batch</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block">Telah Ditimbang</span>
            <span className="text-lg font-black text-emerald-800">{totalTimbangCount} Batch</span>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider block">Total Tonase</span>
            <span className="text-lg font-black text-emerald-400">{(totalWeightKg / 1000).toFixed(1)} Ton</span>
          </div>
        </div>
      </div>

      {/* ── ANTREAN OTOMATIS: DATA MASUK YANG HARUS DITIMBANG ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              🚚 Antrean Penimbangan Masuk (Otomatis Tampil)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Daftar panen yang tiba di gudang dan menunggu verifikasi penimbangan fisik</p>
          </div>
          <button 
            onClick={() => refreshData()}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-200"
            title="Refresh Data Antrean"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {pickupsReadyForWeighing.length === 0 ? (
          <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-sm text-gray-800">Semua Pengiriman Masuk Telah Ditimbang! 🎉</p>
            <p className="text-xs text-gray-400 mt-1">Tidak ada antrean pending. Hasil panen baru dari petani akan otomatis muncul di sini saat tiba di gudang.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pickupsReadyForWeighing.map(pickupItem => {
              const isLoading = loadingId === pickupItem.id;
              const estBerat = pickupItem.beratTimbangKg || 100;
              return (
                <div key={pickupItem.id} className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Siap Timbang
                  </div>

                  <div>
                    {/* Header Item */}
                    <div className="flex items-center gap-3 mb-3">
                      <img src={getKomoditasImageMap(pickupItem.komoditasNama).url} alt={pickupItem.komoditasNama} className="w-10 h-10 rounded-2xl object-cover border border-amber-100 shrink-0" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{pickupItem.komoditasNama}</h3>
                        <p className="text-[10px] text-gray-400 font-mono">Kode: {pickupItem.id}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs border border-gray-100 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-[11px] flex items-center gap-1"><User size={12} className="text-primary-600" /> Petani:</span>
                        <span className="font-bold text-gray-800">{pickupItem.petaniNama}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-[11px] flex items-center gap-1"><Scale size={12} className="text-emerald-600" /> Est. Berat:</span>
                        <span className="font-extrabold text-emerald-700 text-sm">{estBerat.toLocaleString('id-ID')} kg</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-gray-500 text-[10px] flex items-center gap-1"><Truck size={12} className="text-blue-500" /> Pengiriman:</span>
                        <span className="font-medium text-[10px] text-gray-700">{pickupItem.armada || 'Kurir Logistik'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => handleQuickWeigh(pickupItem)}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Zap size={14} className="text-yellow-200" />
                      <span>{isLoading ? 'Memproses...' : `Konfirmasi Sesuai Est. (${estBerat} kg)`}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPickup(pickupItem);
                        setBeratDiterima(String(estBerat));
                        setCatatan('');
                      }}
                      disabled={isLoading}
                      className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Scale size={13} className="text-primary-600" /> Adjust / Timbang Ulang
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL DETAILED WEIGHING ── */}
      {selectedPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={() => setSelectedPickup(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Scale size={18} className="text-primary-600" /> Verifikasi Penimbangan Gudang
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedPickup.komoditasNama} — {selectedPickup.petaniNama}</p>
              </div>
              <button onClick={() => setSelectedPickup(null)} className="p-1 hover:bg-gray-100 rounded-xl text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Estimasi Penimbangan Panen</p>
                  <p className="font-bold text-emerald-900 text-sm">{(selectedPickup.beratTimbangKg || 100).toLocaleString('id-ID')} kg</p>
                </div>
                <span className="bg-white px-2.5 py-1 rounded-xl font-bold text-emerald-700 border border-emerald-200 text-[10px]">
                  Kode: {selectedPickup.id}
                </span>
              </div>

              <div>
                <label className="label-field">Berat Timbang Bersih Aktual (kg)</label>
                <input 
                  type="number" 
                  step="any"
                  className="input-field text-lg font-bold text-primary-700" 
                  value={beratDiterima}
                  onChange={e => setBeratDiterima(e.target.value)}
                  placeholder="Masukkan berat aktual di timbangan"
                  required
                />
              </div>

              <div>
                <label className="label-field">Petugas Penerima Timbang</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={petugas}
                  onChange={e => setPetugas(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-field">Catatan Kondisi Fisik Sayur</label>
                <textarea 
                  placeholder="Contoh: Sayur segar tanpa cacat, kemasan karung bersih." 
                  className="input-field" 
                  rows={2} 
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setSelectedPickup(null)} className="btn-secondary text-xs">Batal</button>
                <button type="submit" disabled={loadingId === selectedPickup.id} className="btn-primary text-xs flex items-center gap-1.5">
                  <Save size={14} /> Simpan Hasil Timbangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DAFTAR REKAP PENIMBANGAN GUDANG ── */}
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2 text-slate-800">
          <FileText size={18} className="text-primary-600" /> Daftar Rekap Penimbangan Gudang Utama
        </h2>
        <p className="text-xs text-gray-500">
          Rekap data penimbangan bersih, tanggal masuk, dan petugas penerima di gudang utama.
        </p>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-gray-600 font-semibold text-xs">
                  <th className="text-left px-5 py-3.5">ID Penimbangan</th>
                  <th className="text-left px-5 py-3.5">Nama Petani</th>
                  <th className="text-left px-5 py-3.5">Komoditas</th>
                  <th className="text-right px-5 py-3.5">Berat Bersih (KG)</th>
                  <th className="text-left px-5 py-3.5">Catatan Timbang/Kondisi</th>
                  <th className="text-left px-5 py-3.5">Tanggal Timbang</th>
                  <th className="text-left px-5 py-3.5">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {(listQualityControl || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-xs">
                      <AlertCircle className="mx-auto mb-2 text-gray-300" size={24} />
                      Belum ada laporan penimbangan yang tercatat.
                    </td>
                  </tr>
                ) : (
                  (listQualityControl || []).map(qc => (
                    <tr key={qc.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-gray-500">{qc.id}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{qc.petaniNama}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          <img src={getKomoditasImageMap(qc.komoditasNama).url} alt={qc.komoditasNama} className="w-6 h-6 rounded-md object-cover border border-gray-100 shrink-0" />
                          <span>{qc.komoditasNama}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-emerald-700">
                        {qc.beratDiterimaKg.toLocaleString('id-ID')} KG
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 max-w-xs truncate" title={qc.catatanKerusakan}>
                        {qc.catatanKerusakan}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{formatTanggal(qc.tanggalQC)}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700 font-medium">{qc.petugasQC}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityControlPage;
