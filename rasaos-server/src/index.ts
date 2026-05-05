import { main } from "../prisma/seed";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const startServer = async () => {
  try {
    // Attempt database connection
    await prisma.$connect();
    console.log("[Database] Connected successfully");

    app.listen(env.PORT, () => {
      console.log(
        `[Server] Listening on port ${env.PORT} in ${env.NODE_ENV} mode`,
      );
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
