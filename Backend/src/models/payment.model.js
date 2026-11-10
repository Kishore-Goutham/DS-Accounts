import mongoose from "mongoose";

// Expenditure record. Mirrors Income, but the "source" is free text (there is
// no fixed list like serviceType) and an optional free-text note is allowed.
const paymentSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "source is required"],
      trim: true,
      minlength: [1, "source cannot be empty"],
      maxlength: [120, "source cannot exceed 120 characters"],
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
    note: {
      type: String,
      trim: true,
      maxlength: [300, "note cannot exceed 300 characters"],
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Same access paths as Income (see PLAN.md §4).
paymentSchema.index({ date: -1 }); // table default sort + date-range filters
paymentSchema.index({ source: 1, date: -1 }); // filter by source + date

export const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
