const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Submit a new review
const submitReview = async (req, res) => {
    try {
        console.log('Submit review request body:', req.body);
        console.log('Submit review request files:', req.files);
        console.log('User info:', req.user);

        const { productId, orderId, userId, rating, title, content } = req.body;
        const userFullName = req.user.fullName;

        // Xử lý upload images
        const imageUrls = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

        // Validate required fields
        if (!productId || !orderId || !userId || !rating || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin đánh giá'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Đánh giá phải từ 1 đến 5 sao'
            });
        }

        // Check if order exists and belongs to user
        console.log('Looking for order with ID:', orderId);
        const order = await Order.findById(orderId);
        console.log('Found order:', order ? 'Yes' : 'No');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại'
            });
        }

        if (order.buyerInfo.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền đánh giá đơn hàng này'
            });
        }

        // Check if order is PAID
        const orderStatus = order.status || order.paymentInfo?.status;
        if (orderStatus !== 'PAID') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã thanh toán'
            });
        }

        // Check if product exists in order
        console.log('Looking for product in order items:', order.items);
        const orderItem = order.items.find(item => item.productId.toString() === productId.toString());
        console.log('Found order item:', orderItem ? 'Yes' : 'No');
        if (!orderItem) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không tồn tại trong đơn hàng này'
            });
        }

        // Check if review already exists for this order
        console.log('Checking for existing review with orderId:', orderId);
        const existingReview = await Review.findOne({ orderId });
        console.log('Existing review found:', existingReview ? 'Yes' : 'No');
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá đơn hàng này rồi'
            });
        }

        // Get product info to get shopId
        console.log('Looking for product with ID:', productId);
        const product = await Product.findById(productId);
        console.log('Found product:', product ? 'Yes' : 'No');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Create new review
        const reviewData = {
            productId,
            shopId: product.shopId,
            orderId,
            reviewer: {
                userId,
                fullName: userFullName
            },
            title: title.trim(),
            content: content.trim(),
            rating: parseInt(rating),
            images: imageUrls,
            verifiedPurchase: true
        };

        console.log('Creating review with data:', reviewData);
        const newReview = new Review(reviewData);
        console.log('Saving review...');
        await newReview.save();
        console.log('Review saved successfully');

        res.status(201).json({
            success: true,
            message: 'Đánh giá đã được gửi thành công',
            review: newReview
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi gửi đánh giá',
            error: error.message
        });
    }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, status = 'VISIBLE' } = req.query;

        const reviews = await Review.find({ productId, status })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('reviewer.userId', 'fullName avatarUrl');

        const total = await Review.countDocuments({ productId, status });

        res.json({
            success: true,
            data: {
                reviews,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });

    } catch (error) {
        console.error('Error fetching product reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy đánh giá',
            error: error.message
        });
    }
};

// Get product reviews for display (simplified version)
const getProductReviewsForDisplay = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product ID không hợp lệ'
            });
        }

        const reviews = await Review.find({ productId, status: 'VISIBLE' })
            .populate('reviewer.userId', 'fullName avatarUrl')
            .sort({ createdAt: -1 })
            .limit(20); // Limit to 20 most recent reviews

        const total = await Review.countDocuments({ productId, status: 'VISIBLE' });

        // Calculate average rating
        const avgRating = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'VISIBLE' } },
            { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                reviews,
                totalReviews: total,
                averageRating: avgRating.length > 0 ? avgRating[0].averageRating : 0
            }
        });

    } catch (error) {
        console.error('Error fetching product reviews for display:', error);
        // console.error('ProductId:', productId);
        console.error('Error details:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy đánh giá sản phẩm',
            error: error.message
        });
    }
};

// Get average rating for a product
const getProductRating = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product ID không hợp lệ'
            });
        }

        const result = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'VISIBLE' } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        if (result.length === 0) {
            return res.json({
                success: true,
                data: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                }
            });
        }

        const { averageRating, totalReviews, ratingDistribution } = result[0];

        // Calculate rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach(rating => {
            distribution[rating] = (distribution[rating] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews,
                ratingDistribution: distribution
            }
        });

    } catch (error) {
        console.error('Error fetching product rating:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy đánh giá',
            error: error.message
        });
    }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Đánh giá không tồn tại'
            });
        }

        await review.incrementHelpful();

        res.json({
            success: true,
            message: 'Đã đánh dấu hữu ích',
            helpfulCount: review.helpfulCount
        });

    } catch (error) {
        console.error('Error marking review helpful:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra',
            error: error.message
        });
    }
};

// Get user's review for a specific order
const getUserReview = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ orderId, 'reviewer.userId': userId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        res.json({
            success: true,
            data: review
        });

    } catch (error) {
        console.error('Error fetching user review:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy đánh giá',
            error: error.message
        });
    }
};

// Update review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, content } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Đánh giá không tồn tại'
            });
        }

        // Kiểm tra quyền sở hữu
        if (review.reviewer.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền chỉnh sửa đánh giá này'
            });
        }

        // Kiểm tra có thể chỉnh sửa không
        if (!review.canEdit) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã hết quyền chỉnh sửa đánh giá này'
            });
        }

        // Cập nhật đánh giá
        review.rating = parseInt(rating);
        review.title = title.trim();
        review.content = content.trim();
        review.editCount += 1;
        review.canEdit = false; // Không thể chỉnh sửa nữa

        await review.save();

        res.json({
            success: true,
            message: 'Đánh giá đã được cập nhật thành công',
            data: review
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật đánh giá',
            error: error.message
        });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Đánh giá không tồn tại'
            });
        }

        // Kiểm tra quyền sở hữu
        if (review.reviewer.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa đánh giá này'
            });
        }

        // Kiểm tra có thể xóa không (trong 3 ngày)
        if (!review.canDelete) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa đánh giá sau 3 ngày'
            });
        }

        // Xóa đánh giá
        await Review.findByIdAndDelete(reviewId);

        res.json({
            success: true,
            message: 'Đánh giá đã được xóa thành công'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa đánh giá',
            error: error.message
        });
    }
};

module.exports = {
    submitReview,
    getProductReviews,
    getProductReviewsForDisplay,
    getProductRating,
    markHelpful,
    getUserReview,
    updateReview,
    deleteReview
};
