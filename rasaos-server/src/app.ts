import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import { success } from "./lib/helpers";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Not allowed by CORS");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

import authRoutes from "./domains/auth/auth.routes";
import restaurantRoutes from "./domains/restaurant/restaurant.routes";
import menuRoutes from "./domains/menu/menu.routes";
import orderRoutes from "./domains/order/order.routes";
import adminRoutes from "./domains/admin/admin.routes";

app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes will be mounted here
app.use("/auth", authRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (req: Request, res: Response) => {
  return success(res, { status: "ok" });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
