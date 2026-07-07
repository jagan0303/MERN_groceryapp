const controller = require("../controllers/paymentController");
const express = require("express");
const email = require("../middleware/emailMiddleware");
const router = express.Router();

router.post("/create-order", email.emailMiddleware, controller.createRazorpayOrder);
router.post("/verify", email.emailMiddleware, controller.verifyPayment);

module.exports = router;