const Order = require("../models/Order");
const Cart = require("../models/Cart");

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const ORIGIN_CITY = "Hyderabad";

const DELIVERY_PARTNERS = ["Ramesh", "Suresh", "Venkat", "Anil", "Praveen"];

function pickDeliveryPartner(orderId) {
  const idStr = orderId.toString();
  const lastChar = idStr.charCodeAt(idStr.length - 1);
  const index = lastChar % DELIVERY_PARTNERS.length;
  return DELIVERY_PARTNERS[index];
}

function getComputedStatus(order) {
  const manualStatuses = ["cancelled", "replacement_requested", "return_approved", "return_rejected"];
  if (manualStatuses.includes(order.status)) {
    return order.status;
  }

  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  const destinationCity = (order.address && order.address.city) ? order.address.city.toLowerCase().trim() : "";
  const isLocalDelivery = destinationCity === ORIGIN_CITY.toLowerCase().trim();

  if (isLocalDelivery) {
    if (elapsed >= 4 * HOUR) return "delivered";
    if (elapsed >= 1 * HOUR) return "out_for_delivery";
    if (elapsed >= 20 * MIN) return "processing";
    return "placed";
  }

  if (elapsed >= 2 * DAY) return "delivered";
  if (elapsed >= 1 * DAY + 12 * HOUR) return "out_for_delivery";
  if (elapsed >= 1 * DAY) return "shipped";
  if (elapsed >= 20 * MIN) return "processing";
  return "placed";
}

function buildTrackingTimeline(order) {
  const placedAt = new Date(order.createdAt).getTime();
  const now = Date.now();

  const destinationCity = (order.address && order.address.city) ? order.address.city : "your city";
  const destinationStreet = (order.address && order.address.street) ? order.address.street : "";
  const destinationFull = (order.address)
    ? [order.address.street, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')
    : "delivery address";

  const isLocalDelivery = destinationCity.toLowerCase().trim() === ORIGIN_CITY.toLowerCase().trim();
  const deliveryPartner = pickDeliveryPartner(order._id);

  let checkpoints;

  if (isLocalDelivery) {
    checkpoints = [
      {
        key: "placed",
        label: "Order Placed",
        detail: "Website",
        time: placedAt
      },
      {
        key: "confirmed",
        label: "Order Confirmed",
        detail: "Payment verified",
        time: placedAt + 5 * MIN
      },
      {
        key: "packed",
        label: "Order Packed",
        detail: ORIGIN_CITY + " Warehouse",
        time: placedAt + 20 * MIN
      },
      {
        key: "out_for_delivery",
        label: "Out For Delivery",
        detail: "Delivery Partner: " + deliveryPartner + " - Heading to " + (destinationStreet || destinationCity),
        time: placedAt + 1 * HOUR
      },
      {
        key: "delivered",
        label: "Delivered",
        detail: destinationFull,
        time: placedAt + 4 * HOUR
      }
    ];
  } else {
    checkpoints = [
      {
        key: "placed",
        label: "Order Placed",
        detail: "Website",
        time: placedAt
      },
      {
        key: "confirmed",
        label: "Order Confirmed",
        detail: "Payment verified",
        time: placedAt + 5 * MIN
      },
      {
        key: "packed",
        label: "Order Packed",
        detail: destinationCity + " Warehouse",
        time: placedAt + 1* HOUR
      },
      {
        key: "shipped",
        label: "Shipped",
        detail: "Package handed to courier - " + destinationCity + " Distribution Center",
        time: placedAt + 2 * HOUR
      },
      {
        key: "hub",
        label: "Reached " + destinationCity + " Hub",
        detail: destinationCity + " Hub",
        time: placedAt + 1 * DAY
      },
      {
        key: "out_for_delivery",
        label: "Out For Delivery",
        detail: "Delivery Partner: " + deliveryPartner + " - Current Location: " + (destinationStreet || destinationCity),
        time: placedAt + 1 * DAY + 12 * HOUR
      },
      {
        key: "delivered",
        label: "Delivered",
        detail: destinationFull,
        time: placedAt + 2 * DAY
      }
    ];
  }

  if (["cancelled", "replacement_requested", "return_approved", "return_rejected"].includes(order.status)) {
    return {
      cancelled: order.status === "cancelled",
      specialStatus: order.status,
      checkpoints: checkpoints.filter(function(c) {
        return new Date(c.time).getTime() <= now;
      }).map(function(c) {
        return Object.assign({}, c, { reached: true, timestamp: new Date(c.time).toISOString() });
      })
    };
  }

  const withReachedFlag = checkpoints.map(function(c) {
    return Object.assign({}, c, {
      reached: now >= c.time,
      timestamp: new Date(c.time).toISOString()
    });
  });

  return {
    cancelled: false,
    checkpoints: withReachedFlag
  };
}

function attachComputedStatus(order) {
  const obj = order.toObject ? order.toObject() : order;
  obj.status = getComputedStatus(order);
  obj.tracking = buildTrackingTimeline(order);
  return obj;
}
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { address, paymentMethod, paymentDetails, razorpayPaymentId, paymentVerified } = req.body;


    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      unit: item.product.unit,
      image: item.product.image,
      quantity: item.quantity
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

   const order = await Order.create({
  user: userId,
  items: orderItems,
  totalAmount,
  address,
  paymentMethod,
  paymentDetails,
  razorpayPaymentId: razorpayPaymentId || "",
  paymentVerified: paymentVerified || false
});

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      msg: "Order placed successfully",
      order: attachComputedStatus(order)
    });

  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    const ordersWithStatus = orders.map((order) => attachComputedStatus(order));

    return res.status(200).json({ success: true, orders: ordersWithStatus });

  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    return res.status(200).json({ success: true, order: attachComputedStatus(order) });

  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const computedStatus = getComputedStatus(order);
    if (["delivered", "out_for_delivery"].includes(computedStatus)) {
      return res.status(400).json({ msg: "Order cannot be cancelled at this stage" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ msg: "Order is already cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      msg: "Order cancelled successfully",
      order: attachComputedStatus(order)
    });

  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.requestReplacement = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const computedStatus = getComputedStatus(order);
    if (computedStatus !== "delivered") {
      return res.status(400).json({ msg: "Replacement can only be requested for delivered orders" });
    }

    if (["replacement_requested", "return_approved", "return_rejected"].includes(order.status)) {
      return res.status(400).json({ msg: "A replacement or return request already exists for this order" });
    }

    order.status = "replacement_requested";
    order.replacementReason = reason || "";
    await order.save();

    return res.status(200).json({
      success: true,
      msg: "Replacement requested successfully",
      order: attachComputedStatus(order)
    });

  } catch (error) {
    console.error("REQUEST REPLACEMENT ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");

    const ordersWithStatus = orders.map((order) => attachComputedStatus(order));

    return res.status(200).json({ success: true, orders: ordersWithStatus });

  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.respondToReplacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ msg: "Action must be 'approve' or 'reject'" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.status !== "replacement_requested") {
      return res.status(400).json({ msg: "No pending replacement request for this order" });
    }

    order.status = action === "approve" ? "return_approved" : "return_rejected";
    await order.save();

    return res.status(200).json({
      success: true,
      msg: `Replacement ${action === "approve" ? "approved" : "rejected"} successfully`,
      order: attachComputedStatus(order)
    });

  } catch (error) {
    console.error("RESPOND TO REPLACEMENT ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "placed", "processing", "shipped", "out_for_delivery",
      "delivered", "cancelled", "replacement_requested",
      "return_approved", "return_rejected"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      msg: "Order status updated",
      order: attachComputedStatus(order)
    });

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({ msg: error.message });
  }
};