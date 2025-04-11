import express from 'express';
import {sendEmails, resetPass} from "../controllers/passwordReset.js";

const router = express.Router();

router.post("/", sendEmails);
router.post("/:userId/:token", resetPass);

export default router;