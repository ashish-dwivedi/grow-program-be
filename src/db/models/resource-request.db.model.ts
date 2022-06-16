import mongoose, { Schema } from "mongoose";
import { ResourceType } from "../../shared/enums/resource-type";
import { RequestStatus } from "../../shared/enums/request-status";

const ResourceRequestSchema = new Schema({
  resourceType: {
    type: String,
    enum: ResourceType,
  },
  title: String,
  resourceDescription: String,
  resourceUrl: String,
  shippingAddress: String,
  requestStatus: {
    type: String,
    enum: RequestStatus,
    default: RequestStatus.Submitted,
  },
  creationDate: { type: String, default: new Date().toISOString() },
  createdById: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByName: { type: String, required: true },
  lastModifiedOn: { type: String, default: new Date().toISOString() },
  lastModifiedBy: mongoose.Schema.Types.ObjectId,
  justification: { type: String, required: false },
  estimatedCost: { type: Number, required: false, default: 0 },
});

export const ResourceRequestDbModel = mongoose.model(
  "ResourceRequest",
  ResourceRequestSchema,
  "resource-request"
);
