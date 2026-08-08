import { Router } from 'express';
import * as tanamanController from '../controllers/tanaman.controller';

const router = Router();

router.post('/', tanamanController.create);
router.put('/:id', tanamanController.update);
router.delete('/:id', tanamanController.remove);
router.post('/:id/inspect', tanamanController.inspect);

export default router;
