const express = require("express");
const router = express.Router();
const { checkout, getOrdersByUser, getOrderById, cancelOrder } = require("../controllers/orderController");
const { auth } = require("../middleware/auth");

// Order routes
router.post("/:userId/checkout", checkout);
router.get("/user/:userId", auth, getOrdersByUser);
router.get("/detail/:id", auth, getOrderById);
router.put("/:orderId/cancel", auth, cancelOrder);

module.exports = router;
