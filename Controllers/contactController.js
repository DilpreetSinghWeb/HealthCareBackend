import Contact from "../models/ContactSchema.js";

export const submitContactForm = async (req, res) => {
  const { subject, message } = req.body;
  const userId = req.userId; // Assume you set this from the auth context or middleware

  try {
    const contactEntry = new Contact({
      user: userId,
      subject,
      message,
    });

    await contactEntry.save();

    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully!",
      data: contactEntry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};