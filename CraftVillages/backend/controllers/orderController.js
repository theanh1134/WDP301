const Cart = require('../models/Cart');
const Order = require('../models/Order');
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

    // 2️⃣ Chuẩn bị dữ liệu tạo Order
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
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtAdd,
        thumbnailUrl: item.thumbnailUrl,
        costPriceAtPurchase: item.priceAtAdd * 0.8, // giả sử cost = 80% price
      })),
      paymentInfo: {
        method: paymentMethod || 'COD',
        amount: cart.estimatedTotal,
        status: 'PENDING',
        transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      },
      subtotal: cart.subtotal,
      shippingFee: cart.estimatedShipping || 0,
      tipAmount: 0,
      finalAmount: cart.estimatedTotal,
      status: 'PENDING',
    };

    // 3️⃣ Tạo Order mới
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    // 4️⃣ Xóa cart sau khi tạo đơn thành công
    await Cart.deleteOne({ _id: cart._id });

    // 5️⃣ Gửi email cảm ơn
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

    // 6️⃣ Trả về kết quả
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

module.exports = { checkout, getOrdersByUser, getOrderById, cancelOrder };
