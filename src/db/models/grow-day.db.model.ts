import mongoose, { Schema } from "mongoose";
import { GrowDaySpan } from "../../shared/enums/grow-day-span";
import { GrowDayStatus } from "../../shared/enums/grow-day-status";

const GrowDaySchema = new Schema({
  date: { type: String, required: true },
  goal: { type: String, required: true },
  createdByName: { type: String, required: true },
  span: { type: String, required: true, enum: GrowDaySpan },
  status: { type: String, required: true, enum: GrowDayStatus },
  createdById: { type: mongoose.Types.ObjectId, required: true },
  creationDate: {
    type: String,
    required: true,
    default: new Date().toISOString(),
  },
  lastModifiedOn: {
    type: String,
    required: true,
    default: new Date().toISOString(),
  },
});

export const GrowDayDbModel = mongoose.model(
  "GrowDay",
  GrowDaySchema,
  "grow-day"
);
