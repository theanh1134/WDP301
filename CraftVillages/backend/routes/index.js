const express = require("express");
const router = express.Router();

const productRoutes = require("./productRoutes");
const cart = require("./cartRoutes");
const o = require("./orderRoutes");


router.use("/products", productRoutes);
router.use("/carts", cart);
router.use("/orders", o);

module.exports = router;