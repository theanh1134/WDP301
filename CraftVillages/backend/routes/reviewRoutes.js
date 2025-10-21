const express = require("express");
const multer = require("multer");
const router = express.Router();
const { submitReview, getProductReviews, getProductReviewsForDisplay, getProductRating, markHelpful, getUserReview, updateReview, deleteReview } = require("../controllers/reviewController");
const { auth } = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/reviews/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Max 5 files
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Review routes
router.post("/", auth, upload.array('images', 5), submitReview);
router.get("/product/:productId", getProductReviews);
router.get("/product/:productId/display", getProductReviewsForDisplay);
router.get("/product/:productId/rating", getProductRating);
router.get("/order/:orderId", auth, getUserReview);
router.put("/:reviewId", auth, updateReview);
router.delete("/:reviewId", auth, deleteReview);
router.put("/:reviewId/helpful", markHelpful);

module.exports = router;
