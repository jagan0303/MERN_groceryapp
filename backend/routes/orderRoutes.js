const controller = require("../controllers/orderController");
const express = require("express");
const email = require("../middleware/emailMiddleware");
const adminProtect = require("../middleware/adminMiddleware");
const router = express.Router();

// Customer routes
router.post("/place-order", email.emailMiddleware, controller.placeOrder);
router.get("/my-orders", email.emailMiddleware, controller.getMyOrders);
router.get("/:id", email.emailMiddleware, controller.getOrderById);
router.post("/:id/cancel", email.emailMiddleware, controller.cancelOrder);
router.post("/:id/request-replacement", email.emailMiddleware, controller.requestReplacement);

// Admin routes
router.get("/admin/all-orders", adminProtect.adminMiddleware, controller.getAllOrders);
router.put("/admin/update-status/:id", adminProtect.adminMiddleware, controller.updateOrderStatus);
router.put("/admin/respond-replacement/:id", adminProtect.adminMiddleware, controller.respondToReplacement);

module.exports = router;