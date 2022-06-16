import {UserRole} from "../enums/user-role";

export interface User {
  _id: string;
  name: string;
  email: string;
  sub: string;
  nickname: string;
  roles: UserRole[];
  picture?: string;
  frozenBudget: number;
  remainingBudget: number;
  growDaysBalance: number;
}
