import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema: Schema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add the name"],
    },
    phone: {
      type: String,
      required: [true, "Please add the phone number"],
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
