import express from 'express';
import { register,login, sentOtpEmail, verifyOtp } from '../Controllers/authController.js';


const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/send-otp',sentOtpEmail);
router.post('/verify-otp',verifyOtp);

export default router;