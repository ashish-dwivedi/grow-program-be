import { Request, Response } from "express";
import jwt_decode, { JwtPayload } from "jwt-decode";
import { UserDbModel } from "../db/models/user.db.model";
import { User } from "../shared/models/user";
import https from "https";
import axios from "axios";

const checkUser = async (request: Request, response: Response, next: any) => {
  const token = request.header("authorization")?.split(" ")[1];
  if (token) {
    try {
      const decodedToken: JwtPayload = jwt_decode(token);
      const authUserInfo = await getAuthUserInfo(token);
      request.user = (await UserDbModel.findOne({ sub: decodedToken?.sub })) as User;
      next();
    } catch (err) {
      response.locals.user = null;
      next();
    }
  }
};

const getAuthUserInfo = (token: string = '') => {
  return axios.get(`${process.env.AUTH0_DOMAIN}/userinfo`, { headers: { Authorization: `Bearer ${token}`}});
}

export { checkUser, getAuthUserInfo };

