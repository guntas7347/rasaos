import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { success, error } from "../../lib/helpers";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    restaurantId: z.string().uuid(),
  }),
});

export const signup = async (req: Request, res: Response) => {
  const { email, password, restaurantId } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return error(res, 400, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "OWNER",
      restaurantId,
    },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, restaurantId: user.restaurantId },
    env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.status(201);
  return success(res, {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  });
};

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return error(res, 401, "Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return error(res, 401, "Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, restaurantId: user.restaurantId },
    env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    domain: ".rasaos.com",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return success(res, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  });
};

export const getMe = async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  return success(res, user);
};

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    restaurantName: z.string().min(2),
    restaurantSlug: z.string().min(2),
  }),
});

export const register = async (req: Request, res: Response) => {
  const { email, password, restaurantName, restaurantSlug } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return error(res, 400, "Email already exists");
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    });
    if (existingRestaurant) {
      return error(res, 400, "Restaurant slug already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug: restaurantSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "OWNER",
          restaurantId: restaurant.id,
        },
      });

      await tx.subscriptionPeriod.create({
        data: {
          restaurantId: restaurant.id,
          plan: "TRIAL",
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return { user, restaurant };
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        role: result.user.role,
        restaurantId: result.restaurant.id,
      },
      env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201);
    return success(res, {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        restaurantId: result.restaurant.id,
      },
      restaurant: result.restaurant,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to register");
  }
};

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return success(
      res,
      null,
      "If that email exists, a reset link will be sent.",
    );
  }

  const resetLink = crypto.randomUUID();
  const resetlinkdate = new Date();

  await prisma.user.update({
    where: { email },
    data: { resetLink, resetlinkdate },
  });

  const resetLinkUrl = `http://localhost:5174/login/reset-password/${resetLink}`;

  console.log(resetLinkUrl);

  return success(res, null, "Reset link generated successfully");
};

export const validatePasswordResetLinkSchema = z.object({
  body: z.object({
    uuid: z.string().uuid(),
  }),
});

export const validatePasswordResetLink = async (
  req: Request,
  res: Response,
) => {
  const { uuid } = req.body;

  const user = await prisma.user.findFirst({ where: { resetLink: uuid } });
  if (!user) {
    return error(res, 400, "Invalid or expired reset link");
  }

  return success(res, null, "Valid reset link");
};

export const resetPasswordSchema = z.object({
  body: z.object({
    uuid: z.string().uuid(),
    newPassword: z.string().min(6),
  }),
});

export const resetPassword = async (req: Request, res: Response) => {
  const { uuid, newPassword } = req.body;

  const user = await prisma.user.findFirst({ where: { resetLink: uuid } });
  if (!user) {
    return error(res, 400, "Invalid or expired reset link");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetLink: null,
      resetlinkdate: null,
    },
  });

  return success(res, null, "Password has been reset successfully");
};
