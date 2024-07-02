import express from "express";
import { logger } from "../utils/utils";
import { roles } from "../utils/constant";
import UserModel from "../models/user.model";
const router = express.Router();


// Get All Users
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const users = await UserModel.find({ isDeleted: false, role: {$ne : roles.admin } });
    logger(true, `Getting all users.`);
    return res.status(200).json({
      status: true,
      message: "Getting all Users.",
      data: users,
    });
  } catch (err) {
    logger(false, `Getting all Users operation failed.`, err);
    return res.status(200).json({
      status: false,
      message: "Getting all Users operation failed.",
      data: err,
    });
  }
});

// Get User
router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    logger(true, `Getting user by Id ${req.params.id} .`);
    return res.status(200).json({
      status: true,
      message: `Getting user by Id ${req.params.id} .`,
      data: user,
    });
  } catch (err) {
    logger(false, `Getting User by Id operation failed.`, err);
    return res.status(200).json({
      status: false,
      message: "Getting User by Id operation failed.",
      data: err,
    });
  }
});

export default router;