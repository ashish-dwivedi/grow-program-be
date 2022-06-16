import express, { Request, Response } from "express";

import { User } from "../../shared/models/user";
import { UserRole } from "../../shared/enums/user-role";
import { RequestStatus } from "../../shared/enums/request-status";
import { ResourceRequestDbModel } from "../../db/models/resource-request.db.model";

const approvalRouter = express.Router();

approvalRouter.get(
  "/requests",
  async (request: Request, response: Response) => {
    const userRoles = (request?.user as User)?.roles as UserRole[];
    if (
      [UserRole.Approver, UserRole.Admin].some((role) =>
        userRoles.includes(role)
      )
    ) {
      const pendingRequests = await ResourceRequestDbModel.find({
        status: { $in: [RequestStatus.Submitted, RequestStatus.Ordered] },
      });
      response.send(pendingRequests);
    } else {
      response.status(403).send();
    }
  }
);

export { approvalRouter };
