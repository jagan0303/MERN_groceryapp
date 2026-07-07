const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay needs paise (amount * 100)
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ success: false, msg: "Payment verification failed" });
    }

    return res.status(200).json({
      success: true,
      msg: "Payment verified successfully",
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};