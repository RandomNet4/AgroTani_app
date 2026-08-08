import { Router } from 'express';
import * as transaksiController from '../controllers/transaksi.controller';

const router = Router();

import { apiKeyMiddleware } from '../middleware/api-key.middleware';

router.post('/pengajuan-jual', transaksiController.createPengajuan);
router.post('/pengajuan-jual/:id/verify', transaksiController.verifyPengajuan);
router.post('/pickup', transaksiController.createPickup);
router.post('/pickup/:id/status', transaksiController.updatePickupStatus);
router.post('/qc', transaksiController.createQC);
router.post('/pembayaran', transaksiController.pay);
router.post('/buku-kas', transaksiController.createBukuKas);

// Webhook dari Gudang
router.post('/webhook/penerimaan-dari-gudang', apiKeyMiddleware, transaksiController.handleWebhookPenerimaanGudang);

export default router;
