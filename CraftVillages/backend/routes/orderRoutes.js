const express = require("express");
const router = express.Router();
const { checkout } = require("../controllers/orderController");

// Get all products
router.post("/:userId/checkout", checkout);

module.exports = router;
