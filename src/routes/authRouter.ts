import express from 'express';
import { logger, createJWT, getImgFileSize, uploadFileS3, randomNumber, sendOTP, apiResponse } from "../utils/utils";
import { roles, s3Folders } from "../utils/constant";
import UserModel from '../models/user.model';
import multer from 'multer';
const router = express.Router();


// Login
router.post("/login", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.body.mobile) {
      logger(false, `Mobile number is must to login.`, req.body.mobile);
      return res.json({
        status: false,
        message: `Mobile number is must to login.`,
      });
    }
    const isUserExist = await UserModel.findOne({ mobile: req.body.mobile, isDeleted: false });
    let OTP = randomNumber();
    if (isUserExist) {
      // Send OTP for verification
      const result = await sendOTP(req.body.mobile, OTP, false);
      // Create token
      const token = createJWT(isUserExist);
      logger(true, `User Logging ${isUserExist.mobile} , OTP : ${OTP}`);
      return res.status(200).json({
        status: true,
        message: "User Logging.",
        data: { token: token, OTP: OTP },
      });
    }
    else {
      logger(false, `User not found.`);
      return res.status(200).json({
        status: false,
        message: "User not found.",
      });
    }
  } catch (err) {
    logger(false, `User login operation failed.`, err);
    return res.status(200).json({
      status: false,
      message: "User login operation failed.",
      data: err,
    });
  }
});

// Register
router.post("/register", multer().single("userImg"), async (req: express.Request, res: express.Response) => {
  try {
    const { role, name, mobile, gender } = req.body;
    if (!role || !name || !gender || !mobile) {
      logger(false, `Mobile ${mobile} , Name ${name} , Gender ${gender} , Role ${role} needed for registering user.`);
      return res.json({
        status: false,
        message: `Mobile ${mobile} , Name ${name} , Gender ${gender} , Role ${role} needed for registering user.`
      });
    }

    if (roles.admin !== role) {
      return res.json({ status: false, message: `Role ${role} not authorized for registration.` });
    }

    const isUserExist = await UserModel.findOne({ mobile: mobile });
    if (isUserExist) {
      return res.json(apiResponse(false, "User already registered."));
    }

    if (req.file) {
      req.file.originalname = req.file.originalname + "_" + new Date().getTime();
      // Uploading Image in S3 Upto 5MB Only
      const userImgSize = getImgFileSize(req.file);
      if (userImgSize.status) {
        const imageUrl = await uploadFileS3(s3Folders.user, req.file, false);
        req.body.imageS3URL = imageUrl.objectUrl;
      } else {
        return res.json(userImgSize);
      }
    }
    req.body.isDeleted = false;
    req.body.snsEndpoint = "";
    const user = await new UserModel({ ...req.body }).save();
    // const token = createJWT(user);
    logger(true, `User Registered Successfully.`, user);
    return res.status(200).json({
      status: true,
      message: "User Registered Successfully.",
      data: user,
    });
  } catch (err) {
    logger(false, `User Registered failed.`, err);
    return res.json({
      status: false,
      message: "User Registered failed.",
      data: err,
    });
  }
}
);

export default router;