const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Update inventory batch (edit batch prices)
const updateInventoryBatch = async (req, res) => {
    try {
        console.log('=== Update Batch Request ===');
        console.log('User:', req.user ? req.user._id : 'No user');
        console.log('Product ID:', req.params.productId);
        console.log('Batch ID:', req.params.batchId);
        console.log('Body:', req.body);

        const { productId, batchId } = req.params;
        const { costPrice, sellingPrice } = req.body;

        // Validate input
        if (!costPrice || costPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá nhập phải lớn hơn 0'
            });
        }

        if (!sellingPrice || sellingPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá bán phải lớn hơn 0'
            });
        }

        // Validate selling price is higher than cost price
        if (parseFloat(sellingPrice) <= parseFloat(costPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Giá bán phải lớn hơn giá nhập để có lợi nhuận'
            });
        }

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Check ownership (optional - comment out if not needed)
        // if (product.shopId.toString() !== req.user.shopId?.toString()) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Bạn không có quyền sửa sản phẩm này'
        //     });
        // }

        // Find batch
        const batch = product.inventoryBatches.id(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lô hàng'
            });
        }

        // Update batch prices
        batch.costPrice = parseFloat(costPrice);
        batch.sellingPrice = parseFloat(sellingPrice);

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật lô hàng thành công',
            data: {
                batch: {
                    _id: batch._id,
                    costPrice: batch.costPrice,
                    sellingPrice: batch.sellingPrice,
                    quantityReceived: batch.quantityReceived,
                    quantityRemaining: batch.quantityRemaining,
                    receivedDate: batch.receivedDate
                }
            }
        });
    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật lô hàng',
            error: error.message
        });
    }
};

// Add inventory to existing product (restock)
const addInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, costPrice, sellingPrice } = req.body;

        // Validate input
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải lớn hơn 0'
            });
        }

        if (!costPrice || costPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá nhập phải lớn hơn 0'
            });
        }

        if (!sellingPrice || sellingPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá bán phải lớn hơn 0'
            });
        }

        // Validate selling price is higher than cost price
        if (parseFloat(sellingPrice) <= parseFloat(costPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Giá bán phải lớn hơn giá nhập để có lợi nhuận'
            });
        }

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const batchSellingPrice = parseFloat(sellingPrice);

        // Add new inventory batch
        product.inventoryBatches.push({
            quantityReceived: parseInt(quantity),
            quantityRemaining: parseInt(quantity),
            costPrice: parseFloat(costPrice),
            sellingPrice: batchSellingPrice,
            receivedDate: new Date()
        });

        await product.save();

        // Calculate new totals
        const totalStock = product.inventoryBatches.reduce((sum, batch) =>
            sum + batch.quantityRemaining, 0);
        const totalValue = product.inventoryBatches.reduce((sum, batch) =>
            sum + (batch.costPrice * batch.quantityRemaining), 0);
        const avgCostPrice = totalStock > 0 ? totalValue / totalStock : 0;

        res.status(200).json({
            success: true,
            message: 'Nhập hàng thành công',
            data: {
                productId: product._id,
                productName: product.productName,
                newBatch: {
                    quantity: parseInt(quantity),
                    costPrice: parseFloat(costPrice),
                    sellingPrice: parseFloat(sellingPrice),
                    receivedDate: new Date()
                },
                totalStock,
                averageCostPrice: avgCostPrice,
                inventoryBatches: product.inventoryBatches
            }
        });
    } catch (error) {
        console.error('Error adding inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi nhập hàng',
            error: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const { shopId } = req.query;

        // Build match stage
        const matchStage = {};
        if (shopId) {
            matchStage.shopId = new mongoose.Types.ObjectId(shopId);
        }

        const products = await Product.aggregate([
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
            {
                $lookup: {
                    from: 'shops',
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'shop'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                status: { $nin: ['CANCELLED', 'REFUNDED'] }
                            }
                        },
                        { $unwind: '$items' },
                        {
                            $match: {
                                $expr: { $eq: ['$items.productId', '$$productId'] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalSold: { $sum: '$items.quantity' }
                            }
                        }
                    ],
                    as: 'orderStats'
                }
            },
            {
                $unwind: {
                    path: '$shop',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    // Calculate displayPrice (FIFO - oldest batch with stock)
                    displayPrice: {
                        $let: {
                            vars: {
                                availableBatches: {
                                    $filter: {
                                        input: '$inventoryBatches',
                                        as: 'batch',
                                        cond: { $gt: ['$$batch.quantityRemaining', 0] }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$availableBatches' }, 0] },
                                    then: {
                                        $ifNull: [
                                            { $arrayElemAt: ['$$availableBatches.sellingPrice', 0] },
                                            '$sellingPrice'
                                        ]
                                    },
                                    else: '$sellingPrice'
                                }
                            }
                        }
                    },
                    // Calculate priceRange
                    priceRange: {
                        $let: {
                            vars: {
                                availablePrices: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: '$inventoryBatches',
                                                as: 'batch',
                                                cond: { $gt: ['$$batch.quantityRemaining', 0] }
                                            }
                                        },
                                        as: 'batch',
                                        in: { $ifNull: ['$$batch.sellingPrice', '$sellingPrice'] }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$availablePrices' }, 0] },
                                    then: {
                                        min: { $min: '$$availablePrices' },
                                        max: { $max: '$$availablePrices' }
                                    },
                                    else: {
                                        min: '$sellingPrice',
                                        max: '$sellingPrice'
                                    }
                                }
                            }
                        }
                    },
                    // Calculate maxQuantityPerOrder (quantity of oldest batch)
                    maxQuantityPerOrder: {
                        $let: {
                            vars: {
                                availableBatches: {
                                    $filter: {
                                        input: '$inventoryBatches',
                                        as: 'batch',
                                        cond: { $gt: ['$$batch.quantityRemaining', 0] }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$availableBatches' }, 0] },
                                    then: { $arrayElemAt: ['$$availableBatches.quantityRemaining', 0] },
                                    else: 0
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    productName: 1,
                    name: '$productName',
                    description: 1,
                    sellingPrice: 1,
                    price: '$sellingPrice',
                    displayPrice: 1,
                    priceRange: 1,
                    maxQuantityPerOrder: 1,
                    origin: '$shop.shopName',
                    shopId: '$shop._id',
                    image: { $arrayElemAt: ['$images.url', 0] },
                    images: 1,
                    categoryId: '$categoryId',
                    categoryName: '$category.categoryName',
                    category: {
                        _id: '$categoryId',
                        name: '$category.categoryName'
                    },
                    stock: {
                        $sum: '$inventoryBatches.quantityRemaining'
                    },
                    sku: 1,
                    sold: {
                        $ifNull: [
                            { $arrayElemAt: ['$orderStats.totalSold', 0] },
                            0
                        ]
                    }
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        // Get total count with same filter
        const total = await Product.countDocuments(matchStage);

        res.status(200).json({
            success: true,
            data: {
                products,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm',
            error: error.message
        });
    }
};

const getDetailProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $lookup: {
                    from: 'shops',
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'shop'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$shop',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    // Calculate displayPrice (FIFO - oldest batch with stock)
                    displayPrice: {
                        $let: {
                            vars: {
                                availableBatches: {
                                    $filter: {
                                        input: '$inventoryBatches',
                                        as: 'batch',
                                        cond: { $gt: ['$$batch.quantityRemaining', 0] }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$availableBatches' }, 0] },
                                    then: {
                                        $ifNull: [
                                            { $arrayElemAt: ['$$availableBatches.sellingPrice', 0] },
                                            '$sellingPrice'
                                        ]
                                    },
                                    else: '$sellingPrice'
                                }
                            }
                        }
                    },
                    // Calculate priceRange
                    priceRange: {
                        $let: {
                            vars: {
                                availablePrices: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: '$inventoryBatches',
                                                as: 'batch',
                                                cond: { $gt: ['$$batch.quantityRemaining', 0] }
                                            }
                                        },
                                        as: 'batch',
                                        in: { $ifNull: ['$$batch.sellingPrice', '$sellingPrice'] }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$availablePrices' }, 0] },
                                    then: {
                                        min: { $min: '$$availablePrices' },
                                        max: { $max: '$$availablePrices' }
                                    },
                                    else: {
                                        min: '$sellingPrice',
                                        max: '$sellingPrice'
                                    }
                                }
                            }
                        }
                    },
                    // Calculate maxQuantityPerOrder (quantity of oldest batch)
                    maxQuantityPerOrder: {
                        $let: {
                            vars: {
                                availableBatches: {
                                    $filter: {
                                        input: '$inventoryBatches',
                                        as: 'batch',
                                        cond: { $gt: ['$$batch.quantityRemaining', 0] }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$availableBatches' }, 0] },
                                    then: { $arrayElemAt: ['$$availableBatches.quantityRemaining', 0] },
                                    else: 0
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    id: '$_id',
                    productName: 1,
                    name: '$productName',
                    description: 1,
                    sellingPrice: 1,
                    price: '$sellingPrice',
                    displayPrice: 1,
                    priceRange: 1,
                    maxQuantityPerOrder: 1,
                    sku: 1,
                    quantity: {
                        $sum: '$inventoryBatches.quantityRemaining'
                    },
                    stock: {
                        $sum: '$inventoryBatches.quantityRemaining'
                    },
                    inventoryBatches: 1,
                    origin: '$shop.shopName',
                    shopId: '$shop._id',
                    shop: {
                        _id: '$shop._id',
                        shopName: '$shop.shopName',
                        description: '$shop.description',
                        bannerUrl: '$shop.bannerUrl',
                        avatarUrl: '$shop.avatarUrl',
                        rating: '$shop.rating',
                        statistics: '$shop.statistics',
                        responseTime: '$shop.responseTime',
                        createdAt: '$shop.createdAt',
                        lastActivityAt: '$shop.lastActivityAt',
                        isActive: '$shop.isActive'
                    },
                    image: { $arrayElemAt: ['$images.url', 0] },
                    images: {
                        $map: {
                            input: '$images',
                            as: 'img',
                            in: '$$img.url'
                        }
                    },
                    additionalImages: {
                        $cond: {
                            if: { $gt: [{ $size: '$images' }, 1] },
                            then: {
                                $map: {
                                    input: { $slice: ['$images', 1, { $size: '$images' }] },
                                    as: 'img',
                                    in: '$$img.url'
                                }
                            },
                            else: []
                        }
                    },
                    categoryId: '$categoryId',
                    categoryName: '$category.categoryName',
                    category: {
                        _id: '$categoryId',
                        name: '$category.categoryName'
                    }
                }
            }
        ]);

        if (!product || product.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Calculate total sold from orders
        const orders = await Order.find({
            'items.productId': new mongoose.Types.ObjectId(productId),
            status: { $nin: ['CANCELLED', 'REFUNDED'] }
        }).lean();

        let totalSold = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId.toString() === productId) {
                    totalSold += item.quantity;
                }
            });
        });

        // Add sold field to product
        const productData = {
            ...product[0],
            sold: totalSold
        };

        res.status(200).json({
            success: true,
            data: productData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết sản phẩm',
            error: error.message
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { category, exclude } = req.query;
        const excludeIds = exclude ? exclude.split(',').map(id => new mongoose.Types.ObjectId(id)) : [];

        const products = await Product.aggregate([
            {
                $match: {
                    categoryId: new mongoose.Types.ObjectId(category),
                    _id: { $nin: excludeIds }
                }
            },
            {
                $lookup: {
                    from: 'shops',
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'shop'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$shop',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: '$productName',
                    description: 1,
                    price: '$sellingPrice',
                    origin: '$shop.shopName',
                    shopId: '$shop._id',
                    image: { $arrayElemAt: ['$images.url', 0] },
                    categoryId: '$categoryId',
                    categoryName: '$category.categoryName',
                    category: {
                        _id: '$categoryId',
                        name: '$category.categoryName'
                    },
                    material: 1,
                    finish: 1,
                    decoration: 1,
                    color: 1,
                    dimensions: 1,
                    weight: 1,
                    specifications: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm theo danh mục',
            error: error.message
        });
    }
};

// Create new product
const createProduct = async (req, res) => {
    try {
        const {
            shopId,
            categoryId,
            productName,
            description,
            sellingPrice,
            quantity,
            costPrice,
            sku
        } = req.body;

        // Validate required fields
        if (!shopId || !categoryId || !productName || !description || !sellingPrice) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Check if images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thêm ít nhất 1 ảnh sản phẩm'
            });
        }

        // Create product images array with first image as thumbnail
        const productImages = req.files.map((file, index) => ({
            url: `/uploads/products/${file.filename}`,
            isThumbnail: index === 0
        }));

        // Create inventory batch if quantity is provided
        const inventoryBatches = [];
        if (quantity && quantity > 0) {
            inventoryBatches.push({
                quantityReceived: parseInt(quantity),
                quantityRemaining: parseInt(quantity),
                costPrice: costPrice || sellingPrice * 0.7, // Default cost price is 70% of selling price
                sellingPrice: parseFloat(sellingPrice), // Each batch has its own selling price
                receivedDate: new Date()
            });
        }

        // Create product
        const product = new Product({
            shopId,
            categoryId,
            productName,
            description,
            sellingPrice: parseFloat(sellingPrice),
            images: productImages,
            inventoryBatches,
            moderation: {
                status: 'PENDING'
            }
        });

        // Add SKU if provided
        if (sku) {
            product.sku = sku;
        }

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công! Sản phẩm đang chờ duyệt.',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo sản phẩm',
            error: error.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        console.log('Update product request:', { id, body: req.body });

        // Extract quantity if provided (it's not a direct field in schema)
        const newQuantity = updateData.quantity ? parseInt(updateData.quantity) : null;
        console.log('New quantity:', newQuantity);
        delete updateData.quantity; // Remove from updateData as it's not a schema field

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `/uploads/products/${file.filename}`,
                isThumbnail: false
            }));

            // Get existing product to preserve images
            const existingProduct = await Product.findById(id);
            if (existingProduct && existingProduct.images) {
                // Keep existing images and add new ones
                updateData.images = [...existingProduct.images, ...newImages];
                // Ensure first image is thumbnail
                if (updateData.images.length > 0) {
                    updateData.images[0].isThumbnail = true;
                }
            } else {
                updateData.images = newImages;
                if (newImages.length > 0) {
                    updateData.images[0].isThumbnail = true;
                }
            }
        }

        // Update the product basic info
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Update inventory if quantity is provided
        if (newQuantity !== null && newQuantity >= 0) {
            // Calculate current total quantity
            const currentQuantity = updatedProduct.inventoryBatches.reduce(
                (total, batch) => total + batch.quantityRemaining,
                0
            );

            console.log('Current quantity:', currentQuantity, 'New quantity:', newQuantity);

            if (newQuantity !== currentQuantity) {
                console.log('Updating inventory batches...');
                // Clear existing batches and create new one with updated quantity
                updatedProduct.inventoryBatches = [{
                    quantityReceived: newQuantity,
                    quantityRemaining: newQuantity,
                    costPrice: updateData.costPrice || updatedProduct.sellingPrice * 0.7,
                    sellingPrice: updatedProduct.sellingPrice, // Use product's selling price
                    receivedDate: new Date()
                }];

                await updatedProduct.save();
                console.log('Inventory updated successfully');
            }
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm',
            error: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopId } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Verify ownership - only shop owner can delete
        if (shopId && product.shopId.toString() !== shopId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa sản phẩm này'
            });
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm',
            error: error.message
        });
    }
};

// Get product statistics
const getProductStatistics = async (req, res) => {
    try {
        const { id } = req.params;

        // Get product details
        const product = await Product.findById(id)
            .populate('categoryId', 'categoryName')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Calculate inventory statistics
        const totalStock = product.inventoryBatches.reduce(
            (sum, batch) => sum + batch.quantityRemaining,
            0
        );

        const totalInventoryValue = product.inventoryBatches.reduce(
            (sum, batch) => sum + (batch.costPrice * batch.quantityRemaining),
            0
        );

        const averageCostPrice = totalStock > 0 ? totalInventoryValue / totalStock : 0;

        console.log('Inventory calculation:', {
            totalStock,
            totalInventoryValue,
            averageCostPrice,
            batches: product.inventoryBatches
        });

        // Get sales data from orders
        // First, check all orders with this product
        const allOrdersWithProduct = await Order.find({
            'items.productId': new mongoose.Types.ObjectId(id)
        }).lean();

        console.log(`Total orders with product ${id}:`, allOrdersWithProduct.length);
        if (allOrdersWithProduct.length > 0) {
            console.log('Order statuses:', allOrdersWithProduct.map(o => o.status));
            console.log('First order:', JSON.stringify(allOrdersWithProduct[0], null, 2));
        }

        // Get orders (include all statuses except CANCELLED and REFUNDED)
        const orders = await Order.find({
            'items.productId': new mongoose.Types.ObjectId(id),
            status: { $nin: ['CANCELLED', 'REFUNDED'] }
        }).lean();

        console.log(`Orders for statistics (excluding cancelled/refunded):`, orders.length);

        let totalSold = 0;
        let totalRevenue = 0;
        let totalProfit = 0;
        const recentOrders = [];

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId.toString() === id) {
                    totalSold += item.quantity;
                    const itemRevenue = item.priceAtPurchase * item.quantity;
                    totalRevenue += itemRevenue;

                    // ✅ Tính profit từ order item (đã lưu costPriceAtPurchase)
                    const itemCost = (item.costPriceAtPurchase || 0) * item.quantity;
                    const itemProfit = itemRevenue - itemCost;
                    totalProfit += itemProfit;

                    recentOrders.push({
                        orderId: order._id,
                        orderDate: order.createdAt,
                        quantity: item.quantity,
                        priceAtPurchase: item.priceAtPurchase,
                        totalAmount: itemRevenue,
                        status: order.status
                    });
                }
            });
        });

        // Calculate profit using current product's sellingPrice and averageCostPrice
        // Profit = (sellingPrice - costPrice) × totalSold
        const profitPerUnit = product.sellingPrice - averageCostPrice;
        totalProfit = profitPerUnit * totalSold;

        console.log('Profit calculation:', {
            sellingPrice: product.sellingPrice,
            averageCostPrice: averageCostPrice,
            profitPerUnit: profitPerUnit,
            totalSold: totalSold,
            totalProfit: totalProfit
        });

        console.log('Final totals:', {
            totalSold,
            totalRevenue,
            totalProfit,
            averageCostPrice
        });

        // Sort and limit recent orders
        recentOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        const limitedRecentOrders = recentOrders.slice(0, 10);

        // Get reviews
        const reviews = await Review.find({
            productId: new mongoose.Types.ObjectId(id),
            status: 'VISIBLE'
        }).lean();

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        // Calculate performance metrics
        const daysSinceCreation = Math.max(1, Math.floor((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)));
        const salesVelocity = totalSold / daysSinceCreation;
        const conversionRate = 0; // Would need view tracking
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        const statistics = {
            inventory: {
                totalStock,
                averageCostPrice: Math.round(averageCostPrice),
                totalInventoryValue: Math.round(totalInventoryValue),
                batches: product.inventoryBatches.map(batch => ({
                    batchId: batch.batchId,
                    receivedDate: batch.receivedDate,
                    quantityReceived: batch.quantityReceived,
                    quantityRemaining: batch.quantityRemaining,
                    costPrice: batch.costPrice,
                    sellingPrice: batch.sellingPrice || product.sellingPrice
                }))
            },
            sales: {
                totalSold,
                totalOrders: orders.length,
                recentOrders: limitedRecentOrders
            },
            revenue: {
                totalRevenue: Math.round(totalRevenue),
                totalProfit: Math.round(totalProfit)
            },
            reviews: {
                totalReviews,
                averageRating
            },
            performance: {
                salesVelocity,
                conversionRate,
                averageOrderValue: Math.round(averageOrderValue),
                profitMargin
            }
        };

        res.status(200).json({
            success: true,
            data: {
                product: {
                    ...product,
                    category: product.categoryId
                },
                statistics
            }
        });
    } catch (error) {
        console.error('Get product statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê sản phẩm',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getDetailProduct,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStatistics,
    addInventory,
    updateInventoryBatch
};
