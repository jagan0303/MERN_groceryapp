const controller = require("../controllers/addressController");
const express = require("express");
const email = require("../middleware/emailMiddleware");
const router = express.Router();

router.post("/add", email.emailMiddleware, controller.addAddress);
router.get("/my-addresses", email.emailMiddleware, controller.getAddresses);
router.put("/update/:id", email.emailMiddleware, controller.updateAddress);
router.delete("/delete/:id", email.emailMiddleware, controller.deleteAddress);

module.exports = router;