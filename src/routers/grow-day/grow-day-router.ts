import express, { Request, Response } from "express";

import { User } from "../../shared/models/user";
import { GrowDay } from "../../shared/models/grow-day";
import { UserRole } from "../../shared/enums/user-role";
import { UserDbModel } from "../../db/models/user.db.model";
import { GrowDaySpan } from "../../shared/enums/grow-day-span";
import { GrowDayDbModel } from "../../db/models/grow-day.db.model";
import { GrowDayStatus } from "../../shared/enums/grow-day-status";
import { sendMessage } from "../../middleware/send-email";

const growDayRouter = express.Router();

growDayRouter.get("", async (request: Request, response: Response) => {
  try {
    if (!(request?.user as User)?.roles?.includes(UserRole.Approver)) {
      response.status(403).send({
        message: "You are not authorized to access this information!",
      });
      return;
    }
    const allGrowDays = await GrowDayDbModel.find();
    response.send(allGrowDays);
  } catch (err) {
    response.status(400).send(err);
  }
});

growDayRouter.get(
  "/:createdById",
  async (request: Request, response: Response) => {
    try {
      if (!request.params.createdById) {
        response.status(400).send({ message: "User id is required!" });
      }
      const userGrowDays = await GrowDayDbModel.find({
        createdById: request.params.createdById,
      });
      response.status(200).send(userGrowDays);
    } catch (err) {
      response.status(400).send(err);
    }
  }
);

growDayRouter.post("", async (request: Request, response: Response) => {
  try {
    const newUserGrowDay = new GrowDayDbModel({
      ...request.body,
      status: GrowDayStatus.Submitted,
    });
    await newUserGrowDay.save();
    sendMessage({
      to: process.env.SENDGRID_VERIFIED_EMAIL || "",
      from: process.env.SENDGRID_VERIFIED_EMAIL || "",
      subject: `New grow day booking request - ${(request.user as User)?.name}`,
      text: "New booking request",
      html: `<h2>Request for new grow day booking</h2><div>Hi HR team,</div><div>${
        (request.user as User)?.name
      } has requested a new grow day off.</div>
            <div>Please take a look at the request <a target="_blank" href="${
              process.env.APP_BASE_URL
            }/day-approval}">here.</a></div>
            `,
    });
    response.status(201).send(newUserGrowDay);
  } catch (err) {
    response.status(400).send(err);
  }
});

growDayRouter.delete("/:id", async (request: Request, response: Response) => {
  try {
    const growDayToDelete: GrowDay | null = await GrowDayDbModel.findById(
      request.params.id
    );
    if (!growDayToDelete) {
      response.status(404).send({ message: "Booking not found" });
      return;
    } else if (
      growDayToDelete?.createdById?.toString() !==
      (request.user as User)._id?.toString()
    ) {
      response
        .status(403)
        .send({ message: "You are not allowed to delete this booking!" });
      return;
    } else if (
      [GrowDayStatus.Approved, GrowDayStatus.Rejected].includes(
        growDayToDelete?.status
      )
    ) {
      response
        .status(400)
        .send({ message: "Closed bookings cannot be deleted" });
    } else {
      await GrowDayDbModel.findByIdAndDelete(request.params.id);
      response.send();
    }
  } catch (err) {
    response.status(400).send(err);
  }
});

growDayRouter.put("/:id", async (request: Request, response: Response) => {
  try {
    const growDayToUpdate: GrowDay | null = await GrowDayDbModel.findById(
      request.params.id
    );
    if (!growDayToUpdate) {
      response.status(404).send({ message: "Booking not found" });
      return;
    } else if (!(request.user as User).roles.includes(UserRole.Approver)) {
      response.status(403).send({
        message: "You are not allowed to update this booking status!",
      });
      return;
    } else {
      const updatedGrowDay = await GrowDayDbModel.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
          new: true,
        }
      );
      const userToUpdate = await UserDbModel.findById(
        updatedGrowDay.createdById
      );
      if (request.body.status === GrowDayStatus.Approved) {
        await UserDbModel.findByIdAndUpdate(updatedGrowDay.createdById, {
          growDays:
            userToUpdate.growDays -
            (updatedGrowDay.span === GrowDaySpan.HalfDay ? 1 : 2),
        });
      }
      sendMessage({
        to: userToUpdate?.email || "",
        from: process.env.SENDGRID_VERIFIED_EMAIL || "",
        subject: `Grow day request updated`,
        text: "Updated booking request",
        html: `<h2>UPDATE</h2><div>Hi ${userToUpdate?.name},</div><div>Your grow day request status has been updated</div>
            <div>Head over to the application to check the updates <a target="_blank" href="${process.env.APP_BASE_URL}/grow%2Dday}">here.</a></div>
            `,
      });
      response.send(updatedGrowDay);
    }
  } catch (err) {
    response.status(400).send(err);
  }
});

export { growDayRouter };
