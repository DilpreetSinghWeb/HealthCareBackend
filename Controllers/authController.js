import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import generateOTP from "../auth/otpGenerator.js";

const otpStorage = {};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15d" }
  );
};

export const register = async (req, res) => {
 
};

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    let user = null;

    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    if (patient) {
      user = patient;
    }
    if (doctor) {
      user = doctor;
    }

    // check if user exist or not
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ statues: false, message: "Invalid credentials" });
    }

    // get token
    const token = generateToken(user);

    const { password, role, appointments, ...rest } = user._doc;

    return res.status(200).json({
      status: true,
      message: "Successfully Login",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const sentOtpEmail = async (req, res) => {
  const { email } = req.body;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds

  // Store OTP and expiration in memory
  otpStorage[email] = { otp, otpExpires };

  const mailOptions = {
    from: "userauth@gmail.com",
    to: email,
    subject: "Your OTP for Verification",
    text: `Your OTP is ${otp} It will expire in 10 minutes`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: `OTP has been sent successfully to ${email}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, userData } = req.body;

    // Check if OTP is stored for this email
    const storedOtpData = otpStorage[email];
    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found for this email. Please request a new OTP.",
      });
    }

    const { otp: storedOtp, otpExpires } = storedOtpData;

    // Check if OTP has expired
    if (Date.now() > otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check if the provided OTP matches the stored OTP
    if (otp === storedOtp) {
      let user = null;
      const { role, password, gender, photo, name } = userData;

      // Check if the user is a patient or doctor
      if (role === "patient") {
        user = await User.findOne({ email });
      } else if (role === "doctor") {
        user = await Doctor.findOne({ email });
      }

      // If the user already exists, send an error message
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash the user's password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Create a new User or Doctor based on role
      if (role === "patient") {
        user = new User({
          email,
          password: hashPassword,
          name,
          photo,
          gender,
          role,
        });
      } else if (role === "doctor") {
        user = new Doctor({
          email,
          password: hashPassword,
          name,
          photo,
          gender,
          role,
        });
      }

      // Save the new user to the database
      await user.save();

      // OTP is successfully verified, now remove it from otpStorage
      delete otpStorage[email];

      return res.status(200).json({
        success: true,
        message: "OTP verified. You can now login!",
      });
    } else {
      // If OTP is incorrect, send an error response but do not delete OTP
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    // Catch and handle any unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification.",
      error: error.message,
    });
  }
};

