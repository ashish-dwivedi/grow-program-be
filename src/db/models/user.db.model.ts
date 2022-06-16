import mongoose, { Schema } from "mongoose";
import { UserRole } from "../../shared/enums/user-role";

const UserSchema = new Schema({
  sub: String,
  nickname: String,
  name: String,
  picture: String,
  email: String,
  roles: [{ type: String, enum: UserRole, default: UserRole.Employee }],
  remainingBudget: { type: Number, default: 1000 },
  frozenBudget: { type: Number, default: 0 },
  growDays: { type: Number, default: 24 - new Date().getMonth() * 2 },
});

export const UserDbModel = mongoose.model("User", UserSchema, "users");
