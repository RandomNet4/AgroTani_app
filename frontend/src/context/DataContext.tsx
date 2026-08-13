import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Petani, Lahan, TanamanAktif, Komoditas, HargaKomoditas, HistoriHarga,
  PengajuanJual, Pickup, Pembayaran, Tender, TenderPetani,
  ArtikelEdukasi, ProdukBibitPupuk, QualityControl, Notifikasi,
  RekomendasiTanam, JejakPanen, BukuKas, PurchaseOrder
} from '../types';
import { kodePickup, kodePenjualan, kodePembayaran, kodeInvoice, kodeNotifikasi } from '../utils/kode';

interface DataContextType {
  petani: Petani[];
  lahan: Lahan[];
  tanamanAktif: TanamanAktif[];
  komoditas: Komoditas[];
  hargaKomoditas: HargaKomoditas[];
  historiHarga: HistoriHarga[];
  pengajuanJual: PengajuanJual[];
  pickup: Pickup[];
  pembayaran: Pembayaran[];
  tender: Tender[];
  tenderPetani: TenderPetani[];
  artikelEdukasi: ArtikelEdukasi[];
  produkBibitPupuk: ProdukBibitPupuk[];
  qualityControl: QualityControl[];
  notifikasi: Notifikasi[];
  rekomendasiTanam: RekomendasiTanam[];
  jejakPanen: JejakPanen[];
  bukuKas: BukuKas[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  currentUser: Petani | null;
  currentAdmin: { nama: string; role: string };

  // Actions
  refreshData: () => Promise<void>;
  loginPetani: (phone: string, password: string) => Promise<boolean>;
  logoutPetani: () => void;
  registerPetani: (data: any) => Promise<boolean>;
  verifyPetani: (id: string, status: string, catatanVerifikasi?: string, gudangTujuanId?: string, gudangTujuanNama?: string) => Promise<boolean>;
  addLahan: (data: any) => Promise<boolean>;
  editLahan: (id: string, data: any) => Promise<boolean>;
  deleteLahan: (id: string) => Promise<boolean>;
  verifyLahan: (id: string, status: string) => Promise<boolean>;
  addTanaman: (data: any) => Promise<boolean>;
  editTanaman: (id: string, data: any) => Promise<boolean>;
  deleteTanaman: (id: string) => Promise<boolean>;
  inspectTanaman: (id: string, data: any) => Promise<boolean>;
  addPengajuanJual: (data: any) => Promise<boolean>;
  verifyPengajuanJual: (id: string, status: string, catatanAdmin?: string) => Promise<boolean>;
  schedulePickup: (data: any) => Promise<boolean>;
  updatePickupStatus: (id: string, data: any) => Promise<boolean>;
  addQualityControl: (data: any) => Promise<boolean>;
  payInvoice: (id: string, data: any) => Promise<boolean>;
  addTender: (data: any) => Promise<boolean>;
  verifyTenderAdmin: (id: string, status: string, alasanPenolakan?: string) => Promise<boolean>;
  applyTender: (data: any) => Promise<boolean>;
  verifyTenderPetani: (id: string, status: string, catatanAdmin?: string) => Promise<boolean>;
  addBukuKas: (data: any) => Promise<boolean>;
  addEdukasi: (data: any) => Promise<boolean>;
  buyBibitPupuk: (items: any[], totalHarga: number) => Promise<boolean>;
  readNotifikasi: (id: string) => Promise<boolean>;
  addJejakPanenTimeline: (id: string, data: any) => Promise<boolean>;
  updateHargaKomoditas: (data: any) => Promise<boolean>;
  updatePetani: (id: string, data: any) => Promise<boolean>;
  addPurchaseOrder: (data: any) => Promise<boolean>;
  editPurchaseOrder: (id: string, data: any) => Promise<boolean>;
  deletePurchaseOrder: (id: string) => Promise<boolean>;
  alokasikanPO: (poId: string, data: any) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<{
    petani: Petani[];
    lahan: Lahan[];
    tanamanAktif: TanamanAktif[];
    komoditas: Komoditas[];
    hargaKomoditas: HargaKomoditas[];
    historiHarga: HistoriHarga[];
    pengajuanJual: PengajuanJual[];
    pickup: Pickup[];
    pembayaran: Pembayaran[];
    tender: Tender[];
    tenderPetani: TenderPetani[];
    artikelEdukasi: ArtikelEdukasi[];
    produkBibitPupuk: ProdukBibitPupuk[];
    qualityControl: QualityControl[];
    notifikasi: Notifikasi[];
    rekomendasiTanam: RekomendasiTanam[];
    jejakPanen: JejakPanen[];
    bukuKas: BukuKas[];
    purchaseOrders: PurchaseOrder[];
  }>({
    petani: [],
    lahan: [],
    tanamanAktif: [],
    komoditas: [],
    hargaKomoditas: [],
    historiHarga: [],
    pengajuanJual: [],
    pickup: [],
    pembayaran: [],
    tender: [],
    tenderPetani: [],
    artikelEdukasi: [],
    produkBibitPupuk: [],
    qualityControl: [],
    notifikasi: [],
    rekomendasiTanam: [],
    jejakPanen: [],
    bukuKas: [],
    purchaseOrders: [],
  });

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Petani | null>(null);
  const [currentAdmin] = useState({ nama: 'Admin Agro', role: 'Super Admin' });

  const refreshData = async () => {
    try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/all-data', { headers });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);

      // Set default current user
      const loggedIn = localStorage.getItem('petaniId');
      if (loggedIn && json.petani.length > 0) {
        const found = json.petani.find((p: any) => p.id === loggedIn);
        if (found) {
          setCurrentUser(found);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ─────────────────────────────────────────────────────
    // Initial fetch saat pertama load
    // ─────────────────────────────────────────────────────
    refreshData();

    let eventSource: EventSource | null = null;
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    // ─────────────────────────────────────────────────────
    // Fungsi untuk memulai koneksi SSE
    // ─────────────────────────────────────────────────────
    const startSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('connected', () => {
        console.log('[SSE] ✅ Terhubung ke server real-time');
        // Matikan polling jika ada, karena SSE sudah aktif
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      });

      eventSource.addEventListener('data-changed', () => {
        console.log('[SSE] 🔄 Data berubah, refresh otomatis...');
        refreshData();
      });

      eventSource.onerror = () => {
        console.warn('[SSE] ⚠️ Koneksi SSE terputus, beralih ke polling...');

        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        // Mulai polling fallback tiap 30 detik
        if (!pollingInterval) {
          pollingInterval = setInterval(() => {
            console.log('[Polling] 🔄 Refresh data...');
            refreshData();
          }, 30_000);
        }

        // Coba reconnect SSE setelah 10 detik
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            console.log('[SSE] 🔁 Mencoba reconnect...');
            startSSE();
          }, 10_000);
        }
      };
    };

    // Mulai SSE
    startSSE();

    // ─────────────────────────────────────────────────────
    // Cleanup saat komponen unmount
    // ─────────────────────────────────────────────────────
    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      console.log('[SSE] Koneksi ditutup (unmount)');
    };
  }, []);


  const loginPetani = async (phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/petani/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || 'Nomor telepon tidak terdaftar atau kata sandi salah.');
      }
      const { token, petani } = await res.json();
      setCurrentUser(petani);
      localStorage.setItem('token', token);
      localStorage.setItem('petaniId', petani.id_petani || petani.id);
      return true;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const registerPetani = async (petaniData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/petani/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petaniData),
      });
      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || 'Pendaftaran gagal. Periksa kembali data Anda.');
      }
      const { token, petani } = await res.json();
      setCurrentUser(petani);
      localStorage.setItem('token', token);
      localStorage.setItem('petaniId', petani.id_petani || petani.id);
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const verifyPetani = async (
    id: string,
    status: string,
    catatanVerifikasi?: string,
    gudangTujuanId?: string,
    gudangTujuanNama?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/petani/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatanVerifikasi, gudangTujuanId, gudangTujuanNama }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addLahan = async (lahanData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/lahan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lahanData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const editLahan = async (id: string, lahanData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lahan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lahanData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteLahan = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lahan/${id}`, { method: 'DELETE' });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const verifyLahan = async (id: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lahan/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addTanaman = async (tanamanData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/tanaman-aktif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tanamanData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const editTanaman = async (id: string, tanamanData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tanaman-aktif/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tanamanData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteTanaman = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tanaman-aktif/${id}`, { method: 'DELETE' });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const inspectTanaman = async (id: string, inspectData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tanaman-aktif/${id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addPengajuanJual = async (pengajuanData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/pengajuan-jual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pengajuanData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const verifyPengajuanJual = async (id: string, status: string, catatanAdmin?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/pengajuan-jual/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatanAdmin }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const schedulePickup = async (pickupData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updatePickupStatus = async (id: string, statusData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/pickup/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addQualityControl = async (qcData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/qc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qcData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const payInvoice = async (id: string, payData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payData }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addTender = async (data: any) => {
    try {
      const res = await fetch('/api/tender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const verifyTenderAdmin = async (id: string, status: string, alasanPenolakan?: string) => {
    try {
      const res = await fetch(`/api/tender/${id}/verify-admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, alasanPenolakan }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const applyTender = async (applyData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/tender-petani', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const verifyTenderPetani = async (id: string, status: string, catatanAdmin?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tender-petani/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatanAdmin }),
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.warn('API verifyTenderPetani fallback to local state:', err);
    }

    // Local state update & synchronization
    setData(prev => {
      const updatedTenderPetani = prev.tenderPetani.map(tp => 
        tp.id === id ? { ...tp, statusApproval: status as any, catatanAdmin } : tp
      );

      const targetTP = prev.tenderPetani.find(tp => tp.id === id);

      const updatedPengajuanJual = prev.pengajuanJual.map(pj => {
        if (targetTP && (pj.catatanAdmin?.includes(targetTP.tenderId) || pj.catatanPetani?.includes(targetTP.tenderId) || pj.komoditasNama === targetTP.tenderId)) {
          return { ...pj, status: status === 'selesai' ? 'selesai' : status === 'survey' ? 'survey' : 'approved' as any };
        }
        return pj;
      });

      const updatedTanamanAktif = prev.tanamanAktif.map(t => {
        if (targetTP && t.petaniId === targetTP.petaniId && tenderInfo && t.komoditasNama.toLowerCase().includes(tenderInfo.komoditasNama.toLowerCase())) {
          if (status === 'selesai') {
            return { ...t, statusVerifikasi: 'selesai_panen' as any };
          }
        }
        return t;
      });

      if (!targetTP) {
        return { 
          ...prev, 
          tenderPetani: updatedTenderPetani,
          pengajuanJual: updatedPengajuanJual,
          tanamanAktif: updatedTanamanAktif
        };
      }

      const tenderInfo = prev.tender.find(t => t.id === targetTP.tenderId);
      const komoditasNama = tenderInfo?.komoditasNama || 'Komoditas PO';
      const hargaPerKg = tenderInfo?.hargaPerKg || 12000;
      const beratKg = targetTP.kesanggupanKg || 100;
      const totalBayar = beratKg * hargaPerKg;

      let updatedPickup = [...prev.pickup];
      let updatedPembayaran = [...prev.pembayaran];
      let updatedNotifikasi = [...prev.notifikasi];

      if (status === 'selesai') {
        const pkId = kodePickup(komoditasNama);
        const invNum = kodeInvoice(komoditasNama);
        const payId = kodePembayaran(komoditasNama);

        const newPk: Pickup = {
          id: pkId,
          pengajuanJualId: kodePenjualan(komoditasNama),
          petaniId: targetTP.petaniId,
          petaniNama: targetTP.petaniNama,
          komoditasNama,
          alamatPickup: 'Dikirim ke Gudang Cianjur',
          tanggalPickup: new Date().toISOString().split('T')[0],
          driverNama: 'Kurir Pemenuhan PO Gudang',
          driverNoHp: '-',
          armada: 'Armada Logistik Gudang',
          platNomor: 'D 8841 AG',
          status: 'selesai',
          beratTimbangKg: beratKg
        };
        updatedPickup.unshift(newPk);

        const newPay: Pembayaran = {
          id: payId,
          pickupId: pkId,
          petaniId: targetTP.petaniId,
          petaniNama: targetTP.petaniNama,
          komoditasNama,
          beratKg,
          hargaPerKg,
          totalBayar,
          tanggalPickup: new Date().toISOString().split('T')[0],
          status: 'diproses', // Masuk ke antrean pembayaran Admin yang menunggu konfirmasi!
          metodeBayar: 'TDF',
          nomorInvoice: invNum,
          dibuatOleh: 'Sistem PO Gudang'
        };
        updatedPembayaran.unshift(newPay);

        updatedNotifikasi.unshift({
          id: kodeNotifikasi(),
          judul: 'Penyerahan Hasil Panen PO (Menunggu Pembayaran)',
          pesan: `[PO Gudang] Hasil panen ${komoditasNama} (${beratKg}kg) dari ${targetTP.petaniNama} telah diserahkan. Tagihan Rp ${totalBayar.toLocaleString('id-ID')} masuk ke antrean Pembayaran Admin.`,
          tanggal: new Date().toISOString().split('T')[0],
          dibaca: false,
          tipe: 'info'
        });
      }

      return {
        ...prev,
        tenderPetani: updatedTenderPetani,
        pengajuanJual: updatedPengajuanJual,
        tanamanAktif: updatedTanamanAktif,
        pickup: updatedPickup,
        pembayaran: updatedPembayaran,
        notifikasi: updatedNotifikasi
      };
    });

    return true;
  };

  const addBukuKas = async (kasData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/buku-kas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kasData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addEdukasi = async (eduData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/edukasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eduData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const buyBibitPupuk = async (items: any[], totalHarga: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/bibit-pupuk/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalHarga, petaniId: currentUser?.id }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const readNotifikasi = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/notifikasi/${id}/read`, { method: 'POST' });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addJejakPanenTimeline = async (id: string, timelineData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/jejak-panen/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timelineData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateHargaKomoditas = async (hargaData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/harga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hargaData, dibuatOleh: currentAdmin.nama }),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updatePetani = async (id: string, updateData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/petani/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) return false;
      
      // Update local storage and currentUser if the updated farmer is the logged in one
      const json = await res.json();
      if (currentUser && currentUser.id === id) {
        setCurrentUser(json);
      }
      
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addPurchaseOrder = async (poData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const editPurchaseOrder = async (id: string, poData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deletePurchaseOrder = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const alokasikanPO = async (poId: string, allocationData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/alokasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocationData),
      });
      if (!res.ok) return false;
      await refreshData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logoutPetani = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('petaniId');
  };

  return (
    <DataContext.Provider value={{
      ...data,
      loading,
      currentUser,
      currentAdmin,
      refreshData,
      loginPetani,
      logoutPetani,
      registerPetani,
      verifyPetani,
      addLahan,
      editLahan,
      deleteLahan,
      verifyLahan,
      addTanaman,
      editTanaman,
      deleteTanaman,
      inspectTanaman,
      addPengajuanJual,
      verifyPengajuanJual,
      schedulePickup,
      updatePickupStatus,
      addQualityControl,
      payInvoice,
      addTender,
      verifyTenderAdmin,
      applyTender,
      verifyTenderPetani,
      addBukuKas,
      addEdukasi,
      buyBibitPupuk,
      readNotifikasi,
      addJejakPanenTimeline,
      updateHargaKomoditas,
      updatePetani,
      addPurchaseOrder,
      editPurchaseOrder,
      deletePurchaseOrder,
      alokasikanPO,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
