// =====================================================
// MODALS: Detail, Edit, Hapus — Lahan & Tanaman
// =====================================================

import React, { useState } from 'react';
import { X, MapPin, Scale, Leaf, Calendar, Clock, Save, AlertTriangle, BookOpen, PlusCircle, Trash, Clipboard } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Lahan, TanamanAktif, Komoditas } from '../types';
import { useData } from '../context/DataContext';
import { formatJarakTanam } from '../utils/spacing';
import { parseLogbook, type LogbookEntry } from '../utils/cropHelpers';

// ── KONFIRMASI HAPUS ──
export const DeleteConfirmModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
      </div>
      <div className="flex border-t border-gray-100">
        <button onClick={onCancel} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Batal</button>
        <button onClick={onConfirm} className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-l border-gray-100">Hapus</button>
      </div>
    </div>
  </div>
);

// ── DETAIL LAHAN MODAL ──
export const DetailLahanModal: React.FC<{
  lahan: Lahan;
  tanamanCount: number;
  onClose: () => void;
}> = ({ lahan, tanamanCount, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold text-gray-800 text-lg">Detail Lahan</h3>
        <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl border border-emerald-100">{lahan.fotoLahan}</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">{lahan.namaLahan}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11} className="text-emerald-500" />{lahan.lokasi.alamat}</p>
          </div>
          <StatusBadge status={lahan.statusVerifikasi} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Luas Lahan</p>
            <p className="text-lg font-bold text-gray-800 flex items-center gap-1 mt-1"><Scale size={14} className="text-emerald-500" />{lahan.luasHektar} Ha</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jenis Lahan</p>
            <p className="text-lg font-bold text-gray-800 capitalize flex items-center gap-1 mt-1"><Leaf size={14} className="text-emerald-500" />{lahan.jenisLahan}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Lokasi</p>
          <div className="space-y-1.5 text-sm text-gray-700">
            <p><span className="text-gray-400 text-xs">Kecamatan:</span> {lahan.kecamatan}</p>
            <p><span className="text-gray-400 text-xs">Kabupaten:</span> {lahan.kabupaten}</p>
            <p><span className="text-gray-400 text-xs">Koordinat:</span> {lahan.lokasi.lat}, {lahan.lokasi.lng}</p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Tanaman Aktif</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{tanamanCount} <span className="text-sm font-medium">siklus tanam</span></p>
        </div>
      </div>
    </div>
  </div>
);

// ── EDIT LAHAN MODAL ──
export const EditLahanModal: React.FC<{
  lahan: Lahan;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ lahan, onClose, onSave }) => {
  const { editLahan } = useData();
  const [form, setForm] = useState({
    namaLahan: lahan.namaLahan,
    luasHektar: String(lahan.luasHektar),
    jenisLahan: lahan.jenisLahan,
    kecamatan: lahan.kecamatan,
    kabupaten: lahan.kabupaten,
    alamat: lahan.lokasi.alamat,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await editLahan(lahan.id, {
      namaLahan: form.namaLahan,
      luasHektar: parseFloat(form.luasHektar),
      jenisLahan: form.jenisLahan,
      kecamatan: form.kecamatan,
      kabupaten: form.kabupaten,
      alamat: form.alamat,
    });
    setLoading(false);
    if (success) onSave(form);
    else alert('Gagal menyimpan perubahan lahan.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Edit Lahan</h3>
            <p className="text-[11px] text-gray-500">Perbarui data {lahan.namaLahan}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Nama Lahan</label>
            <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={form.namaLahan} onChange={e => setForm({...form, namaLahan: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Luas (Ha)</label>
              <input required type="number" step="0.01" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={form.luasHektar} onChange={e => setForm({...form, luasHektar: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Jenis</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={form.jenisLahan} onChange={e => setForm({...form, jenisLahan: e.target.value as any})}>
                <option value="sawah">Sawah</option>
                <option value="kebun">Kebun</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Kecamatan</label>
            <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={form.kecamatan} onChange={e => setForm({...form, kecamatan: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Alamat</label>
            <textarea rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── DETAIL TANAMAN MODAL ──
export const DetailTanamanModal: React.FC<{
  tanaman: TanamanAktif;
  lahanNama: string;
  onClose: () => void;
}> = ({ tanaman, lahanNama, onClose }) => {
  const { komoditas: listKomoditas } = useData();
  const komoditas = listKomoditas.find((k: Komoditas) => k.id === tanaman.komoditasId);
  const start = new Date(tanaman.tanggalTanam).getTime();
  const end = new Date(tanaman.estimasiPanen).getTime();
  const now = Date.now();
  const totalDays = Math.ceil((end - start) / (1000*60*60*24));
  const elapsedDays = Math.ceil((now - start) / (1000*60*60*24));
  const progress = Math.max(0, Math.min(100, Math.floor(((now - start) / (end - start)) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-800 text-lg">Detail Tanaman</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100">{tanaman.fotoTanaman}</span>
            <div>
              <h4 className="font-bold text-gray-800">{tanaman.komoditasNama}</h4>
              <p className="text-xs text-gray-500">di {lahanNama}</p>
            </div>
            <StatusBadge status={tanaman.statusVerifikasi} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={10} />Tanggal Tanam</p>
              <p className="text-sm font-bold text-blue-800 mt-1">{new Date(tanaman.tanggalTanam).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} />Estimasi Panen</p>
              <p className="text-sm font-bold text-amber-800 mt-1">{new Date(tanaman.estimasiPanen).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
              <span>Progress ({elapsedDays}/{totalDays} hari)</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all ${progress >= 100 ? 'bg-amber-500' : progress >= 20 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width:`${progress}%`}} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimasi Hasil</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{tanaman.estimasiHasilKg.toLocaleString()} <span className="text-xs font-medium">Kg</span></p>
            </div>
            {komoditas && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Harga Acuan</p>
                <p className="text-lg font-bold text-gray-800 mt-1">Rp {komoditas.hargaSaatIni.toLocaleString()}<span className="text-xs font-medium">/kg</span></p>
              </div>
            )}
          </div>

          {komoditas && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Estimasi Pendapatan</p>
              <p className="text-xl font-bold text-emerald-800 mt-1">Rp {(tanaman.estimasiHasilKg * komoditas.hargaSaatIni).toLocaleString()}</p>
            </div>
          )}

          {tanaman.luasLahanDigunakan !== undefined && tanaman.luasLahanDigunakan !== null && tanaman.luasLahanDigunakan > 0 && (
            <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100/80">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Detail Kebutuhan Bibit</p>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Luas Terpakai</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{tanaman.luasLahanDigunakan.toLocaleString()} m²</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Jarak Tanam</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{formatJarakTanam(tanaman.jarakTanam)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Butuh Bibit</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{tanaman.kebutuhanBibit ? (tanaman.kebutuhanBibit >= 1000 ? `${(tanaman.kebutuhanBibit / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Kg` : `${tanaman.kebutuhanBibit.toLocaleString()} gram`) : '-'}</p>
                </div>
              </div>
            </div>
          )}

          {(() => {
            const logs = parseLogbook(tanaman.catatan, tanaman.tanggalTanam);
            return (
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen size={11} className="text-emerald-500" /> Catatan & Logbook Penanaman
                </p>
                <div className="space-y-2 mt-1.5 max-h-48 overflow-y-auto pr-1">
                  {logs.map((log) => {
                    const tglLog = new Date(log.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    return (
                      <div key={log.id} className="text-[11px] bg-white p-2.5 rounded-lg border border-gray-100 flex items-start justify-between gap-2 shadow-sm font-medium text-gray-700">
                        <div className="flex-1">
                          <span className="text-[8px] font-extrabold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wider mr-1.5 inline-block">
                            {log.kategori}
                          </span>
                          <span className="text-gray-700 leading-normal">{log.catatan}</span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 shrink-0 mt-0.5">{tglLog}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// ── EDIT TANAMAN MODAL ──
export const EditTanamanModal: React.FC<{
  tanaman: TanamanAktif;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ tanaman, onClose, onSave }) => {
  const { komoditas: listKomoditas, editTanaman } = useData();
  const [form, setForm] = useState({
    tanggalTanam: tanaman.tanggalTanam,
    estimasiHasilKg: String(tanaman.estimasiHasilKg),
    komoditasId: tanaman.komoditasId,
    catatan: tanaman.catatan || '',
  });
  const [loading, setLoading] = useState(false);

  // Produktivitas rata-rata per m² berdasarkan komoditas
  const getProductivityCoeff = (komoditasId: string) => {
    switch (komoditasId) {
      case 'KMD001':
      case 'KMD005':
        return 2.5; // Wortel
      case 'KMD003':
      case 'KMD010':
        return 1.4; // Jagung Manis
      case 'KMD002':
      case 'KMD007':
        return 1.5; // Buncis
      default:
        return 1.0;
    }
  };

  const selectedKomoditas = listKomoditas.find((k: Komoditas) => k.id === form.komoditasId);

  let estimasiPanen = tanaman.estimasiPanen;
  if (selectedKomoditas?.umurPanenHari && form.tanggalTanam) {
    const d = new Date(form.tanggalTanam);
    d.setDate(d.getDate() + selectedKomoditas.umurPanenHari);
    estimasiPanen = d.toISOString().split('T')[0];
  }

  // Auto-calculated fields from the selected commodity
  const jarakTanamCm = selectedKomoditas?.jarakTanamCm || 0;
  const kebutuhanBenihPerM2 = selectedKomoditas?.kebutuhanBenihGramPerM2 || 0;
  const luasNum = tanaman.luasLahanDigunakan || 0;

  // Kebutuhan bibit (gram) = luas lahan (m²) × kebutuhanBenihGramPerM2
  const kebutuhanBibit = (luasNum > 0 && kebutuhanBenihPerM2 > 0)
    ? Math.round(luasNum * kebutuhanBenihPerM2)
    : 0;

  // Format kebutuhanBibit ke satuan yang tepat (gram / kg)
  const formatBibit = (gram: number) => {
    if (gram >= 1000) {
      const kg = gram / 1000;
      return `${kg % 1 === 0 ? kg.toLocaleString() : kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} Kg`;
    }
    return `${gram.toLocaleString()} gram`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await editTanaman(tanaman.id, {
      tanggalTanam: form.tanggalTanam,
      estimasiPanen,
      estimasiHasilKg: parseFloat(form.estimasiHasilKg),
      catatan: form.catatan,
      komoditasId: form.komoditasId,
      komoditasNama: selectedKomoditas?.nama || tanaman.komoditasNama,
      jarakTanam: jarakTanamCm,
      kebutuhanBibit: kebutuhanBibit,
    });
    setLoading(false);
    if (success) {
      onSave({
        ...form,
        estimasiPanen,
        komoditasNama: selectedKomoditas?.nama || tanaman.komoditasNama,
        jarakTanam: jarakTanamCm,
        kebutuhanBibit: kebutuhanBibit,
      });
    } else {
      alert('Gagal menyimpan perubahan tanaman.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Edit Tanaman</h3>
            <p className="text-[11px] text-gray-500">Perbarui data {tanaman.komoditasNama}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Komoditas</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" 
              value={form.komoditasId} 
              onChange={e => {
                const kId = e.target.value;
                const coeff = getProductivityCoeff(kId);
                const autoHasil = Math.round(luasNum * coeff).toString();
                setForm({...form, komoditasId: kId, estimasiHasilKg: autoHasil});
              }}
            >
              {listKomoditas.map((k: Komoditas) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>

          {/* Spacing & Seeding Rate Information */}
          {selectedKomoditas && (
            <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 bg-white/60 rounded-lg p-2.5 text-center">
                <div>
                  <p className="text-[8px] text-emerald-600 font-bold uppercase">Jarak Tanam</p>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">{formatJarakTanam(jarakTanamCm)}</p>
                </div>
                <div>
                  <p className="text-[8px] text-emerald-600 font-bold uppercase">Benih/m²</p>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">{kebutuhanBenihPerM2 || '-'} gram</p>
                </div>
              </div>
            </div>
          )}

          {/* Seed Requirement (Auto calculation) */}
          {kebutuhanBibit > 0 && selectedKomoditas && (
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Estimasi Kebutuhan Bibit (Otomatis)</p>
                  <p className="text-lg font-bold text-emerald-800">{formatBibit(kebutuhanBibit)}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Leaf size={20} className="text-emerald-600" />
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-2.5 text-[10px] text-emerald-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-500">Luas lahan digunakan</span>
                  <span className="font-bold">{luasNum.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-500">Jarak tanam ({selectedKomoditas.nama})</span>
                  <span className="font-bold">{formatJarakTanam(jarakTanamCm)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-500">Kebutuhan benih per m²</span>
                  <span className="font-bold">{kebutuhanBenihPerM2} gram/m²</span>
                </div>
                <div className="border-t border-emerald-100 pt-1 flex justify-between font-bold">
                  <span className="text-emerald-600">Rumus: {luasNum.toLocaleString()} m² × {kebutuhanBenihPerM2} gram</span>
                  <span className="text-emerald-800">= {formatBibit(kebutuhanBibit)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Estimasi Hasil Panen (Hasil Perhitungan Otomatis) */}
          {luasNum > 0 && selectedKomoditas && (
            <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Estimasi Hasil Panen (Otomatis)</p>
                  <p className="text-lg font-bold text-blue-800">
                    {Math.round(luasNum * getProductivityCoeff(selectedKomoditas.id)).toLocaleString()} Kg
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Leaf size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-2.5 text-[10px] text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-500">Luas lahan digunakan</span>
                  <span className="font-bold">{luasNum.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Rata-rata produktivitas ({selectedKomoditas.nama})</span>
                  <span className="font-bold">{getProductivityCoeff(selectedKomoditas.id)} Kg/m²</span>
                </div>
                <div className="border-t border-blue-100 pt-1 flex justify-between font-bold">
                  <span className="text-blue-600">Rumus: {luasNum.toLocaleString()} m² × {getProductivityCoeff(selectedKomoditas.id)} Kg</span>
                  <span className="text-blue-800">= {Math.round(luasNum * getProductivityCoeff(selectedKomoditas.id)).toLocaleString()} Kg</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Tanggal Tanam</label>
            <input required type="date" min={new Date().toLocaleDateString('sv')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={form.tanggalTanam} onChange={e => setForm({...form, tanggalTanam: e.target.value})} />
          </div>
          {estimasiPanen && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <div>
                <p className="text-[10px] text-amber-600 font-bold uppercase">Estimasi Panen</p>
                <p className="text-xs font-bold text-amber-800">{new Date(estimasiPanen).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}</p>
              </div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Estimasi Hasil (Kg)</label>
            <input required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={form.estimasiHasilKg} onChange={e => setForm({...form, estimasiHasilKg: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Catatan Proses Tanaman</label>
            <textarea 
              rows={3} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none shadow-sm" 
              placeholder="Catatan proses budidaya..."
              value={form.catatan} 
              onChange={e => setForm({...form, catatan: e.target.value})} 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── LOGBOOK MODAL ──
export const LogbookModal: React.FC<{
  tanaman: TanamanAktif;
  onClose: () => void;
  onSave: () => void;
}> = ({ tanaman, onClose, onSave }) => {
  const { editTanaman } = useData();
  const [logs, setLogs] = useState<LogbookEntry[]>(() => parseLogbook(tanaman.catatan, tanaman.tanggalTanam));
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Pemupukan',
    catatan: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.catatan.trim()) {
      setErrorMsg('Catatan tidak boleh kosong.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const newEntry: LogbookEntry = {
      id: `LOG-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(1 + Math.random() * 999)).padStart(3, '0')}`,
      tanggal: form.tanggal,
      kategori: form.kategori,
      catatan: form.catatan.trim(),
    };

    const updatedLogs = [newEntry, ...logs]; // latest at the top

    const success = await editTanaman(tanaman.id, {
      ...tanaman,
      catatan: JSON.stringify(updatedLogs),
    });

    setLoading(false);
    if (success) {
      setLogs(updatedLogs);
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: 'Pemupukan',
        catatan: '',
      });
      onSave();
    } else {
      setErrorMsg('Gagal menyimpan catatan harian.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (id === 'init') {
      alert('Entri awal penanaman tidak dapat dihapus.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      return;
    }

    setLoading(true);
    const updatedLogs = logs.filter(log => log.id !== id);

    // If array becomes empty, set it back to initial or empty array stringified
    const updatedCatatan = updatedLogs.length > 0 ? JSON.stringify(updatedLogs) : '';

    const success = await editTanaman(tanaman.id, {
      ...tanaman,
      catatan: updatedCatatan,
    });

    setLoading(false);
    if (success) {
      setLogs(updatedLogs);
      onSave();
    } else {
      alert('Gagal menghapus catatan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base leading-tight">Logbook & Catatan Tanam</h3>
              <p className="text-[11px] text-gray-500 font-medium">{tanaman.komoditasNama}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50">
          {/* Form Tambah Entry */}
          <form onSubmit={handleAddEntry} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle size={14} className="text-emerald-500" /> Tambah Catatan Baru
            </h4>

            {errorMsg && (
              <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tanggal</label>
                <input
                  required
                  type="date"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  value={form.tanggal}
                  onChange={e => setForm({ ...form, tanggal: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Kategori Kegiatan</label>
                <select
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-700"
                  value={form.kategori}
                  onChange={e => setForm({ ...form, kategori: e.target.value })}
                >
                  <option value="Pemupukan">🧪 Pemupukan</option>
                  <option value="Penyiraman">💧 Penyiraman</option>
                  <option value="Penyemprotan">💨 Penyemprotan Hama</option>
                  <option value="Penyiangan">🌱 Penyiangan Rumput</option>
                  <option value="Perkembangan">📈 Perkembangan</option>
                  <option value="Lainnya">📝 Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Catatan Detail</label>
              <textarea
                required
                rows={2}
                placeholder="Tuliskan kondisi tanaman, dosis pupuk, kendala, dll..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all resize-none shadow-inner"
                value={form.catatan}
                onChange={e => setForm({ ...form, catatan: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              Simpan Catatan
            </button>
          </form>

          {/* Timeline Riwayat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Riwayat Kegiatan</h4>
            
            {logs.length === 0 ? (
              <div className="text-center py-6 bg-white border border-dashed border-gray-200 rounded-2xl">
                <Clipboard size={24} className="text-gray-300 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500 font-medium">Belum ada catatan.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-emerald-100 ml-2.5 pl-4 space-y-4 py-1">
                {logs.map((log) => {
                  const tglDisplay = new Date(log.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div key={log.id} className="relative font-medium text-gray-700">
                      {/* Bullet point icon */}
                      <span className="absolute -left-[22.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      </span>

                      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm relative group">
                        {log.id !== 'init' && (
                          <button
                            onClick={() => handleDeleteEntry(log.id)}
                            className="absolute right-2 top-2 p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-md transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash size={12} />
                          </button>
                        )}

                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-gray-400">{tglDisplay}</span>
                          <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {log.kategori}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed break-words font-medium">
                          {log.catatan}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
