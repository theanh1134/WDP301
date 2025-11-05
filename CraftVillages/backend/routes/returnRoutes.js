const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createReturns, getReturnedProductIds, countRefund, getReturnsByShop, getReturnStatisticsByShop } = require("../controllers/returnController");

// 🟢 Cấu hình Multer để lưu file trong /uploads/returns
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/returns");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🟢 Route tạo yêu cầu hoàn hàng
router.post("/", upload.array("files"), createReturns);

router.get('/order/:orderId/product-ids', getReturnedProductIds);
router.get('/count-return/:userId', countRefund);

// 🟢 Routes cho seller/shop
router.get('/shop/:shopId', getReturnsByShop);
router.get('/shop/:shopId/statistics', getReturnStatisticsByShop);

module.exports = router;
