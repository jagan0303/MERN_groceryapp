const nodemailer=require("nodemailer")
const dotEnv=require("dotenv")
dotEnv.config()
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// Send an email using async/await
exports.sendOtpEmail=async(email,otp)=>{
     await transporter.sendMail({
    from: `"OTP Verification"<${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP code",
   // text: "Hello world?", // Plain-text version of the message
    html: `<h2>Your OTP is:${otp}</h2><p>Valid for 5 minutes</p>`, // HTML version of the message
  });
}