import { Request, Response } from 'express';
import * as tanamanService from '../services/tanaman.service';

export async function create(req: Request, res: Response) {
  try {
    const result = await tanamanService.createTanaman(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tanamanService.updateTanaman(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tanamanService.deleteTanaman(id);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function inspect(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await tanamanService.inspectTanaman(id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
