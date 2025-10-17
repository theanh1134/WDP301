const mongoose = require('mongoose');
const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const products = await Product.aggregate([
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

        // Get total count
        const total = await Product.countDocuments();

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
        const product = await Product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.id)
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
                    id: '$_id',
                    name: '$productName',
                    description: 1,
                    price: '$sellingPrice',
                    origin: '$shop.shopName',
                    shopId: '$shop._id',
                    image: { $arrayElemAt: ['$images.url', 0] },
                    additionalImages: {
                        $slice: [{ $map: { input: { $slice: ['$images', 1] }, as: 'img', in: '$$img.url' } }, 1, { $size: '$images' }]
                    },
                    categoryId: '$categoryId',
                    categoryName: '$category.categoryName',
                    category: {
                        _id: '$categoryId',
                        name: '$category.categoryName'
                    },
                    _id: 0
                }
            }
        ]);

        if (!product || product.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.status(200).json({
            success: true,
            data: product[0]
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

module.exports = {
    getAllProducts,
    getDetailProduct,
    getProductsByCategory
};
