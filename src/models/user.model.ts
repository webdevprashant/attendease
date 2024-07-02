import { Schema, model } from "mongoose";

const schema = new Schema({
  role: { type: String, required: true, default: "Member" },  // Member, Admin, EventManager
  name: { type: String, required: true, default: null },
  mobile: { type: Number, required: true, unique: true },
  gender: { type: String, required: true, default: null, enum: ["Male" , "Female"] },
  business: { type: String, required: false, default: null },
  imageS3URL: { type: String, required: false, default: null },
  isActive: { type: Boolean, required: false, default: true },
  snsEndpoint: { type: String, required: false, default: "" },
  isDeleted: { type: Boolean, required: false, default: false },
  modifiedOn: { type: Number, required: false, default: Date.now },
});

export default model("user", schema);
