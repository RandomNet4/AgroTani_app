// =====================================================
// FORM JADWALKAN POLA TANAM - PETANI
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Info, CheckCircle2, Leaf, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatJarakTanam } from '../../utils/spacing';
import { kodeTanaman } from '../../utils/kode';

const FormTambahTanamanPage: React.FC = () => {
  const { lahan: listLahan, komoditas: listKomoditas, addTanaman, currentUser } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const petaniId = currentUser?.id || '';
  const [showSuccess, setShowSuccess] = useState(false);
  const isFromRecommendation = !!searchParams.get('komoditasId');

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

  // Filter approved land only
  const lahanTersedia = listLahan.filter(l => l.petaniId === petaniId && l.statusVerifikasi === 'approved');

  const [formData, setFormData] = useState({
    lahanId: '',
    komoditasId: searchParams.get('komoditasId') || '',
    tanggalTanam: new Date().toISOString().split('T')[0],
    estimasiHasil: searchParams.get('kebutuhanKg') || '',
    catatan: searchParams.get('kebutuhanKg') ? `Untuk memenuhi pengajuan stok Gudang sebesar ${searchParams.get('kebutuhanKg')} kg` : '',
    luasLahanDigunakan: '',
  });

  useEffect(() => {
    if (formData.komoditasId === 'UNKNOWN' && searchParams.get('komoditasNama')) {
      const match = listKomoditas.find(k => k.nama.toLowerCase().includes(searchParams.get('komoditasNama')!.toLowerCase()));
      if (match) {
        setFormData(prev => ({ ...prev, komoditasId: match.id }));
      }
    }
  }, [listKomoditas, searchParams, formData.komoditasId]);

  const [estimasiPanen, setEstimasiPanen] = useState('');

  const selectedLahan = listLahan.find(l => l.id === formData.lahanId);
  const luasMaxM2 = selectedLahan ? selectedLahan.luasHektar * 10000 : 0;
  const selectedKomoditas = listKomoditas.find(k => k.id === formData.komoditasId);

  // Auto-calculated dari komoditas
  const jarakTanamCm = selectedKomoditas?.jarakTanamCm || 0;
  const kebutuhanBenihPerM2 = selectedKomoditas?.kebutuhanBenihGramPerM2 || 0;
  const luasNum = parseFloat(formData.luasLahanDigunakan) || 0;

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

  const handleDataChange = (field: string, value: string) => {
    const todayStr = new Date().toLocaleDateString('sv');
    if (field === 'tanggalTanam' && value < todayStr) {
      alert('Tanggal rencana tanam tidak boleh memilih tanggal kemarin atau sebelumnya.');
      return;
    }
    if (field === 'luasLahanDigunakan') {
      const valNum = parseFloat(value);
      if (selectedLahan && valNum > (selectedLahan.luasHektar * 10000)) {
        alert(`Luas lahan yang digunakan tidak boleh melebihi total luas lahan (${(selectedLahan.luasHektar * 10000).toLocaleString()} m²)`);
        return;
      }
    }
    const newData = { ...formData, [field]: value };

    // Auto-calculate estimasiHasil when luasLahanDigunakan, komoditasId or lahanId changes
    if (field === 'luasLahanDigunakan' || field === 'komoditasId' || field === 'lahanId') {
      const currentLuas = field === 'luasLahanDigunakan' ? parseFloat(value) || 0 : parseFloat(field === 'lahanId' && !value ? '0' : formData.luasLahanDigunakan) || 0;
      const currentKomoditasId = field === 'komoditasId' ? value : formData.komoditasId;
      
      if (currentKomoditasId && currentLuas > 0) {
        const coeff = getProductivityCoeff(currentKomoditasId);
        newData.estimasiHasil = Math.round(currentLuas * coeff).toString();
      } else {
        newData.estimasiHasil = '';
      }
    }

    setFormData(newData);

    if (field === 'komoditasId' || field === 'tanggalTanam') {
      const kId = field === 'komoditasId' ? value : formData.komoditasId;
      const tTanam = field === 'tanggalTanam' ? value : formData.tanggalTanam;
      
      if (kId && tTanam) {
        const komoditas = listKomoditas.find(k => k.id === kId);
        if (komoditas && komoditas.umurPanenHari) {
          const date = new Date(tTanam);
          date.setDate(date.getDate() + komoditas.umurPanenHari);
          
          setEstimasiPanen(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        } else {
          setEstimasiPanen('');
        }
      } else {
        setEstimasiPanen('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const komoditas = listKomoditas.find(k => k.id === formData.komoditasId);
    
    // Check used land size bounds (in m²)
    if (selectedLahan && luasNum > (selectedLahan.luasHektar * 10000)) {
      alert(`Luas lahan terpakai (${luasNum.toLocaleString()} m²) melebihi luas total lahan (${(selectedLahan.luasHektar * 10000).toLocaleString()} m²).`);
      return;
    }

    // Calculate estimasiPanen date (YYYY-MM-DD)
    const tTanam = new Date(formData.tanggalTanam);
    const days = komoditas?.umurPanenHari || 90;
    tTanam.setDate(tTanam.getDate() + days);
    const estPanenStr = tTanam.toISOString().split('T')[0];

    const id = kodeTanaman(komoditas?.nama);
    const success = await addTanaman({
      id,
      petaniId,
      lahanId: formData.lahanId,
      komoditasId: formData.komoditasId,
      komoditasNama: komoditas?.nama || 'Tanaman',
      tanggalTanam: formData.tanggalTanam,
      estimasiPanen: estPanenStr,
      estimasiHasilKg: parseFloat(formData.estimasiHasil),
      fotoTanaman: komoditas?.gambar || '🌱',
      catatan: formData.catatan,
      luasLahanDigunakan: luasNum,
      jarakTanam: jarakTanamCm,
      kebutuhanBibit: kebutuhanBibit,
    });
    if (success) {
      setShowSuccess(true);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Jadwal Tercatat!</h2>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Pola tanam Anda telah masuk ke sistem. <br/> 
          <b>Status: Menunggu Verifikasi.</b> <br/>
          Jadwal ini akan membantu Anda mengontrol panen bulanan dan menghindari oversuplai.
        </p>
        <button
          onClick={() => navigate('/petani/data-lahan')}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          Kembali ke Data Lahan
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-600 text-white px-4 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-lg">Jadwalkan Pola Tanam</h1>
              <p className="text-emerald-100 text-[10px]">Atur jadwal tanam untuk menjaga panen rutin</p>
            </div>
          </div>
          {currentUser && (
            <div className="text-right">
              <span className="text-[9px] text-emerald-200 block uppercase font-bold tracking-wider">Petani</span>
              <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full">{currentUser.nama}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-4 shadow-sm">
          <Info className="text-blue-500 shrink-0" size={20} />
          <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
            Sistem kami merekomendasikan penjadwalan pola tanam berkelanjutan (misal setiap bulan) agar Anda dapat panen teratur tanpa membanjiri pasar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Leaf size={16} className="text-emerald-600" />
              Pilih Lahan & Komoditas
            </h3>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Pilih Lahan</label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.lahanId}
                onChange={(e) => handleDataChange('lahanId', e.target.value)}
              >
                <option value="">-- Pilih Lahan Terverifikasi --</option>
                {lahanTersedia.map(l => (
                  <option key={l.id} value={l.id}>{l.namaLahan} ({l.luasHektar} Ha)</option>
                ))}
              </select>
              {lahanTersedia.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1 font-medium">* Belum ada lahan yang terverifikasi</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Komoditas</label>
              <select
                required
                disabled={isFromRecommendation}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-80 disabled:bg-gray-100 font-medium text-gray-700"
                value={formData.komoditasId}
                onChange={(e) => handleDataChange('komoditasId', e.target.value)}
              >
                <option value="">-- Pilih Komoditas --</option>
                {listKomoditas
                  .filter(k => !isFromRecommendation || k.id === formData.komoditasId)
                  .map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
              </select>
              {isFromRecommendation && (
                <p className="text-[10px] text-emerald-600 mt-1.5 font-semibold">
                  * Pilihan dikunci berdasarkan komoditas dari Rekomendasi Tanam.
                </p>
              )}
            </div>
            
            {/* Tampilkan Info Komoditas jika terpilih */}
            {selectedKomoditas && (
              <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100 space-y-2.5">
                <div className="flex gap-3">
                  <span className="text-2xl">{selectedKomoditas.gambar}</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{selectedKomoditas.nama}</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">{selectedKomoditas.deskripsi}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white/60 rounded-lg p-2.5 text-center">
                  <div>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase">Umur Panen</p>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">{selectedKomoditas.umurPanenHari} Hari</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase">Jarak Tanam</p>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">{formatJarakTanam(selectedKomoditas.jarakTanamCm)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase">Benih/m²</p>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">{selectedKomoditas.kebutuhanBenihGramPerM2 || '-'} gram</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              Rencana Tanam
            </h3>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Tanggal Rencana Tanam</label>
              <input
                required
                type="date"
                min={new Date().toLocaleDateString('sv')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.tanggalTanam}
                onChange={(e) => handleDataChange('tanggalTanam', e.target.value)}
              />
            </div>
            
            {/* Auto-calculated Estimasi Panen */}
            {estimasiPanen && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-amber-600 font-bold uppercase">Estimasi Panen Otomatis</p>
                  <p className="text-xs font-bold text-amber-800">{estimasiPanen}</p>
                </div>
              </div>
            )}

            {/* Luas Lahan yang Digunakan */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Luas Lahan yang Digunakan (Meter Persegi / m²) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                step="1"
                min="1"
                max={luasMaxM2 || undefined}
                placeholder={selectedLahan ? `Maksimal ${(selectedLahan.luasHektar * 10000).toLocaleString()} m²` : "Masukkan luas lahan terpakai (m²)"}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.luasLahanDigunakan}
                onChange={(e) => handleDataChange('luasLahanDigunakan', e.target.value)}
              />
              {selectedLahan && (
                <p className="text-[10px] text-gray-400 mt-1">Total Luas Lahan Tersedia: <span className="font-semibold">{(selectedLahan.luasHektar * 10000).toLocaleString()} m²</span> ({selectedLahan.luasHektar} Ha)</p>
              )}
            </div>

            {/* Kebutuhan Bibit (Hasil Perhitungan Otomatis) */}
            {kebutuhanBibit > 0 && selectedKomoditas && (
              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100 space-y-2 animate-fade-in">
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
              <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100 space-y-2 animate-fade-in">
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
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Jumlah Tanam / Estimasi Hasil (Kg)</label>
              <input
                required
                type="number"
                placeholder="Misal: 1500"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.estimasiHasil}
                onChange={(e) => handleDataChange('estimasiHasil', e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Catatan Proses Tanaman (Opsional)</label>
              <textarea
                placeholder="Misal: Pemberian pupuk awal menggunakan kompos, pembersihan gulma terjadwal..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none shadow-sm"
                rows={3}
                value={formData.catatan}
                onChange={(e) => handleDataChange('catatan', e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={lahanTersedia.length === 0}
            className={`w-full py-4 ${lahanTersedia.length === 0 ? 'bg-gray-300' : 'bg-emerald-600 shadow-lg shadow-emerald-200'} text-white rounded-2xl font-bold transition-all active:scale-95`}
          >
            Simpan Jadwal Pola Tanam
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormTambahTanamanPage;
