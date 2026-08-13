// =====================================================
// ADMIN: MANAJEMEN HARGA JUAL & GRAFIK TREN HARGA
// =====================================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DollarSign, Plus, Edit3, Clock, Save, Filter, BarChart2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import { kodeHarga } from '../../utils/kode';
import { getKomoditasImageMap } from '../../utils/cropHelpers';

// =====================================================
// KOMPONEN GRAFIK PERUBAHAN HARGA (SVG INTERAKTIF)
// =====================================================
interface PriceChartProps {
  data: { id: string; tanggal: string; harga: number; label: string }[];
  komoditasNama: string;
  komoditasGambar: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, komoditasNama, komoditasGambar }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; harga: number; tanggal: string } | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 border border-gray-100 flex flex-col items-center justify-center mb-6">
        <BarChart2 size={36} className="text-gray-300 mb-2" />
        <p className="font-bold text-sm text-gray-600">Belum Ada Histori Perubahan Harga</p>
        <p className="text-xs text-gray-400 mt-0.5">Grafik akan otomatis terbentuk ketika ada pembaruan harga resmi BUMD.</p>
      </div>
    );
  }

  // Sort chronological for line plotting (oldest to newest)
  const sortedData = [...data].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  const height = 130;
  const width = 580;
  const paddingX = 45;
  const paddingY = 22;

  const prices = sortedData.map(d => d.harga);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const points = sortedData.map((d, index) => {
    const x = paddingX + (index / (sortedData.length - 1 || 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.harga - minPrice) / priceRange) * (height - paddingY * 2);
    return { x, y, harga: d.harga, tanggal: d.tanggal, label: d.label };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  const firstPrice = sortedData[0]?.harga || 0;
  const latestPrice = sortedData[sortedData.length - 1]?.harga || 0;
  const diff = latestPrice - firstPrice;
  const percentChange = firstPrice > 0 ? ((diff / firstPrice) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden mb-5 max-w-4xl">
      {/* Header Info Grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <img src={getKomoditasImageMap(komoditasNama || komoditasGambar).url} alt={komoditasNama} className="w-8 h-8 rounded-xl object-cover border border-emerald-100 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">Grafik Tren Harga {komoditasNama}</h3>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5 ${
                diff > 0 ? 'bg-emerald-50 text-emerald-700' : diff < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {diff > 0 ? <ArrowUpRight size={10} /> : diff < 0 ? <ArrowDownRight size={10} /> : <Minus size={10} />}
                {diff > 0 ? `+${percentChange}%` : `${percentChange}%`}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Histori rekam acuan harga resmi BUMD Agro Jabar</p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-1.5">
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 text-right">
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Terendah</span>
            <span className="text-[11px] font-bold text-gray-700">{formatRupiah(minPrice)}</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1 text-right">
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Tertinggi</span>
            <span className="text-[11px] font-bold text-emerald-600">{formatRupiah(maxPrice)}</span>
          </div>
          <div className="bg-emerald-600 text-white rounded-lg px-2.5 py-1 text-right shadow-sm">
            <span className="text-[8px] text-emerald-200 font-bold uppercase tracking-wider block">Saat Ini</span>
            <span className="text-[11px] font-extrabold">{formatRupiah(latestPrice)}</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto no-scrollbar pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[450px]">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            const val = maxPrice - ratio * priceRange;
            return (
              <g key={i}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#F3F4F6" strokeDasharray="3 3" />
                <text x={paddingX - 6} y={y + 3} textAnchor="end" className="text-[8px] fill-gray-400 font-semibold">
                  {Math.round(val).toLocaleString('id-ID')}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Date Labels */}
          {points.map((pt, i) => (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
              <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" className="hover:scale-125 transition-all" />
              <text x={pt.x} y={height - 5} textAnchor="middle" className="text-[8px] fill-gray-400 font-bold">
                {new Date(pt.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-lg shadow-md border border-gray-700 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
            style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
          >
            <p className="font-bold text-emerald-400">{formatRupiah(hoveredPoint.harga)}/kg</p>
            <p className="text-[8px] text-gray-300">{formatTanggal(hoveredPoint.tanggal)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// PAGE COMPONENT: MANAJEMEN HARGA ADMIN
// =====================================================
const ManajemenHargaPage: React.FC = () => {
  const { komoditas: listKomoditas, historiHarga: listHistoriHarga, updateHargaKomoditas } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKomoditasId, setSelectedKomoditasId] = useState<string>('ALL');

  const [form, setForm] = useState({
    komoditasId: '',
    harga: '',
    wilayah: 'Jawa Barat',
  });

  const handleSimpan = async () => {
    if (!form.komoditasId || !form.harga) return alert('Lengkapi form terlebih dahulu!');
    const komoditas = listKomoditas.find(k => k.id === form.komoditasId);
    if (!komoditas) return;
    setLoading(true);
    const id = kodeHarga();
    const success = await updateHargaKomoditas({
      id,
      komoditasId: form.komoditasId,
      komoditasNama: komoditas.nama,
      harga: form.harga,
      wilayah: form.wilayah,
      dibuatOleh: 'Admin Agro',
    });
    setLoading(false);
    if (success) {
      setShowAdd(false);
      setEditingId(null);
      setForm({ komoditasId: '', harga: '', wilayah: 'Jawa Barat' });
    } else {
      alert('Gagal menyimpan harga.');
    }
  };

  const openEdit = (komoditas: any) => {
    setForm({
      komoditasId: komoditas.id,
      harga: String(komoditas.hargaSaatIni),
      wilayah: 'Jawa Barat',
    });
    setEditingId(komoditas.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter komoditas list
  const filteredKomoditas = selectedKomoditasId === 'ALL'
    ? listKomoditas
    : listKomoditas.filter(k => k.id === selectedKomoditasId);

  // Filter history list
  const filteredHistori = selectedKomoditasId === 'ALL'
    ? listHistoriHarga
    : listHistoriHarga.filter(h => h.komoditasId === selectedKomoditasId);

  // Selected commodity for detailed chart
  const activeKomoditasObj = selectedKomoditasId !== 'ALL'
    ? listKomoditas.find(k => k.id === selectedKomoditasId)
    : listKomoditas.find(k => k.nama.toLowerCase().includes('wortel')) || listKomoditas[0];

  const activeChartData = filteredHistori
    .filter(h => h.komoditasId === (activeKomoditasObj?.id || 'KMD001'))
    .map(h => ({
      id: h.id,
      tanggal: h.tanggal,
      harga: h.harga,
      label: formatTanggal(h.tanggal)
    }));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><DollarSign size={24} className="text-primary-600" /> Manajemen Harga Sayuran</h1>
          <p className="text-sm text-gray-500 mt-1">Tetapkan harga beli resmi BUMD & pantau tren grafik perubahan harga pasar</p>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ komoditasId: '', harga: '', wilayah: 'Jawa Barat' }); }} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Update Harga Baru
        </button>
      </div>

      {/* ── FILTER KOMODITAS / SAYURAN ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
          <Filter size={16} className="text-primary-600" />
          <span>Filter Komoditas Sayuran:</span>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedKomoditasId('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              selectedKomoditasId === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>Semua Sayuran ({listKomoditas.length})</span>
          </button>

          {listKomoditas.map(k => (
            <button
              key={k.id}
              onClick={() => setSelectedKomoditasId(k.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedKomoditasId === k.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <img src={getKomoditasImageMap(k.nama || k.gambar).url} alt={k.nama} className="w-5 h-5 rounded-md object-cover shrink-0" />
              <span>{k.nama}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── GRAFIK TREN PERUBAHAN HARGA ── */}
      {activeKomoditasObj && (
        <PriceChart
          data={activeChartData}
          komoditasNama={activeKomoditasObj.nama}
          komoditasGambar={activeKomoditasObj.gambar}
        />
      )}

      {/* Form Tambah / Edit */}
      {showAdd && (
        <div className="card mb-6 border-2 border-primary-200 bg-white p-5 rounded-2xl shadow-md animate-slide-up">
          <h3 className="section-title mb-4 font-bold text-gray-800">{editingId ? 'Edit Harga' : 'Tambah / Update Harga BUMD Baru'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Pilih Komoditas</label>
              <select className="input-field" value={form.komoditasId} onChange={e => setForm({...form, komoditasId: e.target.value})}>
                <option value="">Pilih komoditas</option>
                {listKomoditas.map(k => <option key={k.id} value={k.id}>{k.gambar} {k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Harga Baru BUMD (Rp/kg)</label>
              <input type="number" placeholder="Masukkan harga (mis: 12000)" className="input-field" value={form.harga} onChange={e => setForm({...form, harga: e.target.value})} />
            </div>
            <div>
              <label className="label-field">Wilayah Acuan</label>
              <input type="text" placeholder="Mis: Jawa Barat" className="input-field" value={form.wilayah} onChange={e => setForm({...form, wilayah: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Batal</button>
            <button onClick={handleSimpan} disabled={loading} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50">
              <Save size={14} /> {loading ? 'Menyimpan...' : 'Simpan & Perbarui Harga'}
            </button>
          </div>
        </div>
      )}

      {/* Harga Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-600" /> Daftar Harga Beli Acuan Saat Ini
          </h2>
          <span className="text-xs text-gray-400">Menampilkan {filteredKomoditas.length} komoditas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                <th className="text-left px-4 py-3">Komoditas</th>
                <th className="text-left px-4 py-3">Harga Saat Ini</th>
                <th className="text-left px-4 py-3">Harga Sebelumnya</th>
                <th className="text-left px-4 py-3">Perubahan BUMD</th>
                <th className="text-left px-4 py-3">Last Update</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKomoditas.map(k => {
                const selisih = k.hargaSaatIni - k.hargaSebelumnya;
                const persen = k.hargaSebelumnya > 0 ? ((selisih / k.hargaSebelumnya) * 100).toFixed(1) : '0';
                return (
                  <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={getKomoditasImageMap(k.nama || k.gambar).url} alt={k.nama} className="w-8 h-8 rounded-xl object-cover border border-gray-100 shrink-0" />
                        <div>
                          <span className="font-bold text-gray-900">{k.nama}</span>
                          <p className="text-[10px] text-gray-400 capitalize">{k.kategori}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-emerald-600">{formatRupiah(k.hargaSaatIni)}/kg</td>
                    <td className="px-4 py-3 text-gray-500 font-medium">{formatRupiah(k.hargaSebelumnya)}/kg</td>
                    <td className={`px-4 py-3 font-bold ${selisih > 0 ? 'text-emerald-600' : selisih < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {selisih > 0 ? `+${persen}%` : `${persen}%`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-medium">{formatTanggal(k.lastUpdate)}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" onClick={() => openEdit(k)} title="Edit harga">
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histori Harga Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2"><Clock size={16} className="text-primary-600" /> Histori Rekam Perubahan Harga</h2>
          <span className="text-xs text-gray-400">Total {filteredHistori.length} rekam histori</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                  <th className="text-left px-4 py-3">Komoditas</th>
                  <th className="text-left px-4 py-3">Harga Beli</th>
                  <th className="text-left px-4 py-3">Tanggal Penetapan</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredHistori]
                  .sort((a, b) => {
                    const diff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
                    if (diff !== 0) return diff;
                    return b.id.localeCompare(a.id);
                  })
                  .map(h => {
                    const komoditas = listKomoditas.find(k => k.id === h.komoditasId);
                    return (
                      <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                        <td className="px-4 py-2.5 text-gray-800 font-medium flex items-center gap-2">
                          <img src={getKomoditasImageMap(komoditas?.nama || komoditas?.gambar).url} alt={komoditas?.nama || ''} className="w-5 h-5 rounded-md object-cover shrink-0" />
                          <span>{komoditas?.nama || 'Sayuran'}</span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-emerald-600">{formatRupiah(h.harga)}/kg</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs font-medium">{formatTanggal(h.tanggal)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManajemenHargaPage;
