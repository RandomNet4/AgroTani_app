import { Router } from 'express';
import * as lahanController from '../controllers/lahan.controller';

const router = Router();

router.post('/', lahanController.create);
router.put('/:id', lahanController.update);
router.delete('/:id', lahanController.remove);
router.post('/:id/verify', lahanController.verify);

export default router;
