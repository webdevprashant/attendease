import mongoose from "mongoose";
import { logger } from "./utils";

const dbUrl = process.env.DBURL || "";

export default async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    logger(true, "MongoDB Connection Successful....");
  } catch (err) {
    logger(false, "MongoDB Connection Failed....", err);
  }
}