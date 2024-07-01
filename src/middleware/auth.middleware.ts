import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import { apiResponse } from "../utils/utils";
dotenv.config();

export const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      jwt.verify(authHeader, process.env.TOKEN_SECRET as string, (err) => {
        if (err) {
          return res.status(403).json(apiResponse(false, `Unauthorized. Please check token or credentials.`));
        } 
        next();
      })
    } else {
      return res.status(403).json(apiResponse(false, `Unauthorized. Could not find token!`));
    }

  } catch (err) {
    return res.status(403).json(apiResponse(false, `Unauthorized. Please check token.`, err));
    };
}