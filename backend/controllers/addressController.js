const Address = require("../models/Address");

exports.addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { label, fullName, phone, street, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await Address.create({
      user: userId,
      label,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    });

    return res.status(201).json({ success: true, msg: "Address added", address });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.userId }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { label, fullName, phone, street, city, state, pincode, isDefault },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ msg: "Address not found" });
    }

    return res.status(200).json({ success: true, msg: "Address updated", address });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!address) {
      return res.status(404).json({ msg: "Address not found" });
    }

    return res.status(200).json({ success: true, msg: "Address deleted" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};