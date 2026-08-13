// =====================================================
// ADMIN: MONITORING SUPPLY & FORECAST
// =====================================================

import React from 'react';
import { useData } from '../../context/DataContext';
import { BarChart3, Sprout, Calendar, Users, Map, TrendingUp, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { getKomoditasImageMap } from '../../utils/cropHelpers';

// Helper: Hitung progress tanam (0-100%)
const hitungProgressTanam = (tanggalTanam: string, estimasiPanen: string): number => {
  const mulai = new Date(tanggalTanam).getTime();
  const selesai = new Date(estimasiPanen).getTime();
  const sekarang = Date.now();
  if (sekarang >= selesai) return 100;
  if (sekarang <= mulai) return 0;
  return Math.round(((sekarang - mulai) / (selesai - mulai)) * 100);
};

// Helper: Hitung hari menuju tanggal
const hitungHariMenuju = (tanggal: string): number => {
  const target = new Date(tanggal);
  const sekarang = new Date();
  return Math.ceil((target.getTime() - sekarang.getTime()) / (1000 * 60 * 60 * 24));
};

const MonitoringSupplyPage: React.FC = () => {
  const { komoditas: listKomoditas, tanamanAktif: listTanamanAktif, petani: listPetani, lahan: listLahan } = useData();
  const totalProduksi = listKomoditas.reduce((s, k) => s + k.totalEstimasiProduksiKg, 0);
  const totalKebutuhan = listKomoditas.reduce((s, k) => s + k.kebutuhanBulananKg, 0);
  const kurang = listKomoditas.filter(k => k.supplyStatus === 'kurang');
  const cukup = listKomoditas.filter(k => k.supplyStatus === 'cukup');
  const berlebih = listKomoditas.filter(k => k.supplyStatus === 'berlebih');

  // 1. Total Petani Mitra
  const totalPetani = listPetani.filter(p => p.role === 'petani').length;
  const petaniPending = listPetani.filter(p => p.role === 'petani' && p.statusVerifikasi === 'pending').length;

  // 2. Total Luas Lahan (Ha)
  const totalLuasLahan = listLahan.reduce((sum, l) => sum + l.luasHektar, 0);

  // 3. Komoditas Terbanyak Bulan Ini (Dinamis Realtime)
  const now = new Date();
  const cropStatsByCommodity: Record<string, { nama: string; totalKg: number; count: number; gambar: string }> = {};

  listTanamanAktif.forEach(t => {
    const tanamDate = new Date(t.tanggalTanam);
    const panenDate = new Date(t.estimasiPanen);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Check if crop spans current month
    const isActiveThisMonth = (tanamDate <= currentMonthEnd && panenDate >= currentMonthStart);
    
    if (isActiveThisMonth && t.statusVerifikasi === 'approved') {
      if (!cropStatsByCommodity[t.komoditasId]) {
        cropStatsByCommodity[t.komoditasId] = {
          nama: t.komoditasNama,
          totalKg: 0,
          count: 0,
          gambar: t.fotoTanaman || '🌱'
        };
      }
      cropStatsByCommodity[t.komoditasId].totalKg += t.estimasiHasilKg;
      cropStatsByCommodity[t.komoditasId].count += 1;
    }
  });

  let terpopuler = { nama: '-', count: 0, totalKg: 0, gambar: '🌱' };
  let maxCount = 0;
  for (const cid in cropStatsByCommodity) {
    if (cropStatsByCommodity[cid].count > maxCount) {
      maxCount = cropStatsByCommodity[cid].count;
      terpopuler = {
        nama: cropStatsByCommodity[cid].nama,
        count: cropStatsByCommodity[cid].count,
        totalKg: cropStatsByCommodity[cid].totalKg,
        gambar: cropStatsByCommodity[cid].gambar
      };
    }
  }

  // Fallback if no active tanaman in this month
  if (terpopuler.nama === '-' && listTanamanAktif.length > 0) {
    const allCropStats: Record<string, { nama: string; totalKg: number; count: number; gambar: string }> = {};
    listTanamanAktif.forEach(t => {
      if (!allCropStats[t.komoditasId]) {
        allCropStats[t.komoditasId] = {
          nama: t.komoditasNama,
          totalKg: 0,
          count: 0,
          gambar: t.fotoTanaman || '🌱'
        };
      }
      allCropStats[t.komoditasId].totalKg += t.estimasiHasilKg;
      allCropStats[t.komoditasId].count += 1;
    });
    let maxAllCount = 0;
    for (const cid in allCropStats) {
      if (allCropStats[cid].count > maxAllCount) {
        maxAllCount = allCropStats[cid].count;
        terpopuler = {
          nama: allCropStats[cid].nama,
          count: allCropStats[cid].count,
          totalKg: allCropStats[cid].totalKg,
          gambar: allCropStats[cid].gambar
        };
      }
    }
  }

  // Get petani name by id
  const getPetaniNama = (petaniId: string) => listPetani.find(p => p.id === petaniId)?.nama || petaniId;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><BarChart3 size={24} /> Monitoring Supply & Forecast</h1>
        <p className="text-sm text-gray-500 mt-1">Estimasi supply berdasarkan tanaman aktif vs kebutuhan</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* 1. Total Petani Mitra */}
        <div className="stat-card from-emerald-600 to-teal-500 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Petani Mitra</p>
              <Users size={16} className="text-emerald-100" />
            </div>
            <p className="text-2xl font-bold">{totalPetani} Petani</p>
          </div>
          <p className="text-emerald-100/80 text-[10px] mt-2 font-medium">
            {petaniPending > 0 ? `⚠️ ${petaniPending} pending verifikasi` : '✅ Semua terverifikasi'}
          </p>
        </div>

        {/* 2. Total Luas Lahan */}
        <div className="stat-card from-teal-600 to-cyan-500 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider">Total Luas Lahan</p>
              <Map size={16} className="text-teal-100" />
            </div>
            <p className="text-2xl font-bold">{totalLuasLahan.toFixed(2)} Ha</p>
          </div>
          <p className="text-teal-100/80 text-[10px] mt-2 font-medium">
            Dari {listLahan.length} lokasi lahan
          </p>
        </div>

        {/* 3. Komoditas Terbanyak Bulan Ini */}
        <div className="stat-card from-amber-500 to-orange-500 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Terbanyak ({now.toLocaleDateString('id-ID', {month:'short'})})</p>
              <Sprout size={16} className="text-amber-100" />
            </div>
            <p className="text-lg font-bold truncate flex items-center gap-2">
              <img src={getKomoditasImageMap(terpopuler.nama || terpopuler.gambar).url} alt={terpopuler.nama} className="w-6 h-6 rounded-md object-cover shrink-0 border border-white/20" />
              <span className="truncate">{terpopuler.nama}</span>
            </p>
          </div>
          <p className="text-amber-100/80 text-[10px] mt-2 font-medium truncate">
            {terpopuler.count > 0 ? `Ditanam oleh ${terpopuler.count} petani` : 'Belum ada tanaman'}
          </p>
        </div>

        {/* 4. Total Estimasi Produksi */}
        <div className="stat-card from-blue-600 to-indigo-500 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Est. Produksi</p>
              <TrendingUp size={16} className="text-blue-100" />
            </div>
            <p className="text-2xl font-bold">{totalProduksi.toLocaleString('id-ID')} Kg</p>
          </div>
          <p className="text-blue-100/80 text-[10px] mt-2 font-medium">
            {listTanamanAktif.length} tanaman aktif
          </p>
        </div>

        {/* 5. Total Kebutuhan */}
        <div className="stat-card from-purple-600 to-fuchsia-500 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider">Kebutuhan Bulanan</p>
              <BarChart3 size={16} className="text-purple-100" />
            </div>
            <p className="text-2xl font-bold">{totalKebutuhan.toLocaleString('id-ID')} Kg</p>
          </div>
          <p className="text-purple-100/80 text-[10px] mt-2 font-medium">
            {listKomoditas.length} komoditas pasar
          </p>
        </div>

        {/* 6. Ketahanan Supply */}
        <div className="stat-card from-rose-600 to-pink-500 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider">Defisit Supply</p>
              <AlertTriangle size={16} className="text-rose-100" />
            </div>
            <p className="text-2xl font-bold">{kurang.length} Komoditas</p>
          </div>
          <p className="text-rose-100/80 text-[10px] mt-2 font-medium">
            {cukup.length + berlebih.length} komoditas aman
          </p>
        </div>
      </div>

      {/* Supply Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="section-title">Detail Supply per Komoditas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Komoditas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Petani</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estimasi Supply</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kebutuhan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Selisih</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">%</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Panen</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {listKomoditas.sort((a, b) => {
                const order = { kurang: 0, cukup: 1, berlebih: 2 };
                return order[a.supplyStatus] - order[b.supplyStatus];
              }).map(k => {
                const selisih = k.totalEstimasiProduksiKg - k.kebutuhanBulananKg;
                const persen = (k.totalEstimasiProduksiKg / k.kebutuhanBulananKg * 100);
                return (
                  <tr key={k.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${k.supplyStatus === 'kurang' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={getKomoditasImageMap(k.nama || k.gambar).url} alt={k.nama} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="font-medium">{k.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{k.jumlahPetaniAktif}</td>
                    <td className="px-4 py-3 text-gray-600">{(k.totalEstimasiProduksiKg / 1000).toFixed(1)} ton</td>
                    <td className="px-4 py-3 text-gray-600">{(k.kebutuhanBulananKg / 1000).toFixed(1)} ton</td>
                    <td className={`px-4 py-3 font-semibold ${selisih < 0 ? 'text-red-600' : selisih > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                      {selisih >= 0 ? '+' : ''}{(selisih / 1000).toFixed(1)} ton
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${persen < 80 ? 'bg-red-500' : persen <= 120 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(persen, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{persen.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{k.estimasiBulanPanen}</td>
                    <td className="px-4 py-3"><StatusBadge status={k.supplyStatus} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== TANAMAN AKTIF PETANI (Admin Monitoring) ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="section-title flex items-center gap-2">
            <Sprout size={20} className="text-primary-600" />
            Tanaman Aktif Petani
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Pantau progress tanaman semua petani mitra</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Petani</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Komoditas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Progress</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Est. Hasil</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Sisa Hari</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {listTanamanAktif.map(tanaman => {
                const progress = hitungProgressTanam(tanaman.tanggalTanam, tanaman.estimasiPanen);
                const hariSisa = hitungHariMenuju(tanaman.estimasiPanen);
                const progressColor =
                  progress >= 75 ? 'bg-emerald-500' :
                  progress >= 40 ? 'bg-amber-500' :
                  'bg-orange-500';

                return (
                  <tr key={tanaman.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const profilePhoto = listPetani.find(p => p.id === tanaman.petaniId)?.fotoProfil;
                          return profilePhoto && (profilePhoto.startsWith('data:image/') || profilePhoto.startsWith('http') || profilePhoto.includes('.')) ? (
                            <img src={profilePhoto} alt="Foto Profil" className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-100" />
                          ) : (
                            <span className="text-lg">{profilePhoto || '👤'}</span>
                          );
                        })()}
                        <span className="font-medium text-gray-800">{getPetaniNama(tanaman.petaniId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tanaman.fotoTanaman}</span>
                        <span>{tanaman.komoditasNama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progressColor}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          progress >= 75 ? 'text-emerald-600' :
                          progress >= 40 ? 'text-amber-600' :
                          'text-orange-600'
                        }`}>
                          {progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tanaman.estimasiHasilKg.toLocaleString()} kg</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span className={`text-xs font-medium ${hariSisa <= 7 ? 'text-emerald-600' : hariSisa <= 30 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {hariSisa > 0 ? `${hariSisa} hari` : 'Siap panen'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={tanaman.statusVerifikasi} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonitoringSupplyPage;
