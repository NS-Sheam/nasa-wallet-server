import { model, Schema } from "mongoose";
const cashInRequestSchema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 100000,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CashInRequest = model("CashInRequest", cashInRequestSchema);
