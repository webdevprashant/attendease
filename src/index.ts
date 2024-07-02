import express from "express";
import header from "./utils/headers";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db";
import { authenticateJWT } from "./middleware/auth.middleware";
import { logger } from "./utils/utils";
connectDB();
const app = express();

app.use(express.json());

app.get("/" , (req,res) => {
  logger(true, "Attendease Home Page.");
  res.send("Attendease Home Page.");
});

import AuthRouter from "./routes/authRouter";
import EventRouter from "./routes/eventRouter";
import UserRouter from "./routes/userRouter";

app.use("/auth" , header , AuthRouter);
app.use("/event" , [header, authenticateJWT] , EventRouter);
app.use("/user" , [header] , UserRouter);


app.listen(process.env.PORT, () => {
  logger(true, `Server Listening at port ${process.env.PORT} .`);
})