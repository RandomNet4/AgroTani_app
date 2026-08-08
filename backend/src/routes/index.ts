import { Router } from 'express';
import petaniRoutes from './petani.routes';
import lahanRoutes from './lahan.routes';
import tanamanRoutes from './tanaman.routes';
import hargaRoutes from './harga.routes';
import transaksiRoutes from './transaksi.routes';
import tenderRoutes from './tender.routes';
import miscRoutes from './misc.routes';

const router = Router();

router.use('/petani', petaniRoutes);
router.use('/lahan', lahanRoutes);
router.use('/tanaman-aktif', tanamanRoutes);
router.use('/harga', hargaRoutes);
router.use('/', transaksiRoutes); // Handles flat routes: /pengajuan-jual, /pickup, /qc, /pembayaran, /buku-kas
router.use('/', tenderRoutes);    // Handles flat routes: /tender, /tender-petani, /purchase-orders, /webhook/permintaan-pengadaan
router.use('/', miscRoutes);      // Handles flat routes: /all-data, /edukasi, /bibit-pupuk/buy, /notifikasi, /jejak-panen

export default router;
