
const Product = require("../models/Product")


exports.searchProducts = async(req, res)=>{
    try {
        const {search} = req.query;

        if(!search){
            return res.status(400).json({msg:"search not found"})
        }

        const products = await Product.find({
            name:{$regex:search, $options:"i"}
        })
        res.status(200).json({search:products})
    } catch (error) {
        res.status(500).json({msg:error.message})
    }
}