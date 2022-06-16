import cors from "cors";
import path from "path";
import express from "express";
import dotenv from "dotenv";

// Loading .env file before any other script is loaded or executed
dotenv.config({ path: path.join(__dirname, "../.env") });

import "./db/db-init";
import { requestRouter } from "./routers/request/request-router";
import { userRouter } from "./routers/user/user.router";
import { jwtCheck } from "./middleware/check-jwt";
import { checkUser } from "./middleware/check-user";
import { approvalRouter } from "./routers/approval/approval-router";
import {resourceRequestUpdateRouter} from "./routers/resource-request-update/resource-request-update-router";
import {growDayRouter} from "./routers/grow-day/grow-day-router";

const app = express();

const port = process.env.PORT || 3200;

app.use(cors());
app.use(express.json());
app.use(
  jwtCheck.unless({
    path: /^\/opi/,
  })
);
app.use(checkUser);

app.use("/api/request", requestRouter);
app.use("/api/users", userRouter);
app.use("/api/approval", approvalRouter);
app.use("/api/resource-request-update", resourceRequestUpdateRouter);
app.use("/api/grow-day", growDayRouter);

app.listen(port, () => {
  console.log("App running at port ", port);
});
