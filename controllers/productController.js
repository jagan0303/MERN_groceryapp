const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
        
    const { name, price, desc, category, unit } = req.body;

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const products = await Product.create({
      name,
      price,
      desc,
      category,
      unit,
      image
    });

    return res.status(200).json({
      msg: "Product added successfully",
      products
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      msg: "Server Error",
      error: error.message
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const newProducts = await Product.find();

    return res.status(200).json({
      msg: "Success",
      newProducts
    });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);


    return res.status(500).json({
      msg: "Server Error",
      error: error.message
    });
  }
};

