const controller = require("../controllers/supportController");
const express = require("express");
const router = express.Router();

router.post("/contact", controller.sendSupportRequest);

module.exports = router;