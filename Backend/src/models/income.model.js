import mongoose from "mongoose";
import { SERVICE_TYPES } from "../constants/serviceTypes.js";

const incomeSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "customerName is required"],
      trim: true,
      minlength: [1, "customerName cannot be empty"],
      maxlength: [120, "customerName cannot exceed 120 characters"],
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
      min: [0.01, "amount must be greater than 0"],
      // min alone passes NaN/Infinity (NaN comparisons are false), so guard explicitly.
      validate: {
        validator: Number.isFinite,
        message: "amount must be a finite number",
      },
    },
    serviceType: {
      type: String,
      required: [true, "serviceType is required"],
      enum: {
        values: SERVICE_TYPES,
        message: "{VALUE} is not a valid service type",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for the common access paths (see PLAN.md §4).
incomeSchema.index({ date: -1 }); // table default sort + date-range filters
incomeSchema.index({ serviceType: 1, date: -1 }); // filter by service + date

export const Income = mongoose.model("Income", incomeSchema);
export default Income;
