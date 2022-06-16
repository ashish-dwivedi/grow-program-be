import express, { Request, Response } from "express";
import { ResourceRequestUpdateDbModel } from "../../db/models/request-update.db.model";
import { ResourceRequestDbModel } from "../../db/models/resource-request.db.model";
import { ResourceRequest } from "../../shared/models/resource-request";
import { User } from "../../shared/models/user";
import {
  getUpdatedUserObjectBasedOnUpdateType,
  updateUser,
} from "../user/functions";
import { UserDbModel } from "../../db/models/user.db.model";
import { sendMessage } from "../../middleware/send-email";

const resourceRequestUpdateRouter = express.Router();

resourceRequestUpdateRouter.get(
  "/:id",
  async (request: Request, response: Response) => {
    const allResourceRequestUpdates = await ResourceRequestUpdateDbModel.find({
      resourceRequestId: request.params.id,
    });
    response.status(200).send(allResourceRequestUpdates);
  }
);

resourceRequestUpdateRouter.post(
  "",
  async (request: Request, response: Response) => {
    try {
      // STEP 1: Create a new update entry in the DB
      const newResourceRequestUpdate = new ResourceRequestUpdateDbModel({
        ...request.body,
        updatedById: (request.user as User)?._id,
        updatedByName: (request.user as User)?.name,
      });
      const createdResourceRequestUpdate =
        await newResourceRequestUpdate.save();

      // STEP 2:  Update last modified time
      const updatedResourceRequest: ResourceRequest =
        (await ResourceRequestDbModel.findByIdAndUpdate(
          request.body.resourceRequestId,
          {
            requestStatus: newResourceRequestUpdate?.updateType,
            lastModifiedOn: new Date().toISOString(),
          }
        )) as ResourceRequest;

      // STEP 3:  Based on update type, update the user budget
      const requestCreatorDetails = await UserDbModel.findById(
        updatedResourceRequest?.createdById
      ).lean();
      const updatedUserObject = getUpdatedUserObjectBasedOnUpdateType(
        requestCreatorDetails as User,
        newResourceRequestUpdate?.updateType,
        updatedResourceRequest
      );
      await updateUser(updatedUserObject);

      // STEP 4: Send email about the update
      const recipient =
        requestCreatorDetails?._id?.toString() !== (request?.user as User)?._id?.toString()
          ? requestCreatorDetails?.email
          : process.env.SENDGRID_VERIFIED_EMAIL;
      sendMessage({
        to: recipient,
        from: process.env.SENDGRID_VERIFIED_EMAIL || "",
        subject: `${updatedResourceRequest?.title} - Update`,
        text: "Request updated",
        html: `<div>${updatedResourceRequest?.title} request has been updated.</div>
          <div style="background: #d2d2d2; padding: 1rem; margin: 1rem 0; border-left: 4px solid #a5a5a5">
            ${newResourceRequestUpdate?.comment || updatedResourceRequest?.requestStatus}
          </div>
          <div>Head over to the request details using the link below to follow up.</div>
          <br>
          <a target="_blank" href="${process.env.APP_BASE_URL}/requests/${updatedResourceRequest?._id}">To the request</a>
        `,
      });

      // STEP 5:  Send back created update object
      response.status(201).send(createdResourceRequestUpdate);
    } catch (err) {
      response.status(400).send(err);
    }
  }
);

export { resourceRequestUpdateRouter };
