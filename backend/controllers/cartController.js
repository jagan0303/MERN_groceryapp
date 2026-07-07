const Cart=require("../models/Cart")
const Product=require("../models/Product")
const User=require("../models/User")
exports.addToCart=async(req,res)=>{
    try{
        const userId=req.userId;
        const {productId,quantity}=req.body
        if(quantity<1){
            return res.status(400).json({msg:"please add a product"})
        }
        const productExists=await Product.findById(productId)
        if(!productExists){
            return res.status(400).json
({msg:"product not found"})       
 }
 let cart=await Cart.findOne({user:userId})
 if(!cart){
    cart=await Cart.create({
        user:userId,items:[{product:productId,quantity}]
    })
    return res.status(200).json({
        success:true,
        message:"cart created and product added",
        cart
    })
 }
 const itemIndex=cart.items.findIndex(
    item=>item.product.toString()===productId
 )
 //in above condition if no product is there it return -1 so we  check for that and update quantity
 if(itemIndex>-1){
    cart.items[itemIndex].quantity+=quantity
 }else{
    cart.items.push({product:productId,quantity})
 }
await cart.save()
res.json({
     success:true,
        message:" product added successfully",
        
})
    }catch(error){
res.status(500).json({msg:error.message})
    }
}
exports.getCartItems=async(req,res)=>{
    try{
        const cart=await Cart.findOne({user:req.userId})
        .populate("user","email")
        .populate("items.product")
        if(!cart){
            return res.status(404).json({msg:"cart not found"})
        }
        res.json({success:true,cart})

    }catch(error){
        res.status(500).json({msg:error.message})
    }
}
exports.removeFromCart = async(req, res)=>{
    try {
        const cart = await Cart.findOneAndUpdate(
            {user: req.userId},
            {$pull: {items: {product: req.params.productId}}}, 
            {new:true}
        )
        res.json({
            success:true,
            message:"Product removed",
            cart
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
}
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId.toString()
      );
      await cart.save();
      return res.json({ success: true, message: "Product removed", cart });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId.toString()
    );

    if (!item) {
      return res.status(404).json({ msg: "Product not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      message: "Quantity updated",
      cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};