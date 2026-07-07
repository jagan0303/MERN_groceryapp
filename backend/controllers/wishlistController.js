const Wishlist = require("../models/Wishlist");

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [productId] });
      return res.status(200).json({ success: true, msg: "Added to wishlist", added: true, wishlist });
    }

    const index = wishlist.products.findIndex(
      (p) => p.toString() === productId
    );

    if (index > -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res.status(200).json({ success: true, msg: "Removed from wishlist", added: false, wishlist });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.status(200).json({ success: true, msg: "Added to wishlist", added: true, wishlist });
    }

  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId }).populate("products");

    if (!wishlist) {
      return res.status(200).json({ success: true, products: [] });
    }

    return res.status(200).json({ success: true, products: wishlist.products });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.userId },
      { $pull: { products: req.params.productId } },
      { new: true }
    );

    return res.status(200).json({ success: true, msg: "Removed", wishlist });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};