import express, { Request, Response } from "express";
import { UserDbModel } from "../../db/models/user.db.model";
import { getAuthUserInfo } from "../../middleware/check-user";
import { INITIAL_USER_BUDGET } from "../../shared/constants";
import { UserRole } from "../../shared/enums/user-role";
import { User } from "../../shared/models/user";

const userRouter = express.Router();

userRouter.get(
  "/:sub/details",
  async (request: Request, response: Response) => {
    try {
      const userResponse = await UserDbModel.findOne({
        sub: request?.params?.sub,
      });
      if (!userResponse) {
        const authUserInfo = await getAuthUserInfo(
          request?.header("Authorization")?.split(" ")[1]
        );
        const newUser = new UserDbModel({
          sub: request?.params?.sub,
          ...authUserInfo.data,
        });
        const newlyAddedUser = await newUser.save();
        response.send(newlyAddedUser);
        return;
      }
      response.send(userResponse);
    } catch (err) {
      response.status(400).send(err);
    }
  }
);

userRouter.get("", async (request: Request, response: Response) => {
  try {
    const allUsers = await UserDbModel.find();
    response.send(allUsers);
  } catch (err) {
    response.status(400).send(err);
  }
});

userRouter.post(
  "/reset-budget/:id",
  async (request: Request, response: Response) => {
    try {
      if (!(request?.user as User)?.roles.includes(UserRole.Approver)) {
        response.status(403).send();
        return;
      }
      const updatedUser = await UserDbModel.findOneAndUpdate(
        { _id: request.params.id },
        {
          remainingBudget: INITIAL_USER_BUDGET,
        },
        {
          new: true,
        }
      );
      response.send(updatedUser);
    } catch (err) {
      response.status(400).send(err);
    }
  }
);

userRouter.delete(':id', async (request: Request, response: Response) => {
  if (!request.params.id) {
    response.status(400).send({ message: 'User Id is missing!'});
  }
  try {
    const deletedUser = await UserDbModel.findByIdAndDelete(request.params.id);
    if (!deletedUser) {
      response.status(404).send({ message: 'User not found!' })
    }
    response.send();
  } catch (err) {
    response.status(400).send(err);
  }
})

export { userRouter };
