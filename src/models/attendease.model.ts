import { Schema, model } from "mongoose";

const schema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true, ref: "event" },
  userIds: [{ type: Schema.Types.ObjectId, required: true, ref: "user" }],
});

export default model("attendease" , schema);