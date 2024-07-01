import express from 'express';
import { logger, decodeJWT, getImgFileSize, uploadFileS3 } from "../utils/utils";
import { roles, s3Folders } from "../utils/constant";
import EventModel from '../models/event.model';
import multer from "multer";
const router = express.Router();

// Create Event
router.post("/", multer().fields([{ name: "eventImages"}]) , async (req: express.Request, res: express.Response) => {
  try {
    const { title , organizeBy, location, dateOfOrganize } = req.body;
    if (!title || !organizeBy || !location || !dateOfOrganize) {
      logger(false, `Title ${title} , Organize By ${organizeBy}, Location ${location} Date Of Organize ${dateOfOrganize} needed for creating event.`);
      return res.json({ status: false,
        message: `Title ${title} , Organize By ${organizeBy}, Location ${location} Date Of Organize ${dateOfOrganize} needed for creating event.`
      });
    }
    
    const token = req.headers.authorization as string;
    const user: any = decodeJWT(token);
    if (roles.admin !== user.role) {
      return res.json({ status: false, message: `Role ${user.role} not authorized for creating event.`});
    }

    if (!req.files['eventImages']) {
      req.body.imageS3URLs = [];
    } else {
      console.log(req.files['eventImages'][0].originalname);
      let eventImgs = [];
      for (let i = 0; i < req.files['eventImages'].length; i++) {
        // Rename image name with img_name + miliseconds
        req.files['eventImages'][i].originalname = req.files['eventImages'][i].originalname + "_" + new Date().getTime();

        // Uploading Image in S3 Upto 5MB Only
        const eventImgSize = getImgFileSize(req.files['eventImages'][i]);
        if (eventImgSize.status) {
          const imageUrl = await uploadFileS3(s3Folders.event, req.files['eventImages'][i]);
          eventImgs.push(imageUrl.objectUrl);
        } else {
          return res.json(eventImgSize);
        }
      }
      req.body.imageS3URLs = eventImgs;
    }
    const event = await new EventModel({ ...req.body }).save();
    logger(true, `Event Created Successfully.`, event);
    return res.status(200).json({
      status: true,
      message: "Event Created Successfully.",
      data: event,
    });
  } catch (err) {
    logger(false, `Event Creation failed.`, err);
    return res.json({
      status: false,
      message: "Event Creation failed.",
      data: err,
    });
  }
}
);
export default router;