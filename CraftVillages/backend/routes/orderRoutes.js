const express = require("express");
const router = express.Router();
const {
  checkout,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  getOrdersByShop,
  updateOrderStatus,
  getOrderStatistics
} = require("../controllers/orderController");
const { auth } = require("../middleware/auth");

// Order routes
router.post("/:userId/checkout", checkout);
router.get("/user/:userId", auth, getOrdersByUser);
router.get("/detail/:id", auth, getOrderById);
router.put("/:orderId/cancel", auth, cancelOrder);

// Seller order management routes
router.get("/shop/:shopId", auth, getOrdersByShop);
router.get("/shop/:shopId/statistics", auth, getOrderStatistics);
router.put("/:orderId/status", auth, updateOrderStatus);

module.exports = router;
