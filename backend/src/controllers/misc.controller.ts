import { Request, Response } from 'express';
import * as miscService from '../services/misc.service';

export async function getAll(req: Request, res: Response) {
  try {
    // Ambil petaniId dari JWT jika ada (diset oleh authPetani middleware)
    // Jika null/undefined = request dari admin atau tanpa auth → kembalikan semua notif
    const petaniId = (req as any).petaniId as string | undefined;
    const result = await miscService.getAllData(petaniId);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function createEdu(req: Request, res: Response) {
  try {
    const result = await miscService.createEdukasi(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function buy(req: Request, res: Response) {
  try {
    const result = await miscService.buyBibitPupuk(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function readNotif(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await miscService.readNotifikasi(id);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function addJejakTimeline(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await miscService.addJejakPanenTimeline(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
