const express = require('express');
const router = express.Router();
const { getAllShopsWithUsers } = require('../controllers/staffSellerController');

router.get('/shops', async (req, res) => {
  try {
    const data = await getAllShopsWithUsers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
