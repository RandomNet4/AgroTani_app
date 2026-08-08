// =====================================================
// ADMIN: MANAJEMEN TENDER
// =====================================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FileText, Plus, Save, Users } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import { kodeTender } from '../../utils/kode';

const ManajemenTenderPage: React.FC = () => {
  const { tender: listTender, tenderPetani: listTenderPetani, petani: listPetani, komoditas: listKomoditas, addTender, verifyTenderAdmin } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('terbaru');
  const [form, setForm] = useState({
    komoditasId: '',
    kebutuhanKg: '',
    hargaPerKg: '',
    periodePanen: '',
    tanggalBerakhir: '',
    deskripsi: '',
  });

  const handleSimpan = async () => {
    if (!form.komoditasId || !form.kebutuhanKg || !form.hargaPerKg) return alert('Lengkapi form!');
    const komoditas = listKomoditas.find(k => k.id === form.komoditasId);
    if (!komoditas) return;
    setLoading(true);
    const id = kodeTender(komoditas.nama);
    const success = await addTender({
      id,
      komoditasId: form.komoditasId,
      komoditasNama: komoditas.nama,
      kebutuhanKg: form.kebutuhanKg,
      hargaPerKg: form.hargaPerKg,
      terpenuhinKg: 0,
      status: 'aktif',
      periodePanen: form.periodePanen || '-',
      tanggalBerakhir: form.tanggalBerakhir || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deskripsi: form.deskripsi,
    });
    setLoading(false);
    if (success) {
      setShowAdd(false);
      setForm({ komoditasId: '', kebutuhanKg: '', hargaPerKg: '', periodePanen: '', tanggalBerakhir: '', deskripsi: '' });
    } else {
      alert('Gagal membuat tender.');
    }
  };
  const handleVerify = async (id: string, status: string) => {
    let alasan: string | undefined = undefined;
    if (status === 'ditolak') {
      const inputAlasan = window.prompt('Masukkan alasan penolakan PO ini:');
      if (inputAlasan === null) return; // User cancelled prompt
      if (!inputAlasan.trim()) {
        alert('Alasan penolakan harus diisi!');
        return;
      }
      alasan = inputAlasan.trim();
    } else {
      if (!window.confirm(`Yakin ingin menyetujui PO ini?`)) return;
    }

    setLoading(true);
    const success = await verifyTenderAdmin(id, status, alasan);
    setLoading(false);
    if (!success) {
      alert('Gagal memverifikasi tender');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FileText size={24} /> Permintaan Gudang</h1>
          <p className="text-sm text-gray-500 mt-1">Buat dan kelola kebutuhan komoditas (termasuk permintaan gudang) untuk panen mendatang</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="input-field py-2 text-sm max-w-[200px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="terbaru">Terbaru (Default)</option>
            <option value="terlama">Terlama</option>
            <option value="terbanyak">Kebutuhan Terbanyak</option>
            <option value="terdekat">Batas Waktu Terdekat</option>
          </select>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Buat Baru
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-4 border-2 border-primary-200 animate-slide-up">
          <h3 className="section-title mb-4">Buat Tender Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Komoditas</label>
              <select className="input-field" value={form.komoditasId} onChange={e => setForm({...form, komoditasId: e.target.value})}>
                <option value="">Pilih komoditas</option>
                {listKomoditas.map(k => <option key={k.id} value={k.id}>{k.gambar} {k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Kebutuhan (kg)</label>
              <input type="number" placeholder="Jumlah kebutuhan" className="input-field" value={form.kebutuhanKg} onChange={e => setForm({...form, kebutuhanKg: e.target.value})} />
            </div>
            <div>
              <label className="label-field">Harga per kg (Rp)</label>
              <input type="number" placeholder="Harga beli" className="input-field" value={form.hargaPerKg} onChange={e => setForm({...form, hargaPerKg: e.target.value})} />
            </div>
            <div>
              <label className="label-field">Periode Panen</label>
              <input type="text" placeholder="Mis: April 2026" className="input-field" value={form.periodePanen} onChange={e => setForm({...form, periodePanen: e.target.value})} />
            </div>
            <div>
              <label className="label-field">Batas Pendaftaran</label>
              <input type="date" className="input-field" value={form.tanggalBerakhir} onChange={e => setForm({...form, tanggalBerakhir: e.target.value})} />
            </div>
            <div>
              <label className="label-field">Deskripsi</label>
              <input type="text" placeholder="Deskripsi tender" className="input-field" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Batal</button>
            <button onClick={handleSimpan} disabled={loading} className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50">
              <Save size={14} /> {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Tender Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...listTender].sort((a, b) => {
          if (sortBy === 'terbanyak') return b.kebutuhanKg - a.kebutuhanKg;
          if (sortBy === 'terdekat') return new Date(a.tanggalBerakhir).getTime() - new Date(b.tanggalBerakhir).getTime();
          // Fallback to createdAt or string comparison
          const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : new Date(a.tanggalBerakhir).getTime();
          const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : new Date(b.tanggalBerakhir).getTime();
          if (sortBy === 'terbaru') return timeB - timeA;
          if (sortBy === 'terlama') return timeA - timeB;
          return 0;
        }).map(t => {
          const alokasiPetani = (listTenderPetani || []).filter(tp => tp.tenderId === t.id);
          const totalTerpenuhiCalculated = alokasiPetani.filter(tp => tp.statusApproval !== 'rejected').reduce((sum, item) => sum + (item.kesanggupanKg || 0), 0);
          const totalTerpenuhi = Math.max(t.terpenuhinKg || 0, totalTerpenuhiCalculated);
          const persen = (totalTerpenuhi / t.kebutuhanKg) * 100;

          return (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {t.komoditasNama}
                    {t.deskripsi.includes('[Permintaan Gudang') && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                        Dari Gudang
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">{t.deskripsi}</p>
                  {(t as any).alasanPenolakan && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2 mt-2 font-medium">
                      ❌ Alasan Penolakan: {(t as any).alasanPenolakan}
                    </p>
                  )}
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Kebutuhan</p>
                  <p className="font-bold">
                    {t.kebutuhanKg.toLocaleString('id-ID')} kg
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Terpenuhi</p>
                  <p className="font-bold text-primary-700">
                    {totalTerpenuhi.toLocaleString('id-ID')} kg
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Harga</p>
                  <p className="font-bold">{formatRupiah(t.hargaPerKg)}</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span><span>{persen.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${persen >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(persen, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Periode: {t.periodePanen}</span>
                <span>Batas: {formatTanggal(t.tanggalBerakhir)}</span>
              </div>

              {/* ── DAFTAR PETANI PELAKSANA / PENGAMBIL PO GUDANG ── */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Users size={14} className="text-primary-600" />
                    Daftar Petani Pengambil ({alokasiPetani.length})
                  </span>
                  {alokasiPetani.length > 0 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Total: {alokasiPetani.reduce((sum, item) => sum + (item.kesanggupanKg || 0), 0).toLocaleString('id-ID')} kg
                    </span>
                  )}
                </div>

                {alokasiPetani.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-400 font-medium">Belum ada petani yang mengambil kuota permintaan gudang ini.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {alokasiPetani.map((tp) => {
                      const detailPetani = (listPetani || []).find(p => p.id === tp.petaniId || p.nama.toLowerCase() === tp.petaniNama?.toLowerCase());
                      const noHp = detailPetani?.noHp || '-';
                      const lokasi = detailPetani ? `${detailPetani.kecamatan}, ${detailPetani.kabupaten}` : '-';

                      return (
                        <div key={tp.id} className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-xs transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                                <span>🧑‍🌾 {tp.petaniNama}</span>
                                <StatusBadge status={tp.statusApproval} size="sm" />
                              </div>
                              <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>📱 {noHp}</span>
                                <span>•</span>
                                <span>📍 {lokasi}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-primary-700 block text-xs">
                                {tp.kesanggupanKg.toLocaleString('id-ID')} kg
                              </span>
                              <span className="text-[9px] text-gray-400 block mt-0.5">
                                {formatTanggal(tp.tanggalDaftar)}
                              </span>
                            </div>
                          </div>
                          {tp.catatanAdmin && (
                            <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-2 border border-amber-200">
                              📝 Catatan Admin: {tp.catatanAdmin}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {t.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                  <button 
                    onClick={() => handleVerify(t.id, 'aktif')}
                    disabled={loading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Terima & Teruskan
                  </button>
                  <button 
                    onClick={() => handleVerify(t.id, 'ditolak')}
                    disabled={loading}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManajemenTenderPage;
