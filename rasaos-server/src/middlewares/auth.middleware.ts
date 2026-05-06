import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { User } from "../../prisma/generated/prisma/client";
import { error } from "../lib/helpers";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return error(res, 401, "Unauthorized: Missing or invalid session");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return error(res, 401, "Unauthorized: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return error(res, 401, "Unauthorized: Invalid session");
  }
};
