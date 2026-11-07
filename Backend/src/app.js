import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { sanitize } from "./middlewares/sanitize.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import router from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  // Security & parsing
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "100kb" }));
  app.use(sanitize);

  // Request logging (dev only)
  if (env.nodeEnv !== "production") {
    app.use(morgan("dev"));
  }

  // Basic abuse protection on the API surface
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Routes
  app.use("/api/v1", router);

  // 404 + central error handler (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
