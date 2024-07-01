import { Schema, model } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  title: { type: String, required: true },
  body: { type: String, required: false },
  sendedAt: { type: Number, required: true, default: Date.now }
});

export default model("notification" , schema);