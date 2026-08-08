import { Request, Response } from 'express';
import * as hargaService from '../services/harga.service';

export async function getHarga(req: Request, res: Response) {
  try {
    const result = await hargaService.getHargaList();
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function getHistori(req: Request, res: Response) {
  try {
    const result = await hargaService.getHistoriHarga();
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function updateHarga(req: Request, res: Response) {
  try {
    const result = await hargaService.updateHargaKomoditas(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
