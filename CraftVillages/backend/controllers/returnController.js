const Return = require("../models/Return");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const { notifyNewReturnRequest } = require("../socket/returnNotificationSocket");

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

      // Populate data for notification
      await saved.populate([
        { path: 'buyerId', select: 'fullName email phoneNumber' },
        { path: 'shopId', select: 'shopName' },
        { path: 'orderId', select: 'orderCode' }
      ]);

      createdReturns.push(saved);

      // 🔔 Send real-time notification to staff
      try {
        const io = req.app.get('io');
        if (io) {
          notifyNewReturnRequest(io, saved);
          console.log('✅ Return notification sent to staff');
        } else {
          console.warn('⚠️ Socket.IO not available, notification not sent');
        }
      } catch (notifyError) {
        console.error('❌ Error sending notification:', notifyError);
        // Don't fail the request if notification fails
      }
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

async function countUserReturnsInLastMonth(userId) {
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(now.getMonth() - 1);

  const count = await Return.countDocuments({
    buyerId: userId,
    status: { $in: ['REQUESTED', 'APPROVED', 'SHIPPED', 'RETURNED'] },
    createdAt: { $gte: lastMonth, $lte: now }
  });

  return count;
}

exports.countRefund = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await countUserReturnsInLastMonth(userId);

    return res.status(200).json({
      count: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

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

// Get return requests by shop
exports.getReturnsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing shopId'
      });
    }

    // Build query
    let query = { shopId };
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const returns = await Return.find(query)
      .populate({
        path: 'orderId',
        select: '_id createdAt finalAmount paymentInfo'
      })
      .populate({
        path: 'buyerId',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'items.productId',
        select: 'images productName'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Return.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: returns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching returns by shop:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching return requests',
      error: error.message
    });
  }
};

// Get return statistics by shop
exports.getReturnStatisticsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const mongoose = require('mongoose');

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing shopId'
      });
    }

    const stats = await Return.aggregate([
      { $match: { shopId: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format statistics
    const formattedStats = {
      all: 0,
      requested: 0,
      approved: 0,
      rejected: 0,
      shipped: 0,
      returned: 0,
      refunded: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id.toLowerCase()] = stat.count;
      formattedStats.all += stat.count;
    });

    return res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching return statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching return statistics',
      error: error.message
    });
  }
};