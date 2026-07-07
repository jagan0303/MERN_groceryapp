const controller = require("../controllers/wishlistController");
const express = require("express");
const email = require("../middleware/emailMiddleware");
const router = express.Router();

router.post("/toggle", email.emailMiddleware, controller.toggleWishlist);
router.get("/my-wishlist", email.emailMiddleware, controller.getWishlist);
router.delete("/remove/:productId", email.emailMiddleware, controller.removeFromWishlist);

module.exports = router;