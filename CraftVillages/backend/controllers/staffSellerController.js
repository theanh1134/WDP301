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

module.exports = { getAllShopsWithUsers };
