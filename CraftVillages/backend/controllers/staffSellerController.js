const Shop = require('../models/Shop');
const User = require('../models/User');

/**
 * Lấy danh sách shop kèm thông tin user tương ứng
 */
async function getAllShopsWithUsers() {
  try {
    const shops = await Shop.find()
      .populate({
        path: 'sellerId',
        select: 'fullName email phoneNumber avatarUrl isActive', // chỉ lấy các trường cần thiết
      })
      .lean(); // chuyển kết quả sang object JS thuần

    return shops;
  } catch (error) {
    console.error('Error fetching shops with users:', error);
    throw new Error('Không thể lấy danh sách shop');
  }
}

async function getShopDetailById(shopId) {
  try {
    const shop = await Shop.findById(shopId)
      .populate({
        path: 'sellerId',
        select: 'fullName email phoneNumber avatarUrl isActive',
      })
      .populate({
        path: 'products',
        select: 'productName sellingPrice images description moderation.status',
      })
      .lean();

    if (!shop) {
      throw new Error('Không tìm thấy shop với ID này');
    }

    return shop;
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết shop:', error);
    throw error;
  }
}

async function adminToggleShop(shopId) {
    const shop = await Shop.findById(shopId);
    if (!shop) throw new Error('Shop not found');

    await shop.toggleActiveStatus();
    return {
        message: shop.isActive ? 'Shop has been unbanned (activated).' : 'Shop has been banned (deactivated).',
        shop
    };
}

module.exports = { getAllShopsWithUsers, getShopDetailById, adminToggleShop };
