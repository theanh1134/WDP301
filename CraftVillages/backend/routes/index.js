const express = require("express");
const router = express.Router();

const productRoutes = require("./productRoutes");
const cart = require("./cartRoutes");
const o = require("./orderRoutes");
const userRoutes = require("./userRoutes");


router.use("/products", productRoutes);
router.use("/carts", cart);
router.use("/orders", o);
router.use("/users", userRoutes);

module.exports = router;