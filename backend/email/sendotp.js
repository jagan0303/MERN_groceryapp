const User = require("../models/User")
const jwt = require("jsonwebtoken")
const dotEnv = require("dotenv")
const {generateOtp} = require("../email/generateOtp")
const {sendOtpEmail} = require("../email/sendotp")

exports.sendOtp = async (req, res) => {
    try {
        const {name, email} = req.body;
        if(!email){
            return res.status(400).json({msg:"Email required"})
        }
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({name, email})
        }
        const otp = generateOtp()
        user.otp = otp;
        user.otpExpires = Date.now() + 5*60*1000
        await user.save()
        await sendOtpEmail(email, otp)
        res.status(200).json({
            success:true,
            message:"OTP sent to your email",
            name
        })
    } catch (error) {
        console.error("SEND OTP ERROR:", error)
        res.status(500).json({message: error.message})
    }
}