import { Request, Response } from 'express';
import * as petaniService from '../services/petani.service';

export async function login(req: Request, res: Response) {
  const { phone, password } = req.body;
  try {
    const result = await petaniService.loginPetani(phone, password);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const result = await petaniService.loginAdmin(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const result = await petaniService.registerPetani(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function updateProfile(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const updated = await petaniService.updatePetani(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}

export async function verify(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const updated = await petaniService.verifyPetani(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || error });
  }
}
