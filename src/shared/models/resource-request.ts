import { ResourceType } from "../enums/resource-type";
import { RequestStatus } from "../enums/request-status";

export interface ResourceRequest {
  _id: string;
  title: string;
  resourceType: ResourceType;
  resourceDescription: string;
  resourceUrl: string;
  shippingAddress: string;
  justification?: string;
  estimatedCost: number;
  creationDate: string;
  createdById: string;
  createdByName: string;
  lastModifiedOn: string;
  requestStatus: RequestStatus;
}
