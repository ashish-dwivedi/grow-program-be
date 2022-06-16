import { RequestUpdateType } from "../enums/request-update-type";

export interface ResourceRequestUpdate {
  comment?: string;
  updatedById: string;
  updatedOn?: string;
  updatedByName: string;
  resourceRequestId: string;
  updateType: RequestUpdateType;
}
