const express = require("express");
const router = express.Router();

const productRoutes = require("./productRoutes");
const cart = require("./cartRoutes");
const o = require("./orderRoutes");
const userRoutes = require("./userRoutes");
const shippingProviderRoutes = require("./shippingProviderRoutes");
const shipperSettingsRoutes = require("./shipperSettingsRoutes");
const shipperRoutes = require("./shipperRoutes");


router.use("/products", productRoutes);
router.use("/carts", cart);
router.use("/orders", o);
router.use("/users", userRoutes);
router.use("/shipping-providers", shippingProviderRoutes);
router.use("/shipper-settings", shipperSettingsRoutes);
router.use("/shipper", shipperRoutes);

module.exports = router;