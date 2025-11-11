const express = require('express');
const router = express.Router();
const { getAllShopsWithUsers, getShopDetailById, adminToggleShop } = require('../controllers/staffSellerController');
const { getAllReturns, getReturnById, approveReturn, rejectReturn, getPendingReturnsCount } = require('../controllers/staffReturnController');

router.get('/shops', async (req, res) => {
  try {
    const data = await getAllShopsWithUsers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/shops/:id',  async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await getShopDetailById(id);

    return res.status(200).json({
      status: 200,
      message: 'Lấy chi tiết shop thành công',
      data: shop,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message || 'Lỗi server khi lấy chi tiết shop',
    });
  }
});

router.patch('/shops/:shopId/toggle', async (req, res) => {
    try {
        const { shopId } = req.params;
        const result = await adminToggleShop(shopId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/returns', getAllReturns)
router.get('/returns/pending-count', getPendingReturnsCount)
router.get('/returns/:id', getReturnById)

router.patch('/returns/:id/approve', approveReturn);
router.patch('/returns/:id/reject', rejectReturn);

module.exports = router;
