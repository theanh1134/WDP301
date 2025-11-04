const express = require("express");
const router = express.Router();

const productRoutes = require("./productRoutes");
const cart = require("./cartRoutes");
const o = require("./orderRoutes");
const userRoutes = require("./userRoutes");
const as = require('./staffSellerRouter')
const r = require('./returnRoutes')
const shipperRoutes = require('./shipperRoutes')

router.use("/products", productRoutes);
router.use("/carts", cart);
router.use("/orders", o);
router.use("/users", userRoutes);
router.use("/staff", as)
router.use("/return", r)
router.use("/shipper", shipperRoutes)

module.exports = router;