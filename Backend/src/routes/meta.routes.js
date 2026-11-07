import { Router } from "express";
import { SERVICE_TYPES } from "../constants/serviceTypes.js";
import { sendSuccess } from "../utils/ApiResponse.js";

const router = Router();

// The list that powers the frontend dropdown and filter options.
router.get("/service-types", (req, res) => sendSuccess(res, SERVICE_TYPES));

export default router;
