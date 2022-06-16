import mongoose, { Schema } from "mongoose";
import { RequestStatus } from "../../shared/enums/request-status";

const ResourceRequestUpdateSchema = new Schema({
  resourceRequestId: { type: mongoose.Schema.Types.ObjectId, required: true },
  updatedById: { type: mongoose.Schema.Types.ObjectId, required: true },
  updatedByName: { type: String, required: true },
  updateType: {
    type: String,
    enum: RequestStatus,
    required: true,
  },
  updatedOn: { type: String, default: new Date().toISOString() },
  comment: { type: String, default: "" },
});

export const ResourceRequestUpdateDbModel = mongoose.model(
  "ResourceRequestUpdate",
  ResourceRequestUpdateSchema,
  "resource-request-update"
);
