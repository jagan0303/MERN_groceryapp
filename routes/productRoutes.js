const controller=require("../controllers/productController")
const express=require("express");
const upload=require("../middleware/imageMiddleware")
const protected=require("../middleware/adminMiddleware")
const router=express.Router()
router.post("/add-product",protected.adminMiddleware,
    upload.single("image"),controller.createProduct);
router.get("/show-products",controller.getProducts);


module.exports=router;
