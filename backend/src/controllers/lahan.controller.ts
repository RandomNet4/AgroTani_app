import { Request, Response } from 'express';
import * as lahanService from '../services/lahan.service';

export async function create(req: Request, res: Response) {
  try {
    const result = await lahanService.createLahan(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await lahanService.updateLahan(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await lahanService.deleteLahan(id);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function verify(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await lahanService.verifyLahan(id, status);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
