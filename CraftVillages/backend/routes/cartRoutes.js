const express = require("express");
const router = express.Router();
const { addCart, getCartByUserId,updateCartItemQuantity,removeCartItem } = require("../controllers/cartController");

// Get all products
router.post("/", addCart);
router.get("/:userId", getCartByUserId);
router.put('/quantity', updateCartItemQuantity);
router.delete('/:userId/item/:productId', removeCartItem);

module.exports = router;
