import { Router } from 'express';
import * as miscController from '../controllers/misc.controller';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agro_tani_secret_key_123';

// Middleware optional: parse JWT jika ada tapi tidak error jika tidak ada
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      if (decoded.role === 'petani') {
        req.petaniId = decoded.id;
      }
    } catch (_) {
      // Token invalid — abaikan, lanjut tanpa petaniId
    }
  }
  next();
};

const router = Router();

router.get('/all-data', optionalAuth, miscController.getAll);
router.post('/edukasi', miscController.createEdu);
router.post('/bibit-pupuk/buy', miscController.buy);
router.post('/notifikasi/:id/read', miscController.readNotif);
router.post('/jejak-panen/:id/timeline', miscController.addJejakTimeline);

export default router;
