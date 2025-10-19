const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getAllProducts, getDetailProduct, getProductsByCategory, createProduct, updateProduct, deleteProduct, getProductStatistics, addInventory, updateInventoryBatch } = require("../controllers/productController");
const { auth } = require("../middleware/auth");

// Configure multer for product image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 9 // Max 9 files
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    }
});

// Product routes
router.get("/", getAllProducts);
router.get("/category", getProductsByCategory);
router.get("/:id/statistics", auth, getProductStatistics);
router.get("/:id", getDetailProduct);
router.post("/", auth, upload.array('images', 9), createProduct);
router.put("/:id", auth, upload.array('images', 9), updateProduct);
router.post("/:productId/inventory", auth, addInventory);
router.put("/:productId/batches/:batchId", auth, updateInventoryBatch);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
