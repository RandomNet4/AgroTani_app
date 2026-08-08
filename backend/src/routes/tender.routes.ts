import { Router } from 'express';
import * as tenderController from '../controllers/tender.controller';

import { apiKeyMiddleware } from '../middleware/api-key.middleware';

const router = Router();

router.post('/tender', tenderController.create);
router.post('/webhook/permintaan-pengadaan', apiKeyMiddleware, tenderController.handleWebhook);
router.post('/tender-petani', tenderController.registerPetani);
router.post('/tender-petani/:id/verify', tenderController.verifyPetani);
router.put('/tender/:id/verify-admin', tenderController.verifyAdmin);
router.post('/purchase-orders', tenderController.createPO);
router.put('/purchase-orders/:id', tenderController.updatePO);
router.delete('/purchase-orders/:id', tenderController.deletePO);
router.post('/purchase-orders/:id/alokasi', tenderController.alokasikanPO);

export default router;
