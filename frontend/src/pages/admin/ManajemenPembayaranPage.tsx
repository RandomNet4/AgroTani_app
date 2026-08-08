// =====================================================
// ADMIN: MANAJEMEN PEMBAYARAN & RIWAYAT
// =====================================================

import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { CreditCard, Check, Eye, X, Download, Camera, Image, Banknote } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatRupiah, formatTanggal } from '../../utils/formatters';

const ManajemenPembayaranPage: React.FC = () => {
  const { pembayaran: listPembayaran, pickup: listPickup, payInvoice } = useData();
  const [filterStatus, setFilterStatus] = useState('semua');
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [uploadedBuktiTransfer, setUploadedBuktiTransfer] = useState<string | null>(null);
  const [, setUploadedBuktiTunai] = useState<string | null>(null);
  const [uploadedBuktiTunaiBase64, setUploadedBuktiTunaiBase64] = useState<string | null>(null);
  const [uploadedBuktiTransferBase64, setUploadedBuktiTransferBase64] = useState<string | null>(null);
  const fileInputTunai = useRef<HTMLInputElement>(null);
  const fileInputTransfer = useRef<HTMLInputElement>(null);

  const filtered = filterStatus === 'semua'
    ? listPembayaran
    : listPembayaran.filter(p => p.status === filterStatus);

  const totalDibayar = listPembayaran.filter(p => p.status === 'dibayar').reduce((s, p) => s + p.totalBayar, 0);
  const totalMenunggu = listPembayaran.filter(p => p.status === 'menunggu').length;
  const detail = listPembayaran.find(p => p.id === selected);
  const detailPickup = detail ? listPickup.find(pk => pk.id === detail.pickupId) : null;

  const beratAktual = detailPickup?.beratTimbangKg || detail?.beratKg || 0;
  const totalTagihanAktual = detail?.status === 'menunggu' ? (beratAktual * (detail?.hargaPerKg || 0)) : (detail?.totalBayar || 0);

  const handleImageUpload = (file: File, type: 'tunai' | 'transfer') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'tunai') {
        setUploadedBuktiTunaiBase64(base64);
        setUploadedBuktiTunai(file.name);
      } else {
        setUploadedBuktiTransferBase64(base64);
        setUploadedBuktiTransfer(`BJB-${Date.now().toString().slice(-8)}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKonfirmasi = async (id: string, metodeBayar: string, totalBayar: number, beratKg: number) => {
    setLoadingId(id);
    const payload: any = { status: 'dibayar', metodeBayar, totalBayar, beratKg };
    if (metodeBayar === 'TDF') {
      payload.buktiTransfer = uploadedBuktiTransferBase64 || uploadedBuktiTransfer || undefined;
    } else {
      payload.buktiTunai = uploadedBuktiTunaiBase64 || undefined;
    }
    await payInvoice(id, payload);
    setLoadingId(null);
    setSelected(null);
    setUploadedBuktiTransfer(null);
    setUploadedBuktiTransferBase64(null);
    setUploadedBuktiTunai(null);
    setUploadedBuktiTunaiBase64(null);
  };

  const handleCloseModal = () => {
    setSelected(null);
    setUploadedBuktiTransfer(null);
    setUploadedBuktiTransferBase64(null);
    setUploadedBuktiTunai(null);
    setUploadedBuktiTunaiBase64(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><CreditCard size={24} /> Manajemen Pembayaran</h1>
          <p className="text-sm text-gray-500 mt-1">Review, konfirmasi, dan kelola pembayaran petani</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card from-emerald-500 to-emerald-600">
          <p className="text-emerald-100 text-xs">Total Dibayar</p>
          <p className="text-2xl font-bold">{formatRupiah(totalDibayar)}</p>
        </div>
        <div className="stat-card from-amber-500 to-amber-600">
          <p className="text-amber-100 text-xs">Menunggu Pembayaran</p>
          <p className="text-2xl font-bold">{totalMenunggu}</p>
        </div>
        <div className="stat-card from-blue-500 to-blue-600">
          <p className="text-blue-100 text-xs">Total Transaksi</p>
          <p className="text-2xl font-bold">{listPembayaran.length}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['semua', 'menunggu', 'diproses', 'dibayar', 'gagal'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {s === 'semua' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Invoice</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Petani</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Komoditas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Berat</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Metode</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tgl Pickup</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.nomorInvoice}</td>
                  <td className="px-4 py-3 font-medium">{p.petaniNama}</td>
                  <td className="px-4 py-3">{p.komoditasNama}</td>
                  <td className="px-4 py-3">{p.beratKg > 0 ? `${p.beratKg.toLocaleString()} kg` : '-'}</td>
                  <td className="px-4 py-3 font-bold text-primary-700">{p.totalBayar > 0 ? formatRupiah(p.totalBayar) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${p.metodeBayar === 'TDF' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                      {p.metodeBayar === 'TDF' ? '🏦 Transfer' : '💵 Tunai'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatTanggal(p.tanggalPickup)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(p.id)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">Detail Pembayaran</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Invoice</span><span className="font-mono font-medium">{detail.nomorInvoice}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Petani</span><span className="font-medium">{detail.petaniNama}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Komoditas</span><span>{detail.komoditasNama}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Berat Timbang</span><span className="font-medium">{beratAktual} kg</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Harga/kg</span><span>{formatRupiah(detail.hargaPerKg)}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Total Tagihan</span><span className="font-bold text-lg text-primary-700">{formatRupiah(totalTagihanAktual)}</span></div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Metode</span>
                <span className={`font-semibold ${detail.metodeBayar === 'TDF' ? 'text-blue-600' : 'text-orange-600'}`}>
                  {detail.metodeBayar === 'TDF' ? '🏦 Transfer Bank (TDF)' : '💵 Tunai (Cash)'}
                </span>
              </div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Status</span><StatusBadge status={detail.status} size="sm" /></div>
            </div>

            {(detail.status === 'menunggu' || detail.status === 'diproses') && (
              <div className="mt-6 space-y-4">
                {detail.metodeBayar === 'TDF' ? (
                  <div>
                    <label className="label-field flex items-center gap-1.5 mb-2 text-sm font-semibold text-gray-700">
                      <Banknote size={14} className="text-blue-600" /> Upload Foto Bukti Transfer Bank
                    </label>
                    <input ref={fileInputTransfer} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'transfer'); }} />
                    {uploadedBuktiTransferBase64 ? (
                      <div className="relative rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">BUKTI TRANSFER</div>
                        <button onClick={() => { setUploadedBuktiTransfer(null); setUploadedBuktiTransferBase64(null); }}
                          className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow border border-gray-100 text-gray-500 hover:text-red-500">
                          <X size={12} />
                        </button>
                        <img src={uploadedBuktiTransferBase64} alt="Bukti Transfer" className="w-full h-48 object-contain bg-gray-50" />
                        <div className="p-3 bg-blue-50 text-xs text-blue-700 font-medium text-center">Foto bukti transfer siap dikonfirmasi ✓</div>
                      </div>
                    ) : (
                      <div onClick={() => fileInputTransfer.current?.click()}
                        className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 transition-all">
                        <Image className="mx-auto text-blue-400 mb-2" size={28} />
                        <p className="text-sm text-blue-700 font-bold">Upload Foto Bukti Transfer</p>
                        <p className="text-[10px] text-blue-400 mt-0.5">Klik untuk memilih foto (JPG/PNG)</p>
                      </div>
                    )}
                    {!uploadedBuktiTransferBase64 && (
                      <p className="text-[10px] text-blue-400 text-center mt-1">* Wajib upload foto bukti transfer sebelum konfirmasi</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="label-field flex items-center gap-1.5 mb-2 text-sm font-semibold text-gray-700">
                      <Camera size={14} className="text-orange-600" /> Foto Kertas Bukti Pembayaran Tunai
                    </label>
                    <input ref={fileInputTunai} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'tunai'); }} />
                    {uploadedBuktiTunaiBase64 ? (
                      <div className="relative rounded-2xl overflow-hidden border border-orange-200 shadow-sm">
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">BUKTI TUNAI</div>
                        <button onClick={() => { setUploadedBuktiTunai(null); setUploadedBuktiTunaiBase64(null); }}
                          className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow border border-gray-100 text-gray-500 hover:text-red-500">
                          <X size={12} />
                        </button>
                        <img src={uploadedBuktiTunaiBase64} alt="Bukti Tunai" className="w-full h-48 object-contain bg-gray-50" />
                        <div className="p-3 bg-orange-50 text-xs text-orange-700 font-medium text-center">Foto bukti tunai siap dikonfirmasi ✓</div>
                      </div>
                    ) : (
                      <div onClick={() => fileInputTunai.current?.click()}
                        className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 bg-orange-50/30 hover:bg-orange-50/60 transition-all">
                        <Camera className="mx-auto text-orange-400 mb-2" size={28} />
                        <p className="text-sm text-orange-700 font-bold">Upload Foto Kertas Bukti Tunai</p>
                        <p className="text-[10px] text-orange-400 mt-0.5">Foto struk/kertas bukti pembayaran (JPG/PNG)</p>
                      </div>
                    )}
                    <div className="mt-3 bg-orange-50 border border-orange-100 p-3 rounded-xl">
                      <p className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                        <Check size={16}/> Konfirmasi Uang Tunai
                      </p>
                      <p className="text-xs text-orange-700 mt-1">Pastikan uang tunai <strong>{formatRupiah(totalTagihanAktual)}</strong> telah diserahkan & dihitung bersama petani di lokasi.</p>
                    </div>
                    {!uploadedBuktiTunaiBase64 && (
                      <p className="text-[10px] text-orange-400 text-center mt-1">* Wajib upload foto bukti tunai sebelum konfirmasi</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleKonfirmasi(detail.id, detail.metodeBayar, totalTagihanAktual, beratAktual)}
                  disabled={
                    loadingId === detail.id ||
                    (detail.metodeBayar === 'TDF' && !uploadedBuktiTransferBase64) ||
                    (detail.metodeBayar === 'Cash' && !uploadedBuktiTunaiBase64)
                  }
                  className="btn-primary w-full text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {loadingId === detail.id ? 'Memproses...' : 'Verifikasi & Konfirmasi Pembayaran'}
                </button>
              </div>
            )}

            {detail.status === 'dibayar' && (
              <div className="mt-4 space-y-3">
                {detail.buktiTransfer && (
                  <div className="rounded-xl overflow-hidden border border-blue-200 shadow-sm">
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-2 flex items-center gap-1.5">
                      <Banknote size={13} /> Bukti Transfer Bank Terverifikasi
                    </div>
                    {detail.buktiTransfer.startsWith('data:image') ? (
                      <img src={detail.buktiTransfer} alt="Bukti Transfer" className="w-full max-h-64 object-contain bg-white" />
                    ) : (
                      <div className="bg-white p-4 text-center space-y-1.5">
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Transfer Berhasil</p>
                        <p className="text-xl font-bold text-gray-800">{formatRupiah(detail.totalBayar)}</p>
                        <div className="text-[10px] text-gray-500 text-left border-t pt-2 mt-2 space-y-0.5">
                          <p><span className="text-gray-400">Pengirim:</span> BUMD AGRO JABAR</p>
                          <p><span className="text-gray-400">Penerima:</span> {detail.petaniNama}</p>
                          <p><span className="text-gray-400">Bank:</span> Bank BJB</p>
                          <p><span className="text-gray-400">No. Ref:</span> {detail.buktiTransfer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(detail as any).buktiTunai && (
                  <div className="rounded-xl overflow-hidden border border-orange-200 shadow-sm">
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-2 flex items-center gap-1.5">
                      <Camera size={13} /> Foto Bukti Pembayaran Tunai Terverifikasi
                    </div>
                    <img src={(detail as any).buktiTunai} alt="Bukti Tunai" className="w-full max-h-64 object-contain bg-white" />
                    <div className="bg-orange-50 p-2 text-center">
                      <p className="text-[10px] text-orange-700 font-medium">Tunai {formatRupiah(detail.totalBayar)} — Lunas</p>
                    </div>
                  </div>
                )}
                {!detail.buktiTransfer && !(detail as any).buktiTunai && (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                    <p className="text-xs text-emerald-800">Pembayaran telah diverifikasi dan lunas.</p>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1"><Download size={14} /> Invoice PDF</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenPembayaranPage;
