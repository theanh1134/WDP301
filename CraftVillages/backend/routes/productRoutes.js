const express = require("express");
const router = express.Router();
const { getAllProducts, getDetailProduct, getProductsByCategory } = require("../controllers/productController");

// Get all products
router.get("/", getAllProducts);
router.get("/category", getProductsByCategory);
router.get("/:id", getDetailProduct);

module.exports = router;
