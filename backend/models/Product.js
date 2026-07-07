const mongoose= require("mongoose");
const Category_Enum=[
    "vegetables","fruits","food-grains","meat"
]
const unit_Enum=[
    "500g","1kg",'2kgs',"3kgs","5kgs"
]
const productSchema=new  mongoose.Schema({
   name:{
    type:String,
    required:true,
   } ,
   desc:{
    type:String,
    required:true,

   },
   price:{
    type:Number
   },
   category:
   {
    type:String,
    values:Category_Enum,
   },
   unit:{
    type:String,
    values:unit_Enum,

   },
   image:{
    type:String
   },
   isActive:{
    type:Boolean
   }



},{
   timestamps:true 
}) 
module.exports=mongoose.model("Product",productSchema)