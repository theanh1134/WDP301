const Return = require("../models/return");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");

exports.createReturns = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data); // FE gửi: formData.append("data", JSON.stringify(returnRecords))
    const files = req.files || []; // FE gửi: formData.append("files", file.originFileObj);

    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, message: "Invalid payload: must be an array" });
    }

    const createdReturns = [];

    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      const evidences = files.map((file) => {
        const fileType = file.mimetype.startsWith("image")
          ? "image"
          : file.mimetype.startsWith("video")
          ? "video"
          : "other";

        return {
          type: fileType,
          url: `/uploads/returns/${path.basename(file.path)}`,
        };
      });

      record.evidences = evidences;
      const product = await Product.findById(data[0].items[0].productId);

      record.shopId = product.shopId

      const newReturn = new Return(record);
      const saved = await newReturn.save();
      createdReturns.push(saved);
    }

    res.status(201).json({
      success: true,
      message: "Tạo yêu cầu hoàn hàng thành công!",
      data: createdReturns,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo return:", err);
    res.status(500).json({
      success: false,
      message: "Server error khi tạo yêu cầu hoàn hàng",
      error: err.message,
    });
  }
};


async function getReturnedProductIdsByOrderId(orderId) {
  try {
    const returns = await Return.find({ orderId }).select('items.productId').lean();

    if (!returns || returns.length === 0) return [];

    // Lấy tất cả productId từ các items
    const allIds = returns.flatMap(ret => ret.items.map(i => String(i.productId)));

    // Loại bỏ trùng lặp
    const uniqueIds = [...new Set(allIds)];

    return uniqueIds;
  } catch (error) {
    console.error('Error getting returned product IDs:', error);
    throw error;
  }
}

exports.getReturnedProductIds = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing orderId'
      });
    }

    const productIds = await getReturnedProductIdsByOrderId(orderId);

    return res.status(200).json({
      success: true,
      count: productIds.length,
      data: productIds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching returned product IDs'
    });
  }
};