export function mapLahan(l: any) {
  return {
    id: l.id,
    petaniId: l.petaniId,
    namaLahan: l.namaLahan,
    lokasi: {
      lat: l.latitude,
      lng: l.longitude,
      alamat: l.alamat,
    },
    luasHektar: l.luasHektar,
    jenisLahan: l.jenisLahan,
    kecamatan: l.kecamatan,
    kabupaten: l.kabupaten,
    statusVerifikasi: l.statusVerifikasi,
    fotoLahan: l.fotoLahan,
  };
}

export function mapTanamanAktif(t: any) {
  return {
    id: t.id,
    petaniId: t.petaniId,
    lahanId: t.lahanId,
    komoditasId: t.komoditasId,
    komoditasNama: t.komoditasNama,
    tanggalTanam: t.tanggalTanam,
    estimasiPanen: t.estimasiPanen,
    estimasiHasilKg: t.estimasiHasilKg,
    fotoTanaman: t.fotoTanaman,
    statusVerifikasi: t.statusVerifikasi,
    catatanInspeksi: t.catatanInspeksi,
    fotoInspeksi: t.fotoInspeksi,
    catatan: t.catatan ?? undefined,
    luasLahanDigunakan: t.luasLahanDigunakan ?? undefined,
    jarakTanam: t.jarakTanam ?? undefined,
    kebutuhanBibit: t.kebutuhanBibit ?? undefined,
    ...(t.latitudeInspeksi !== null && t.longitudeInspeksi !== null ? {
      gpsInspeksi: {
        lat: t.latitudeInspeksi,
        lng: t.longitudeInspeksi,
      }
    } : {})
  };
}

export function mapPickup(p: any) {
  return {
    id: p.id,
    pengajuanJualId: p.pengajuanJualId,
    petaniId: p.petaniId,
    petaniNama: p.petaniNama,
    komoditasNama: p.komoditasNama,
    alamatPickup: p.alamatPickup,
    tanggalPickup: p.tanggalPickup,
    driverNama: p.driverNama,
    driverNoHp: p.driverNoHp,
    armada: p.armada,
    platNomor: p.platNomor,
    status: p.status,
    beratTimbangKg: p.beratTimbangKg ?? undefined,
    fotoTimbang: p.fotoTimbang ?? undefined,
    fotoPanen: p.fotoPanen ?? undefined,
    waktuBerangkat: p.waktuBerangkat ?? undefined,
    waktuTiba: p.waktuTiba ?? undefined,
    waktuSelesai: p.waktuSelesai ?? undefined,
    ...(p.latitude !== null && p.longitude !== null ? {
      gpsLokasi: {
        lat: p.latitude,
        lng: p.longitude,
      }
    } : {})
  };
}
