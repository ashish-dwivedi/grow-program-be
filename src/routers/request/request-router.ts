import express, { Request, Response } from "express";

import { updateUser } from "../user/functions";
import { User } from "../../shared/models/user";
import { UserRole } from "../../shared/enums/user-role";
import { sendMessage } from "../../middleware/send-email";
import { UserDbModel } from "../../db/models/user.db.model";
import { ResourceRequestDbModel } from "../../db/models/resource-request.db.model";
import { ResourceRequestFilters } from "../../shared/models/resource-request-filters";
import { ResourceRequestUpdateDbModel } from "../../db/models/request-update.db.model";
import { RequestUpdateType } from "../../shared/enums/request-update-type";
import { getRequestsBasedOnFilters } from "./functions/get-requests-based-on-filters";
import { ResourceRequest } from "../../shared/models/resource-request";

const requestRouter = express.Router();

requestRouter.get(
  "/by-current-user",
  async (request: Request, response: Response) => {
    try {
      let resourceRequestFilters: ResourceRequestFilters = Object.fromEntries(
        Object.entries({
          ...request.query,
          createdById: (request?.user as User)?._id,
        }).filter(([_, value]) => !!value)
      );
      const resourceRequests = await getRequestsBasedOnFilters(
        resourceRequestFilters
      );
      response.status(200).send(resourceRequests);
    } catch (err) {
      response.status(400).send(err);
    }
  }
);

requestRouter.get("", async (request: Request, response: Response) => {
  try {
    if (!(request.user as User).roles.includes(UserRole.Admin)) {
      response.status(403).send();
    }
    let resourceRequestFilters: ResourceRequestFilters = Object.fromEntries(
      Object.entries({
        ...request.query,
      }).filter(([_, value]) => !!value)
    );
    const resourceRequests = await getRequestsBasedOnFilters(
      resourceRequestFilters
    );
    response.status(200).send(resourceRequests);
  } catch (err) {
    response.status(400).send(err);
  }
});

requestRouter.get("/:id", async (request: Request, response: Response) => {
  try {
    const fetchedRequest: ResourceRequest | null =
      await ResourceRequestDbModel.findById(request.params.id);
    if (!fetchedRequest?._id) {
      response.status(404).send();
    } else if (
      fetchedRequest?.createdById?.toString() ===
        (request.user as User)?._id?.toString() ||
      (request.user as User)?.roles.includes(UserRole.Admin)
    ) {
      response.status(200).send(fetchedRequest);
    } else {
      response
        .status(403)
        .send({ message: "User is not allowed to access this request." });
    }
  } catch (err) {
    console.log(err);
    response.status(400).send(err);
  }
});

requestRouter.post("", async (request: Request, response: Response) => {
  try {
    const newResourceRequest = new ResourceRequestDbModel({
      ...request.body,
      createdById: (request.user as User)?._id,
      createdByName: (request.user as User)?.name,
    });
    await newResourceRequest.save();
    sendMessage({
      to: process.env.SENDGRID_VERIFIED_EMAIL || "",
      from: process.env.SENDGRID_VERIFIED_EMAIL || "",
      subject: `Resource Request - ${request?.body?.title}`,
      text: "New request",
      html: `<h2>Request for new resource</h2><div>Hi HR team,</div><div>${
        (request.user as User)?.name
      } has requested a new resource.</div>
            <div>Please take a look at the request <a target="_blank" href="${
              process.env.APP_BASE_URL
            }/requests/${newResourceRequest?._id}">here.</a></div>
            `,
    });
    const userDetails = await UserDbModel.findById(
      (request.user as User)._id
    ).lean();
    await updateUser({
      ...userDetails,
      frozenBudget: (userDetails?.frozenBudget +
        request.body.estimatedCost) as number,
    });
    response.status(201).send(newResourceRequest);
  } catch (err) {
    response.status(400).send(err);
  }
});

requestRouter.delete("/:id", async (request: Request, response: Response) => {
  try {
    // STEP 1: Find the request to be deleted
    const requestToDelete = await ResourceRequestDbModel.findById(
      request.params.id
    );
    if (!requestToDelete) {
      response.status(404).send({ message: "Request does not exist!" });
    }

    // STEP 2: Update user object.
    const userDetails: User = await UserDbModel.findById(
      (request.user as User)._id
    ).lean();
    await updateUser({
      ...userDetails,
      frozenBudget: userDetails?.frozenBudget - requestToDelete.estimatedCost,
    });

    // STEP 3: Create an update object for the deleted resource-request
    const newRequestUpdate = new ResourceRequestUpdateDbModel({
      resourceRequestId: requestToDelete._id,
      updatedById: userDetails?._id,
      updatedByName: userDetails?.name,
      updateType: RequestUpdateType.Deleted,
      updatedOn: new Date().toISOString(),
    });
    await newRequestUpdate.save();

    const deletedRequest = await ResourceRequestDbModel.findByIdAndDelete(
      request.params.id
    );
    if (!deletedRequest) {
      response.status(404).send({ message: "Request not found!" });
    }

    response.send();
  } catch (err) {
    response.status(400).send(err);
  }
});

export { requestRouter };
