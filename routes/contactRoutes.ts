import express from "express";
import { Router } from "express";
import {
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController";
import validateToken from "../middlewares/validateTokenHandler";

const router: Router = express.Router();

router.use(validateToken);

router
  .route("/")
  .get(getContact)
  .post(createContact)
  .put(updateContact)
  .delete(deleteContact);

export default router;
