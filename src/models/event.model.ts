import { Schema, model } from "mongoose";

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false, default: null },
  eventType: { type: String, required: false, default: null },
  organizeBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  imageS3URLs: [{ type: String, required: false }],
  location: { type: String, required: true },
  dateOfOrganize: { type: Number, required: true },
  isDeleted: { type: Boolean, required: false, default: false },
});

export default model("event" , schema);