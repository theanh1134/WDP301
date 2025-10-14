const Cart = require('../models/Cart');

// [POST] /api/carts
const addCart = async (req, res) => {
  try {
    const { userId, items, notes, currency } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // 🔍 Tìm cart đang ACTIVE của user
    let cart = await Cart.findOne({
      userId,
      status: 'ACTIVE',
    });

    // 🛒 Nếu chưa có thì tạo mới
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        notes: notes || '',
        currency: currency || 'VND',
        status: 'ACTIVE',
      });
      await cart.save();
    }

    // ➕ Nếu có items thì thêm item vào cart
    if (items && items.length > 0) {
      const item = items[0];

      if (typeof cart.addItem === 'function') {
        await cart.addItem(item);
      } else {
        cart.items.push(item);
        await cart.save();
      }
    }

    // ✅ Trả kết quả
    res.status(200).json({
      message: 'Cart updated successfully',
      cart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      message: 'Failed to add to cart',
      error: error.message,
    });
  }
};


// [GET] /api/cart/:userId
const getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // 🔍 Tìm cart theo userId (trạng thái ACTIVE)
    const cart = await Cart.findOne({ userId, status: 'ACTIVE' });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // ✅ Trả dữ liệu trực tiếp từ bảng Cart
    res.status(200).json({
      message: 'Cart retrieved successfully',
      cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      message: 'Failed to fetch cart',
      error: error.message,
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    // const { userId, productId } = req.params;
    const { userId, productId, quantity } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Tìm cart theo userId và trạng thái ACTIVE
    const cart = await Cart.findOne({ userId, status: 'ACTIVE' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // Tìm item trong giỏ hàng
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Cập nhật số lượng
    item.quantity = quantity;

    // Tính lại tổng tiền
    cart.subtotal = cart.items.reduce(
      (total, i) => total + i.priceAtAdd * i.quantity,
      0
    );
    cart.estimatedTotal = cart.subtotal;

    // Lưu lại cart
    await cart.save();

    res.status(200).json({
      message: 'Cart item quantity updated successfully',
      cart,
    });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({
      message: 'Failed to update cart item quantity',
      error: error.message,
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId, status: 'ACTIVE' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // Kiểm tra xem item có trong giỏ không
    const itemIndex = cart.items.findIndex(
      (i) => i.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Xóa item khỏi giỏ
    cart.items.splice(itemIndex, 1);

    // Tính lại subtotal và estimatedTotal
    cart.subtotal = cart.items.reduce(
      (total, i) => total + i.priceAtAdd * i.quantity,
      0
    );
    cart.estimatedTotal = cart.subtotal;

    // Lưu lại cart
    await cart.save();

    res.status(200).json({
      message: 'Item removed from cart successfully',
      cart,
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};


module.exports = { addCart, getCartByUserId, updateCartItemQuantity, removeCartItem };
