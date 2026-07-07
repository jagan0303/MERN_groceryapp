const nodemailer = require("nodemailer");

exports.sendSupportRequest = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ msg: "Name, email and message are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "Support Request: " + (category || "General") + " - " + name,
      html: `
        <h3>New Support Request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Category:</b> ${category || "General"}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({
      success: true,
      msg: "Your message has been sent. We will get back to you soon."
    });

  } catch (error) {
    console.error("SUPPORT REQUEST ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};