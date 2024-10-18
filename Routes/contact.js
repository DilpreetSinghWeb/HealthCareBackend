import express from 'express';
import { submitContactForm } from "../Controllers/contactController.js";
import {authenticate} from './../auth/verifyToken.js';


const router = express.Router();

router.post("/contact-submit", authenticate, submitContactForm);

export default router;




