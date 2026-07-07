const { Resend } = require("resend");
const dotEnv = require("dotenv");
dotEnv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send an email using Resend
exports.sendOtpEmail = async (email, otp) => {
  const { data, error } = await resend.emails.send({
    from: "OTP Verification <onboarding@resend.dev>",
    to: email,
    subject: "Your OTP code",
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend");
  }

  return data;
};