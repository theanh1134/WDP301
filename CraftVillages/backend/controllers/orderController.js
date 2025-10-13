const Cart = require('../models/Cart');
const Order = require('../models/Order');

// [POST] /api/cart/:userId/checkout
const checkout = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shippingAddress, paymentMethod } = req.body;

    // 1️⃣ Tìm cart theo userId
    const cart = await Cart.findOne({ userId, status: 'ACTIVE' });
    if (!cart) {
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

    // 5️⃣ Trả về kết quả
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
