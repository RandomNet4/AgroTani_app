import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { addClient, removeClient, broadcastDataChanged, broadcastKeepAlive, getClientCount } from './utils/sse';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─────────────────────────────────────────────────────
// SSE BROADCAST MIDDLEWARE (harus sebelum route registration)
// Intercept res.json untuk setiap mutasi (POST/PUT/DELETE) yang sukses (2xx)
// lalu broadcast event "data-changed" ke semua client yang terkoneksi
// ─────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method?.toUpperCase();
  const isMutation = ['POST', 'PUT', 'DELETE'].includes(method);

  if (isMutation) {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const result = originalJson(body);
      // Hanya broadcast jika response sukses (2xx) bukan auth/login endpoint
      if (res.statusCode >= 200 && res.statusCode < 300) {
        broadcastDataChanged();
      }
      return result;
    };
  }

  next();
});

// ─────────────────────────────────────────────────────
// SSE ENDPOINT: GET /api/events
// Browser subscribe ke sini untuk menerima update real-time
// ─────────────────────────────────────────────────────
app.get('/api/events', (req: Request, res: Response) => {
  // Set header SSE yang diperlukan
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Penting untuk Nginx agar tidak buffer SSE
  res.flushHeaders();

  // Daftarkan client ini
  addClient(res);
  console.log(`[SSE] Client terhubung. Total: ${getClientCount()} client`);

  // Kirim event awal agar client tau koneksi berhasil
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Terhubung ke server real-time' })}\n\n`);

  // Hapus client saat browser menutup koneksi
  req.on('close', () => {
    removeClient(res);
    console.log(`[SSE] Client disconnect. Total: ${getClientCount()} client`);
  });
});

// ─────────────────────────────────────────────────────
// KEEP-ALIVE PING setiap 30 detik
// Mencegah koneksi SSE terputus oleh proxy/nginx/firewall
// ─────────────────────────────────────────────────────
setInterval(() => {
  broadcastKeepAlive();
}, 30_000);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), sseClients: getClientCount() });
});

// Register all routes
app.use('/api', apiRouter);

// Start listening (only when not running in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log(`[SSE] Endpoint aktif di /api/events`);
  });
}

export default app;
