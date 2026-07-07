const controller =require("../controllers/cartController")
const express=require("express")
const email=require("../middleware/emailMiddleware")
const router=express.Router()
router.post("/add-to-cart",email.emailMiddleware,controller.addToCart)
router.get("/cart-details",email.emailMiddleware,controller.getCartItems)
router.put("/update-cart", email.emailMiddleware, controller.updateQuantity)
router.delete("/delete/:productId", email.emailMiddleware, controller.removeFromCart)
module.exports=router