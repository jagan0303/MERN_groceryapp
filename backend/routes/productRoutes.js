const controller = require("../controllers/productController");
const express = require("express");
const upload = require("../middleware/imageMiddleware");
const protected = require("../middleware/adminMiddleware");
const searchController = require("../controllers/searchController");

const router = express.Router();

router.post("/add-product", protected.adminMiddleware, upload.single("image"), controller.createProduct);
router.get("/show-products", controller.getProducts);
router.get("/search", searchController.searchProducts);
router.put("/update-product/:id", protected.adminMiddleware, upload.single("image"), controller.updateProduct);
router.delete("/delete-product/:id", protected.adminMiddleware, controller.deleteProduct);

module.exports = router;