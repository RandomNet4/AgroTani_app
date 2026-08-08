// =====================================================
// FORM TAMBAH LAHAN - PETANI (DENGAN MAP LEAFLET & DUAL UPLOAD)
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Upload, Info, CheckCircle2, X, Image as ImageIcon, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { kodeLahan } from '../../utils/kode';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths with unpkg CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FormTambahLahanPage: React.FC = () => {
  const navigate = useNavigate();
  const { addLahan, currentUser } = useData();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields State (Sama seperti pada Registrasi Petani Step 2)
  const [namaLahan, setNamaLahan] = useState('');
  const [jenisLahan, setJenisLahan] = useState('');
  const [luasHektar, setLuasHektar] = useState('');
  const [latitude, setLatitude] = useState('-6.8219');
  const [longitude, setLongitude] = useState('107.1396'); // Default Cianjur coordinates
  const [alamatLahan, setAlamatLahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupaten, setKabupaten] = useState('Cianjur');

  // File Upload State (Foto Lahan & Bukti Kepemilikan)
  const fotoLahanInputRef = useRef<HTMLInputElement>(null);
  const buktiInputRef = useRef<HTMLInputElement>(null);
  const [fotoLahan, setFotoLahan] = useState<string | null>(null);
  const [buktiKepemilikan, setBuktiKepemilikan] = useState<string | null>(null);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = parseFloat(latitude) || -6.8219;
    const initialLng = parseFloat(longitude) || 107.1396;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLatitude(position.lat.toFixed(6));
      setLongitude(position.lng.toFixed(6));
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sync manual coordinate input changes with map marker
  const handleCoordChange = (latVal: string, lngVal: string) => {
    setLatitude(latVal);
    setLongitude(lngVal);

    const latNum = parseFloat(latVal);
    const lngNum = parseFloat(lngVal);

    if (!isNaN(latNum) && !isNaN(lngNum) && markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([latNum, lngNum]);
      mapInstanceRef.current.panTo([latNum, lngNum]);
    }
  };

  // Upload Handlers
  const handleFotoLahanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file foto lahan terlalu besar! Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoLahan(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBuktiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file bukti kepemilikan terlalu besar! Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiKepemilikan(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLahan || !jenisLahan || !luasHektar || !latitude || !longitude || !alamatLahan || !kecamatan) {
      alert('Silakan isi seluruh kolom data lahan wajib dan pilih lokasi titik GPS pada peta.');
      return;
    }

    setLoading(true);
    const id = kodeLahan();
    const success = await addLahan({
      id,
      petaniId: currentUser?.id || '',
      namaLahan,
      jenisLahan,
      luasHektar: parseFloat(luasHektar),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      alamat: alamatLahan,
      alamatLahan,
      kecamatan,
      kabupaten,
      fotoLahan: fotoLahan || (jenisLahan === 'sawah' ? '🌾' : '🥬'),
      buktiKepemilikan: buktiKepemilikan || null,
      statusVerifikasi: 'pending'
    });

    setLoading(false);
    if (success) {
      setShowSuccess(true);
    } else {
      alert('Gagal menambahkan lahan. Silakan coba lagi.');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-600 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pengajuan Terkirim!</h2>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed max-w-md">
          Lahan <b>{namaLahan}</b> berhasil didaftarkan. Tim Agro Jabar akan melakukan <b>verifikasi data & survey lapangan</b> sebelum status lahan menjadi <b>Terverifikasi</b>.
        </p>
        <button
          onClick={() => navigate('/petani/data-lahan')}
          className="w-full max-w-sm py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all active:scale-95"
        >
          Kembali ke Data Lahan
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-700 to-primary-600 text-white px-4 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-bold text-lg">Tambah Lahan Baru</h1>
        </div>
        <p className="text-primary-100 text-xs ml-11">Daftarkan aset lahan & lokasi peta Anda</p>
      </div>

      <div className="px-4 -mt-4">
        {/* Verification Info Alert */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 mb-4 shadow-sm">
          <Info className="text-amber-500 shrink-0" size={20} />
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            <b>Penting:</b> Lahan yang didaftarkan akan diverifikasi oleh Tim Agro Jabar melalui pengecekan dokumen kepemilikan dan survei lokasi untuk memastikan keaslian data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card 1: Informasti Utama Lahan */}
          <div className="card space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <FileText size={16} className="text-primary-600" />
              Informasi Lahan
            </h3>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                Nama Lahan <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Misal: Sawah Sarongge Utara"
                className="input-field"
                value={namaLahan}
                onChange={(e) => setNamaLahan(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Jenis Lahan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="input-field"
                  value={jenisLahan}
                  onChange={(e) => setJenisLahan(e.target.value)}
                >
                  <option value="">Pilih jenis lahan</option>
                  <option value="sawah">Sawah</option>
                  <option value="kebun">Kebun</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Luas (Hektar) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Contoh: 2.5"
                  className="input-field"
                  value={luasHektar}
                  onChange={(e) => setLuasHektar(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Lokasi GPS & Map OpenStreetMap */}
          <div className="card space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <MapPin size={16} className="text-primary-600" />
              Lokasi GPS & Peta Lahan
            </h3>

            <div>
              <label className="text-[11px] text-gray-600 font-semibold mb-1.5 block">
                Peta OpenStreetMap (Geser penanda / klik lokasi lahan)
              </label>
              <div
                ref={mapContainerRef}
                className="bg-gray-100 rounded-2xl h-52 mb-3 relative border border-gray-200 overflow-hidden z-0 shadow-inner"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold ml-0.5 mb-1 block">Latitude</label>
                  <input
                    type="text"
                    placeholder="Latitude"
                    className="input-field"
                    value={latitude}
                    onChange={(e) => handleCoordChange(e.target.value, longitude)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold ml-0.5 mb-1 block">Longitude</label>
                  <input
                    type="text"
                    placeholder="Longitude"
                    className="input-field"
                    value={longitude}
                    onChange={(e) => handleCoordChange(latitude, e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                Alamat Lokasi Lahan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Masukkan alamat lengkap lokasi lahan"
                className="input-field"
                value={alamatLahan}
                onChange={(e) => setAlamatLahan(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Nama Kecamatan"
                  className="input-field"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Kabupaten <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Kabupaten"
                  className="input-field bg-gray-100"
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Upload Foto Lahan */}
          <div className="card space-y-3">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <ImageIcon size={16} className="text-primary-600" />
              Upload Foto Lahan
            </h3>
            
            <input
              type="file"
              ref={fotoLahanInputRef}
              onChange={handleFotoLahanChange}
              accept="image/*"
              className="hidden"
            />

            {fotoLahan ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                <img src={fotoLahan} alt="Foto Lahan" className="w-full h-44 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setFotoLahan(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors shadow-md"
                >
                  <X size={16} />
                </button>
                <div className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => fotoLahanInputRef.current?.click()}
                    className="text-xs text-primary-600 font-bold hover:text-primary-700 transition-colors"
                  >
                    Ganti Foto Lahan
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fotoLahanInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-300 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100/50"
              >
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 font-medium">Unggah Foto Fisik Lahan</p>
                <p className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG (Maks 5MB)</p>
              </div>
            )}
          </div>

          {/* Card 4: Upload Bukti Kepemilikan Lahan */}
          <div className="card space-y-3">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Upload size={16} className="text-primary-600" />
              Upload Bukti Kepemilikan Lahan
            </h3>

            <input
              type="file"
              ref={buktiInputRef}
              onChange={handleBuktiChange}
              accept="image/*"
              className="hidden"
            />

            {buktiKepemilikan ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                <img src={buktiKepemilikan} alt="Bukti Kepemilikan" className="w-full h-44 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setBuktiKepemilikan(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors shadow-md"
                >
                  <X size={16} />
                </button>
                <div className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => buktiInputRef.current?.click()}
                    className="text-xs text-primary-600 font-bold hover:text-primary-700 transition-colors"
                  >
                    Ganti Bukti / Dokumen
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => buktiInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-300 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100/50"
              >
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 font-medium">Unggah SPPT / Sertifikat / Akta / Bukti Sewa</p>
                <p className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG (Maks 5MB)</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Mengirim Data...' : 'Ajukan Pendaftaran Lahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormTambahLahanPage;
