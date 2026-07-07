const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, desc, category, unit } = req.body;

    const image = req.file ? req.file.path : null;

    const products = await Product.create({ name, price, desc, category, unit, image });

    return res.status(200).json({ msg: "Product added successfully", products });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const newProducts = await Product.find();
    return res.status(200).json({ msg: "Success", newProducts });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, desc, category, unit } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.desc = desc || product.desc;
    product.category = category || product.category;
    product.unit = unit || product.unit;

    // Only update image if a new one was uploaded
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    return res.status(200).json({ msg: "Product updated successfully", product });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    return res.status(200).json({ msg: "Product deleted successfully" });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
};