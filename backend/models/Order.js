const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    price: Number,
    unit: String,
    image: String,
    quantity: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentVerified: {
  type: Boolean,
  default: false
},
razorpayPaymentId: {
  type: String,
  default: ""
},
  
  paymentDetails: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["placed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "replacement_requested", "return_approved", "return_rejected"],
    default: "placed"
  },
  cancelReason: {
    type: String,
    default: ""
  },
  replacementRequest: {
    requested: { type: Boolean, default: false },
    reason: { type: String, default: "" },
    comment: { type: String, default: "" },
    requestedAt: { type: Date },
    adminResponse: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);