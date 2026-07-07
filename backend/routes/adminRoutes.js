const controller=require("../controllers/adminController")
const express=require("express")
const router=express.Router()
router.post("/admin-register",controller.adminRegister)
router.post("/admin-login",controller.adminLogin)
module.exports=router