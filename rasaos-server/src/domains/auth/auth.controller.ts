import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { success, error, uuid } from "../../lib/helpers";
import { sendEmail } from "../../lib/nodemailer";
import {
  resetPasswordEmail,
  verificationEmail,
  welcomeEmail,
} from "../../lib/htmlTemplates";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    restaurantSlug: z.string().min(2),
  }),
});

export const signup = async (req: Request, res: Response) => {
  const { email, restaurantSlug } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return error(res, 400, "Email already exists");
  }

  const verificationToken = jwt.sign(
    {
      email,
      restaurantSlug,
      type: "email_verification",
    },
    env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const verificationLinkUrl = `${env.FE_URL}/verify?token=${verificationToken}`;

  sendEmail({
    from: env.GMAIL_FROM,
    to: email,
    subject: "Verify Email to Complete Registration",
    html: verificationEmail({ verificationLinkUrl }),
  });

  return success(res, null, "Verification link sent to email");
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

  const isProd = env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    domain: isProd ? ".rasaos.com" : undefined,
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
  params: z.object({
    jwt: z.string(),
  }),
});

export const register = async (req: Request, res: Response) => {
  const { jwt: token } = req.params;

  try {
    const decoded = jwt.verify(token as string, env.JWT_SECRET) as any;

    if (decoded.type !== "email_verification") {
      return error(res, 400, "Invalid verification token");
    }

    let { email, restaurantSlug } = decoded;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return error(res, 400, "Email already exists");
    }

    let isSlugChanged = false;
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    });
    if (existingRestaurant) {
      restaurantSlug = `${restaurantSlug}-${uuid()}`;
      isSlugChanged = true;
    }

    const slugify = (value: string) =>
      value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    restaurantSlug = slugify(restaurantSlug);

    const restaurantName = "My Restaurant";
    const rawPassword = uuid();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

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

      await tx.menu.create({
        data: {
          restaurantId: restaurant.id,
        },
      });

      return { user, restaurant };
    });

    const feUrl = env.FE_URL || "http://localhost:5174";

    sendEmail({
      from: env.GMAIL_FROM,
      to: email,
      subject: "Registration Successful",
      html: welcomeEmail({ email, restaurantSlug, isSlugChanged, feUrl }),
    });

    res.status(201);
    return success(res, {
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
    if (err instanceof jwt.TokenExpiredError) {
      return error(res, 400, "Verification token expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return error(res, 400, "Invalid verification token");
    }
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

  const resetLink = uuid();
  const resetlinkdate = new Date();

  await prisma.user.update({
    where: { email },
    data: { resetLink, resetlinkdate },
  });

  const resetLinkUrl = `${env.FE_URL}/login/reset-password/${resetLink}`;

  sendEmail({
    from: env.GMAIL_FROM,
    to: email,
    subject: "Reset Password",
    html: resetPasswordEmail({ resetLinkUrl }),
  });

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

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  return success(res, null, "Logged out successfully");
};
