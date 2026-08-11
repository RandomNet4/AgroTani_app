import { Request, Response, NextFunction } from 'express';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validKeys = [
    process.env.PETANI_API_KEY,
    'petani_secret_key_v1',
    'gudang_secret_key_v1',
  ].filter(Boolean);

  if (!apiKey || !validKeys.includes(apiKey as string)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing API key',
    });
  }

  next();
};
