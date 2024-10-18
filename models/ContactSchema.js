import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Subject must be at least 3 characters long"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, "Message must be at least 5 characters long"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
