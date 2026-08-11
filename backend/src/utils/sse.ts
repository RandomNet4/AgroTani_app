import { Response } from 'express';

// ============================================================
// SSE (Server-Sent Events) — Real-time broadcast ke semua client
// ============================================================

/**
 * Set yang menyimpan referensi semua Response aktif dari SSE clients.
 * Setiap browser yang membuka /api/events akan terdaftar di sini.
 */
const clients = new Set<Response>();

/**
 * Daftarkan SSE client baru (dipanggil saat browser connect ke /api/events)
 */
export function addClient(res: Response): void {
  clients.add(res);
}

/**
 * Hapus SSE client (dipanggil saat koneksi browser ditutup)
 */
export function removeClient(res: Response): void {
  clients.delete(res);
}

/**
 * Kirim event "data-changed" ke SEMUA browser yang sedang terhubung.
 * Dipanggil setiap kali ada mutasi data berhasil (POST/PUT/DELETE → 2xx).
 */
export function broadcastDataChanged(): void {
  const payload = `event: data-changed\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      // Client mungkin sudah disconnect, hapus dari set
      clients.delete(client);
    }
  }
}

/**
 * Kirim ping ke semua client agar koneksi tidak timeout/terputus oleh proxy/nginx.
 * Dipanggil setiap 30 detik.
 */
export function broadcastKeepAlive(): void {
  const payload = `: keep-alive\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

/**
 * Jumlah client yang sedang terkoneksi (untuk debugging)
 */
export function getClientCount(): number {
  return clients.size;
}
