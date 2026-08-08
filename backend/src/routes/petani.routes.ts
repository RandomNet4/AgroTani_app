import { Router } from 'express';
import * as petaniController from '../controllers/petani.controller';

const router = Router();

router.post('/login', petaniController.login);
router.post('/admin/login', petaniController.loginAdmin);
router.post('/register', petaniController.register);
router.put('/:id', petaniController.updateProfile);
router.post('/:id/verify', petaniController.verify);

export default router;
