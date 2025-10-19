const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const nodemailer = require('nodemailer');

// [POST] /api/cart/:userId/checkout
const checkout = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shippingAddress, paymentMethod } = req.body;

    console.log('Checkout request:', { userId, shippingAddress, paymentMethod });
    console.log('Request body:', req.body);

    // 1️⃣ Tìm cart theo userId
    const cart = await Cart.findOne({ userId, status: 'ACTIVE' });
    console.log('Found cart:', cart ? 'Yes' : 'No');
    if (!cart) {
      console.log('Cart not found for userId:', userId);
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    if (!cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // ✅ Lọc chỉ lấy items đã được chọn (isSelected = true)
    const selectedItems = cart.items.filter(item => item.isSelected === true);

    if (!selectedItems.length) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán' });
    }

    // 2️⃣ Kiểm tra và trừ số lượng tồn kho (chỉ cho items đã chọn)
    // Đồng thời lấy costPrice thực tế từ batch
    console.log('Checking and reserving inventory...');
    const itemsWithCostPrice = [];

    for (const item of selectedItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Sản phẩm ${item.productName} không tồn tại`
        });
      }

      // Check if product has enough inventory
      if (!product.canFulfillQuantity(item.quantity)) {
        return res.status(400).json({
          message: `Sản phẩm ${item.productName} không đủ số lượng trong kho. Còn lại: ${product.totalQuantityAvailable}, yêu cầu: ${item.quantity}`
        });
      }

      // Lấy costPrice từ batch cũ nhất (FIFO)
      const availableBatches = product.inventoryBatches
        .filter(batch => batch.quantityRemaining > 0)
        .sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));

      const oldestBatch = availableBatches[0];
      const costPrice = oldestBatch ? oldestBatch.costPrice : 0;

      // Reserve inventory
      try {
        await product.reserveInventory(item.quantity);
        console.log(`Reserved ${item.quantity} units of product ${product.productName}`);

        // Lưu item với costPrice thực tế
        itemsWithCostPrice.push({
          ...item,
          costPrice: costPrice
        });
      } catch (error) {
        console.error('Error reserving inventory:', error);
        return res.status(400).json({
          message: `Không thể đặt hàng sản phẩm ${item.productName}: ${error.message}`
        });
      }
    }

    // 3️⃣ Chuẩn bị dữ liệu tạo Order (chỉ với items đã chọn)
    const selectedSubtotal = itemsWithCostPrice.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
    const selectedShippingFee = cart.estimatedShipping || 0;
    const selectedTotal = selectedSubtotal + selectedShippingFee;

    const orderData = {
      buyerInfo: {
        userId: userId,
        fullName: req.body.fullName || 'Unknown User', // Có thể lấy từ frontend
      },
      shippingAddress: {
        recipientName: shippingAddress.recipientName,
        phoneNumber: shippingAddress.phoneNumber,
        fullAddress: shippingAddress.fullAddress,
      },
      items: itemsWithCostPrice.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtAdd,
        thumbnailUrl: item.thumbnailUrl,
        costPriceAtPurchase: item.costPrice, // ✅ Dùng costPrice thực tế từ batch
      })),
      paymentInfo: {
        method: paymentMethod || 'COD',
        amount: selectedTotal,
        status: 'PENDING',
        transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      },
      subtotal: selectedSubtotal,
      shippingFee: selectedShippingFee,
      tipAmount: 0,
      finalAmount: selectedTotal,
      status: 'PENDING',
    };

    // 4️⃣ Tạo Order mới
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    console.log('Order created successfully:', savedOrder._id);

    // 5️⃣ Xóa CHỈ các items đã thanh toán khỏi cart (giữ lại items chưa chọn)
    cart.items = cart.items.filter(item => !item.isSelected);
    await cart.save();

    // 6️⃣ Gửi email cảm ơn
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password'
        }
      });

      const email = req.body.email || req.query.email || null; // optional from frontend
      if (email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'your-email@gmail.com',
          to: email,
          subject: 'Cảm ơn bạn đã đặt hàng - Craft Villages',
          html: `<div style="font-family:Arial,sans-serif"><h2 style="color:#b8860b">Cảm ơn ${orderData.buyerInfo.fullName}!</h2><p>Đơn hàng của bạn đã được tiếp nhận.</p><p><strong>Mã giao dịch:</strong> ${orderData.paymentInfo.transactionId}</p><p><strong>Tổng tiền:</strong> ${orderData.finalAmount.toLocaleString()} VND</p><p>Chúng tôi sẽ sớm liên hệ để giao hàng.</p></div>`
        });
      }
    } catch (e) {
      console.warn('Send thank-you email failed:', e.message);
    }

    // 7️⃣ Trả về kết quả
    res.status(201).json({
      message: 'Checkout successful, order created',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({
      message: 'Checkout failed',
      error: error.message,
    });
  }
};

module.exports = { checkout };
// Get orders by user
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ 'buyerInfo.userId': userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// Get order detail
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    console.log('Cancel order request:', req.params);
    const { orderId } = req.params;

    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    console.log('Found order:', order ? 'Yes' : 'No');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    // Kiểm tra trạng thái đơn hàng
    const currentStatus = order.status || order.paymentInfo?.status;
    console.log('Current status:', currentStatus);

    if (currentStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được hủy trước đó'
      });
    }

    if (currentStatus === 'CONFIRMED' || currentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đang trong quá trình vận chuyển, không thể hủy'
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'CANCELLED';
    if (order.paymentInfo) {
      order.paymentInfo.status = 'CANCELLED';
    }

    console.log('Saving order...');
    await order.save();
    console.log('Order saved successfully');

    res.json({
      success: true,
      message: 'Đã hủy đơn hàng thành công',
      order: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi hủy đơn hàng',
      error: error.message
    });
  }
};

// Get orders by shop (for seller dashboard)
const getOrdersByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build query to find orders containing products from this shop
    const Product = require('../models/Product');
    const products = await Product.find({ shopId }).select('_id');
    const productIds = products.map(p => p._id);

    let query = {
      'items.productId': { $in: productIds }
    };

    // Filter by status
    if (status && status !== 'all') {
      const statusMap = {
        'pending': 'PENDING',
        'processing': 'PROCESSING',
        'confirmed': 'CONFIRMED',
        'shipping': 'SHIPPED',
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED',
        'refunded': 'REFUNDED'
      };
      query.status = statusMap[status] || status.toUpperCase();
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by order ID, customer name, or phone
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'buyerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phoneNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('buyerInfo.userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    // Filter items to only include products from this shop
    const filteredOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item =>
        productIds.some(pid => pid.toString() === item.productId.toString())
      )
    }));

    res.json({
      success: true,
      data: filteredOrders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update order status (for seller)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, cancellationReason } = req.body;

    console.log('Update order status request:', {
      orderId,
      newStatus: status,
      note,
      cancellationReason
    });

    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Current order status:', order.status);

    // Use the model's updateStatus method
    try {
      await order.updateStatus(status, note);

      // If cancelling, save cancellation info
      if (status === 'CANCELLED' && cancellationReason) {
        order.cancellationReason = cancellationReason;
        order.cancelledBy = 'SELLER';
        order.cancelledAt = new Date();
      }

      await order.save();
      console.log('Status updated successfully to:', status);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      console.error('Error in updateStatus method:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get order statistics for shop
const getOrderStatistics = async (req, res) => {
  try {
    const { shopId } = req.params;

    const Product = require('../models/Product');
    const products = await Product.find({ shopId }).select('_id');
    const productIds = products.map(p => p._id);

    const query = {
      'items.productId': { $in: productIds }
    };

    // Get counts by status
    const statusCounts = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate revenue and profit
    const orders = await Order.find({
      ...query,
      status: { $nin: ['CANCELLED', 'REFUNDED'] }
    }).lean();

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalOrders = orders.length;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(pid => pid.toString() === item.productId.toString())) {
          const itemRevenue = item.priceAtPurchase * item.quantity;
          const itemCost = (item.costPriceAtPurchase || 0) * item.quantity;
          totalRevenue += itemRevenue;
          totalProfit += (itemRevenue - itemCost);
        }
      });
    });

    const stats = {
      all: totalOrders,
      pending: 0,
      processing: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };

    statusCounts.forEach(({ _id, count }) => {
      const key = _id.toLowerCase();
      if (key === 'shipped') stats.shipping = count;
      else stats[key] = count;
    });

    res.json({
      success: true,
      data: {
        counts: stats,
        revenue: {
          total: Math.round(totalRevenue),
          profit: Math.round(totalProfit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  checkout,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  getOrdersByShop,
  updateOrderStatus,
  getOrderStatistics
};
