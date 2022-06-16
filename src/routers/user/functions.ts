import { User } from "../../shared/models/user";
import { UserDbModel } from "../../db/models/user.db.model";
import { ResourceRequest } from "../../shared/models/resource-request";
import { RequestStatus } from "../../shared/enums/request-status";

export const updateUser = async (user: Partial<User>): Promise<User> =>
  (await UserDbModel.findByIdAndUpdate(user?._id, user)) as User;

export const getUpdatedUserObjectBasedOnUpdateType = (
  user: User,
  status: RequestStatus,
  resourceRequest: ResourceRequest
) => {
  switch (status) {
    case RequestStatus.Approved: {
      return {
        ...user,
        frozenBudget: user.frozenBudget - resourceRequest.estimatedCost,
        remainingBudget: user.remainingBudget - resourceRequest.estimatedCost,
      };
    }
    case RequestStatus.Rejected: {
      return {
        ...user,
        frozenBudget: user.frozenBudget - resourceRequest.estimatedCost,
      };
    }
    default: {
      return user;
    }
  }
};
