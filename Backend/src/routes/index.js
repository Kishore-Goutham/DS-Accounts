import { Router } from "express";
import incomeRoutes from "./income.routes.js";
import metaRoutes from "./meta.routes.js";
import { sendSuccess } from "../utils/ApiResponse.js";

// Aggregates all feature routers. Mounted at /api/v1 by app.js.
const router = Router();

router.get("/health", (req, res) =>
  sendSuccess(res, { status: "ok", time: new Date().toISOString() })
);

router.use(metaRoutes); // /service-types
router.use("/incomes", incomeRoutes); // /incomes/...

export default router;
