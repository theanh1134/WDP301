const express = require("express");
const router = express.Router();
const { getAllProducts, getDetailProduct } = require("../controllers/productController");

// Get all products
router.get("/", getAllProducts);
router.get("/:id", getDetailProduct);

module.exports = router;
