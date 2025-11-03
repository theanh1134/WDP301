const express = require("express");
const router = express.Router();
const {
  checkout,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  confirmDelivery,
  getOrdersByShop,
  updateOrderStatus,
  getOrderStatistics,
  getShopRevenue,
  getShopAnalytics,
  getProductAnalytics
} = require("../controllers/orderController");
const { auth } = require("../middleware/auth");

// Order routes
router.post("/:userId/checkout", checkout);
router.get("/user/:userId", auth, getOrdersByUser);
router.get("/detail/:id", auth, getOrderById);
router.put("/:orderId/cancel", auth, cancelOrder);
router.put("/:orderId/confirm-delivery", auth, confirmDelivery);

// Seller order management routes
router.get("/shop/:shopId", auth, getOrdersByShop);
router.get("/shop/:shopId/statistics", auth, getOrderStatistics);
router.get("/shop/:shopId/revenue", auth, getShopRevenue);
router.get("/shop/:shopId/analytics", auth, getShopAnalytics);
router.get("/product/:productId/analytics", auth, getProductAnalytics);
router.put("/:orderId/status", auth, updateOrderStatus);

module.exports = router;
