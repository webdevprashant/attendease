import winston from "winston";
import jwt from "jsonwebtoken";
import { S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import unirest from "unirest";
dotenv.config();


function randomNumber() {
  let number = Math.floor(1000 + Math.random() * 9000).toString(10);
  return parseInt(number);
}

function logger(status: boolean, msg: string, res?: any) {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.prettyPrint()
    ),
    defaultMeta: { status: status, message: msg, result: res },
    transports: [
      new winston.transports.Console(),
    ],
  });

  if (status == true) {
    return logger.info(msg);
  } else {
    return logger.error(msg);
  }
}

function createJWT(user: any) {
  const token = jwt.sign(user.toJSON(), process.env.TOKEN_SECRET as string, { expiresIn: "30d" });
  return token;
}

function decodeJWT(token: string) {
  let decodedToken = null;
  jwt.verify(token, process.env.TOKEN_SECRET as string, (error: any, decoded: any) => {
    if (error) {
      return error;
    }    
    decodedToken = decoded;
  });
  return decodedToken;  
}

function awsConfigurations() {
  const config: any = {
    region: process.env.awsRegion,
    credentials: {
      accessKeyId: process.env.awsAccessKey,
      secretAccessKey: process.env.awsSecretKey,
    }
  }
  const client = new S3(config);
  return client;
}

function getImgFileSize(img: any) {
  const imgSize = img.size / (1024 * 1024);
  if (imgSize <= parseInt(process.env.MAX_IMG_SIZE as string)) {
    return {
      status: true,
      message: `Image size is less than ${process.env.MAX_IMG_SIZE} MB.`,
      result: imgSize,
    };
  } else {
    return {
      status: false,
      message: `Image size should be less than or equal to ${process.env.MAX_IMG_SIZE} MB.`,
      result: imgSize,
    };
  }
}

async function sendOTP(mobile: number, otp: number, forgot: boolean) {
  try {
    var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
    req.headers({
      authorization: process.env.fast2SmsAuthKey,
    });
    let message: string;
    if (forgot === false)
      message = `Your verification OTP for Litchies SignUP is: \n ${otp}`;
    else message = `OTP for Forgot Password is: \n ${otp}`;
    req.form({
      route: "v3",
      sender_id: "FTWSMS",
      message: message,
      numbers: mobile,
    });

    req.end(function (res: any) {
      if (res.error) {
        console.log(res.error);
        throw new Error(res.error);
      }

      console.log(res.body);
    });
  } catch (err) {
    logger(false, "Sending OTP operation failed due to Internal Server Error.");
  }
}


async function uploadFileS3(module_name: string, fileToS3: any, isVideo?: boolean) {
  const awsClient = awsConfigurations();
  const params = {
    Bucket: process.env.bucketName,
    Key: module_name + "/" + fileToS3.originalname,
    Body: fileToS3.buffer,
    ContentType: isVideo ? 'video/mp4' : "image/jpeg",
  };
  let s3Response = await awsClient.putObject(params);
  const objectUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
  return {...s3Response.$metadata , objectUrl};
}

async function deleteImgS3(module_name: string, keyS3: string, isVideo?: boolean) {
  const awsClient = awsConfigurations();
  var params = {
    Bucket: process.env.bucketName,
    Key: module_name + "/" + keyS3,
    ContentType: isVideo ? 'video/mp4' : "image/jpeg"
  };
  var deletedKey = await awsClient.deleteObject(params);
  return deletedKey;
}

function apiResponse(status: boolean, message: string, data?: any) {
  return { status: status, message: message, data: data };
}

export { logger, randomNumber, apiResponse, awsConfigurations, createJWT, decodeJWT, getImgFileSize, sendOTP, uploadFileS3, deleteImgS3 };