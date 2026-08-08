import { Request, Response } from 'express';
import * as transaksiService from '../services/transaksi.service';

export async function createPengajuan(req: Request, res: Response) {
  try {
    const result = await transaksiService.createPengajuanJual(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function verifyPengajuan(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await transaksiService.verifyPengajuanJual(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function createPickup(req: Request, res: Response) {
  try {
    const result = await transaksiService.createPickup(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function updatePickupStatus(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await transaksiService.updatePickupStatus(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function createQC(req: Request, res: Response) {
  try {
    const result = await transaksiService.createQC(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function pay(req: Request, res: Response) {
  try {
    const result = await transaksiService.payPembayaran(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function createBukuKas(req: Request, res: Response) {
  try {
    const result = await transaksiService.createBukuKas(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function handleWebhookPenerimaanGudang(req: Request, res: Response) {
  try {
    const result = await transaksiService.handleWebhookPenerimaanGudang(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
