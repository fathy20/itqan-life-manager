import { Response } from "express";

export const ok = <T>(res: Response, data: T, message?: string) =>
  res.json({ success: true, data, ...(message ? { message } : {}) });

export const created = <T>(res: Response, data: T) =>
  res.status(201).json({ success: true, data });

export const noContent = (res: Response) => res.status(204).send();

export const error = (res: Response, statusCode: number, message: string, code: string) =>
  res.status(statusCode).json({ success: false, message, code });
