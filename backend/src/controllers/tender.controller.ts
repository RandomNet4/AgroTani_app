import { Request, Response } from 'express';
import * as tenderService from '../services/tender.service';

export async function create(req: Request, res: Response) {
  try {
    const result = await tenderService.createTender(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const result = await tenderService.handlePermintaanPengadaanWebhook(req.body);
    res.json({ success: true, tender: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function verifyAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { status, alasanPenolakan } = req.body;
  try {
    const result = await tenderService.verifyTenderAdmin(id, status, alasanPenolakan);
    res.json({ success: true, tender: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function registerPetani(req: Request, res: Response) {
  try {
    const result = await tenderService.createTenderPetani(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function verifyPetani(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tenderService.verifyTenderPetani(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function createPO(req: Request, res: Response) {
  try {
    const result = await tenderService.createPurchaseOrder(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function updatePO(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tenderService.updatePurchaseOrder(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function deletePO(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tenderService.deletePurchaseOrder(id);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function alokasikanPO(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tenderService.alokasikanPurchaseOrder(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
