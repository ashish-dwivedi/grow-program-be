import { GrowDaySpan } from "../enums/grow-day-span";
import {GrowDayStatus} from "../enums/grow-day-status";

export interface GrowDay {
  _id: string;
  date: string;
  goal: string;
  span: GrowDaySpan;
  createdById: string;
  creationDate: string;
  createdByName: string;
  lastModifiedOn: string;
  status: GrowDayStatus;
}
