import { Response } from "express";

export function success(res: Response, data: any, message = null) {
  return res.json({
    success: true,
    data,
    message,
  });
}

export function error(
  res: Response,
  status: number,
  message: string,
  data = null,
) {
  return res.status(status).json({
    success: false,
    data,
    message,
  });
}
