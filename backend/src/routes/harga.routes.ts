import { Router } from 'express';
import * as hargaController from '../controllers/harga.controller';

const router = Router();

router.get('/', hargaController.getHarga);
router.get('/histori', hargaController.getHistori);
router.post('/', hargaController.updateHarga);

export default router;
