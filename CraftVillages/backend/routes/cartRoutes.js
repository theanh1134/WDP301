const express = require("express");
const router = express.Router();
const { addCart, getCartByUserId, updateCartItemQuantity, removeCartItem, toggleItemSelection } = require("../controllers/cartController");

// Cart routes
router.post("/", addCart);
router.get("/:userId", getCartByUserId);
router.put('/quantity', updateCartItemQuantity);
router.put('/:userId/toggle-select/:productId', toggleItemSelection);
router.delete('/:userId/item/:productId', removeCartItem);

module.exports = router;
