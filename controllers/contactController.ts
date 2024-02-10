import { Request, Response } from "express";
import Contact from "../models/contactModel";
import User from "../models/userModel";

interface CustomRequest extends Request {
  user?: {
    _id: string;
    name: string;
    phone: string;
  };
}

//@desc Get all contacts
//@route GET /api/contacts
//@access private
const getContact = async (req: CustomRequest, res: Response) => {
  try {
    const contact = await Contact.findOne({ user_id: req.user?._id });
    const user = await User.findById(req.user?._id);

    if (!user?.is_verified) {
      throw new Error("Please verify your account");
    }
    if (contact) {
      return res.status(200).json({ success: true, contact });
    } else {
      throw new Error("Please fill your contact details");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

//@desc Create contact
//@route POST /api/contacts
//@access private
const createContact = async (req: CustomRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const user_id = req.user?._id;
    if (!name || !phone) {
      //   res.status(400);
      throw new Error("All fields are mandatory!");
    }

    const user = await User.findById(req.user?._id);

    if (!user?.is_verified) {
      throw new Error("Please verify your account");
    }

    const contact = await Contact.create({
      user_id,
      name,
      phone,
    });
    return res.status(200).json({ success: true, contact });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

//@desc Update contact
//@route PUT /api/contacts/:id
//@access private
const updateContact = async (req: CustomRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      //   res.status(400);
      throw new Error("All fields are mandatory!");
    }

    const contact = await Contact.findOne({ user_id: req.user?._id });
    if (contact) {
      const user = await User.findById(req.user?._id);

      if (!user?.is_verified) {
        throw new Error("Please verify your account");
      }
      await Contact.updateOne(
        { user_id: req.user?._id },
        {
          name,
          phone,
        }
      );
      return res
        .status(200)
        .json({ success: true, message: "contact updated" });
    } else {
      throw new Error("NO contacts found for this user");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
//@desc Delete contact
//@route DELETE /api/contacts/:id
//@access private
const deleteContact = async (req: CustomRequest, res: Response) => {
  try {
    const contact = await Contact.findOne({ user_id: req.user?._id });
    if (contact) {
      const user = await User.findById(req.user?._id);

      if (!user?.is_verified) {
        throw new Error("Please verify your account");
      }
      await Contact.deleteOne({ user_id: req.user?._id });
      return res
        .status(200)
        .json({ success: true, message: "contact deleted" });
    } else {
      throw new Error("NO contacts found for this user");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export { getContact, createContact, updateContact, deleteContact };
