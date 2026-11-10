import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paymentController as ctrl } from "../controllers/payment.controller.js";
import { paymentValidators as v } from "../validators/payment.validator.js";

const router = Router();

router.post("/", validate(v.create), asyncHandler(ctrl.create));
router.get("/", validate(v.list), asyncHandler(ctrl.list));

// Must come before "/:id" so they aren't captured as an id.
router.get("/analytics", validate(v.analytics), asyncHandler(ctrl.analytics));
router.get("/sources", asyncHandler(ctrl.sources));

router.get("/:id", validate(v.getOne), asyncHandler(ctrl.getOne));
router.put("/:id", validate(v.update), asyncHandler(ctrl.update));
router.delete("/:id", validate(v.remove), asyncHandler(ctrl.remove));

export default router;
