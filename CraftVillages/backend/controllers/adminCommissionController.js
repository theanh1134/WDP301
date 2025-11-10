const Shop = require('../models/Shop');
const PlatformFeeConfig = require('../models/PlatformFeeConfig');
const CommissionChange = require('../models/CommissionChange');

/**
 * PUT /api/admin/commission/global
 * Cập nhật tỷ lệ hoa hồng mặc định cho toàn bộ hệ thống
 * Body: { percentageRate: number (0-100), reason?: string, note?: string, overrideShopConfigs?: boolean }
 * - Nếu overrideShopConfigs=true: ghi đè tất cả cấu hình shop-specific về tỷ lệ mới
 */
const updateGlobalCommission = async (req, res) => {
    try {
        const { percentageRate, reason = '', note = '', overrideShopConfigs = false } = req.body;

        if (percentageRate === undefined || percentageRate === null) {
            return res.status(400).json({
                success: false,
                message: 'percentageRate is required'
            });
        }

        const normalizedRate = parseFloat(percentageRate);
        if (Number.isNaN(normalizedRate) || normalizedRate < 0 || normalizedRate > 100) {
            return res.status(400).json({
                success: false,
                message: 'Commission rate must be between 0 and 100'
            });
        }

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Find or create default config
        let globalConfig = await PlatformFeeConfig.getApplicableConfig({});
        if (!globalConfig || (globalConfig.applicableShops && globalConfig.applicableShops.length > 0)) {
            // Ensure a true global default exists
            globalConfig = await PlatformFeeConfig.createDefault();
        }

        const previousRate = globalConfig.feeType === 'PERCENTAGE' ? globalConfig.percentageRate : null;

        // Update global default
        globalConfig.feeType = 'PERCENTAGE';
        globalConfig.percentageRate = normalizedRate;
        globalConfig.isActive = true;
        globalConfig.updatedBy = userId;
        globalConfig.effectiveFrom = new Date();
        await globalConfig.save();

        let overriddenCount = 0;
        if (overrideShopConfigs) {
            // Fetch all shop-specific configs and update them
            const shopConfigs = await PlatformFeeConfig.find({
                isActive: true,
                applicableShops: { $exists: true, $not: { $size: 0 } }
            }).lean();

            if (shopConfigs.length > 0) {
                const configIds = shopConfigs.map(c => c._id);
                await PlatformFeeConfig.updateMany(
                    { _id: { $in: configIds } },
                    {
                        $set: {
                            feeType: 'PERCENTAGE',
                            percentageRate: normalizedRate,
                            updatedBy: userId,
                            effectiveFrom: new Date()
                        }
                    }
                );
                overriddenCount = shopConfigs.length;

                // Create history entries per shop for transparency
                const changeDocs = [];
                for (const cfg of shopConfigs) {
                    const prev = cfg.feeType === 'PERCENTAGE' ? cfg.percentageRate : null;
                    if (cfg.applicableShops && cfg.applicableShops.length) {
                        for (const shopId of cfg.applicableShops) {
                            changeDocs.push({
                                shopId,
                                sellerId: null, // optional: can be populated if needed by joining Shop
                                configId: cfg._id,
                                changedBy: userId,
                                previousRate: prev,
                                newRate: normalizedRate,
                                feeType: 'PERCENTAGE',
                                reason: reason || `Ghi đè tỷ lệ theo cấu hình toàn cục`,
                                note,
                                appliedAt: new Date()
                            });
                        }
                    }
                }
                if (changeDocs.length) {
                    await CommissionChange.insertMany(changeDocs, { ordered: false });
                }
            }
        }

        res.json({
            success: true,
            message: 'Global commission updated successfully',
            data: {
                previousRate,
                newRate: normalizedRate,
                overriddenConfigs: overriddenCount
            }
        });
    } catch (error) {
        console.error('Error updating global commission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update global commission',
            error: error.message
        });
    }
};

/**
 * Normalize config to readable format
 */
const normalizeConfig = (config) => {
    if (!config) {
        return null;
    }

    let currentRate = null;
    if (config.feeType === 'PERCENTAGE') {
        currentRate = config.percentageRate;
    } else if (config.feeType === 'FIXED') {
        currentRate = config.fixedAmount;
    }

    return {
        configId: config._id,
        configName: config.name,
        feeType: config.feeType,
        currentRate,
        formattedRate: config.formattedRate,
        applicableShops: config.applicableShops || [],
        applicableCategories: config.applicableCategories || [],
        effectiveFrom: config.effectiveFrom,
        effectiveTo: config.effectiveTo,
        isCustom: Boolean(config.applicableShops && config.applicableShops.length > 0),
        updatedAt: config.updatedAt,
        description: config.description
    };
};

/**
 * GET /api/admin/commission/sellers
 * Danh sách seller và tỷ lệ hoa hồng hiện tại
 */
const listSellerCommissions = async (req, res) => {
    try {
        const {
            search = '',
            page = 1,
            limit = 10,
            includeInactive = 'false'
        } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.min(parseInt(limit, 10) || 10, 50);
        const includeInactiveBool = includeInactive === 'true';

        const matchStage = {};
        if (!includeInactiveBool) {
            matchStage.isActive = true;
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sellerId',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: '$seller' }
        ];

        if (search) {
            const regex = new RegExp(search, 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { shopName: regex },
                        { 'seller.fullName': regex },
                        { 'seller.email': regex }
                    ]
                }
            });
        }

        pipeline.push(
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    items: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize }
                    ],
                    total: [{ $count: 'count' }]
                }
            }
        );

        const aggregateResult = await Shop.aggregate(pipeline);
        const items = aggregateResult[0]?.items || [];
        const total = aggregateResult[0]?.total[0]?.count || 0;

        if (items.length === 0) {
            return res.json({
                success: true,
                data: {
                    pagination: {
                        page: pageNumber,
                        limit: pageSize,
                        total,
                        totalPages: Math.ceil(total / pageSize) || 1
                    },
                    summary: {
                        averageRate: 0,
                        customCommissionCount: 0,
                        defaultRate: null
                    },
                    items: []
                }
            });
        }

        const shopIds = items.map(item => item._id);

        const [configs, globalConfig, historyDocs] = await Promise.all([
            Promise.all(shopIds.map(shopId =>
                PlatformFeeConfig.getApplicableConfig({ shopId })
            )),
            PlatformFeeConfig.getApplicableConfig({}),
            CommissionChange.find({ shopId: { $in: shopIds } })
                .sort({ createdAt: -1 })
                .populate('changedBy', 'fullName email')
                .lean()
        ]);

        const latestChangeByShop = new Map();
        for (const change of historyDocs) {
            const key = change.shopId.toString();
            if (!latestChangeByShop.has(key)) {
                latestChangeByShop.set(key, change);
            }
        }

        let totalRate = 0;
        let rateCount = 0;
        let customCommissionCount = 0;

        const normalizedItems = items.map((item, index) => {
            const config = configs[index];
            const normalizedConfig = normalizeConfig(config);

            if (normalizedConfig && normalizedConfig.feeType === 'PERCENTAGE' && normalizedConfig.currentRate !== null) {
                totalRate += normalizedConfig.currentRate;
                rateCount += 1;
            }

            if (normalizedConfig?.isCustom) {
                customCommissionCount += 1;
            }

            const latestChange = latestChangeByShop.get(item._id.toString());

            return {
                shopId: item._id,
                shopName: item.shopName,
                shopAvatar: item.avatarUrl,
                seller: {
                    id: item.seller._id,
                    name: item.seller.fullName,
                    email: item.seller.email
                },
                currentCommission: normalizedConfig,
                latestChange: latestChange
                    ? {
                        id: latestChange._id,
                        previousRate: latestChange.previousRate,
                        newRate: latestChange.newRate,
                        reason: latestChange.reason,
                        note: latestChange.note,
                        changedBy: latestChange.changedBy,
                        changedAt: latestChange.createdAt
                    }
                    : null,
                updatedAt: normalizedConfig?.updatedAt || item.updatedAt,
                isActive: item.isActive
            };
        });

        const averageRate = rateCount > 0
            ? parseFloat((totalRate / rateCount).toFixed(2))
            : 0;

        const normalizedGlobalConfig = normalizeConfig(globalConfig);

        res.json({
            success: true,
            data: {
                pagination: {
                    page: pageNumber,
                    limit: pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize) || 1
                },
                summary: {
                    averageRate,
                    customCommissionCount,
                    defaultRate: normalizedGlobalConfig?.currentRate || null,
                    defaultFormattedRate: normalizedGlobalConfig?.formattedRate || null
                },
                items: normalizedItems
            }
        });
    } catch (error) {
        console.error('Error listing seller commissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller commissions',
            error: error.message
        });
    }
};

/**
 * PUT /api/admin/commission/sellers/:shopId
 * Thay đổi tỷ lệ hoa hồng cho seller
 */
const updateSellerCommission = async (req, res) => {
    try {
        const { shopId } = req.params;
        const {
            percentageRate,
            reason = '',
            note = ''
        } = req.body;

        if (percentageRate === undefined || percentageRate === null) {
            return res.status(400).json({
                success: false,
                message: 'percentageRate is required'
            });
        }

        const normalizedRate = parseFloat(percentageRate);
        if (Number.isNaN(normalizedRate) || normalizedRate < 0 || normalizedRate > 100) {
            return res.status(400).json({
                success: false,
                message: 'Commission rate must be between 0 and 100'
            });
        }

        const shop = await Shop.findById(shopId).populate('sellerId', 'fullName email');
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const currentConfig = await PlatformFeeConfig.getApplicableConfig({ shopId: shop._id });
        const previousRate = currentConfig?.feeType === 'PERCENTAGE'
            ? currentConfig.percentageRate
            : null;

        let updatedConfig = null;

        const hasCustomConfig = currentConfig && currentConfig.applicableShops &&
            currentConfig.applicableShops.some(id => id.toString() === shop._id.toString());

        if (hasCustomConfig) {
            currentConfig.percentageRate = normalizedRate;
            currentConfig.feeType = 'PERCENTAGE';
            currentConfig.description = reason || currentConfig.description;
            currentConfig.updatedBy = userId;
            currentConfig.effectiveFrom = currentConfig.effectiveFrom || new Date();
            await currentConfig.save();
            updatedConfig = currentConfig;
        } else {
            const configName = `Hoa hồng cho ${shop.shopName}`;
            updatedConfig = new PlatformFeeConfig({
                name: configName,
                description: reason || `Tùy chỉnh hoa hồng cho ${shop.shopName}`,
                feeType: 'PERCENTAGE',
                percentageRate: normalizedRate,
                applicableShops: [shop._id],
                isActive: true,
                priority: 100,
                effectiveFrom: new Date(),
                createdBy: userId,
                updatedBy: userId
            });
            await updatedConfig.save();
        }

        await CommissionChange.create({
            shopId: shop._id,
            sellerId: shop.sellerId?._id || shop.sellerId,
            configId: updatedConfig._id,
            changedBy: userId,
            previousRate,
            newRate: normalizedRate,
            feeType: 'PERCENTAGE',
            reason,
            note,
            appliedAt: new Date()
        });

        const normalizedConfig = normalizeConfig(updatedConfig);

        res.json({
            success: true,
            message: 'Commission rate updated successfully',
            data: {
                shop: {
                    id: shop._id,
                    name: shop.shopName,
                    seller: shop.sellerId ? {
                        id: shop.sellerId._id,
                        name: shop.sellerId.fullName,
                        email: shop.sellerId.email
                    } : null
                },
                commission: normalizedConfig
            }
        });
    } catch (error) {
        console.error('Error updating seller commission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update seller commission',
            error: error.message
        });
    }
};

/**
 * GET /api/admin/commission/sellers/:shopId/history
 * Lịch sử thay đổi hoa hồng của 1 seller
 */
const getSellerCommissionHistory = async (req, res) => {
    try {
        const { shopId } = req.params;

        const shop = await Shop.findById(shopId)
            .populate('sellerId', 'fullName email avatarUrl')
            .lean();

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const history = await CommissionChange.find({ shopId })
            .sort({ createdAt: -1 })
            .populate('changedBy', 'fullName email avatarUrl')
            .lean();

        res.json({
            success: true,
            data: {
                shop: {
                    id: shop._id,
                    name: shop.shopName,
                    avatar: shop.avatarUrl,
                    seller: shop.sellerId ? {
                        id: shop.sellerId._id,
                        name: shop.sellerId.fullName,
                        email: shop.sellerId.email,
                        avatar: shop.sellerId.avatarUrl
                    } : null
                },
                history: history.map(entry => ({
                    id: entry._id,
                    previousRate: entry.previousRate,
                    newRate: entry.newRate,
                    feeType: entry.feeType,
                    reason: entry.reason,
                    note: entry.note,
                    appliedAt: entry.appliedAt,
                    createdAt: entry.createdAt,
                    changedBy: entry.changedBy ? {
                        id: entry.changedBy._id,
                        name: entry.changedBy.fullName,
                        email: entry.changedBy.email,
                        avatar: entry.changedBy.avatarUrl
                    } : null
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching commission history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch commission history',
            error: error.message
        });
    }
};

module.exports = {
    listSellerCommissions,
    updateSellerCommission,
    getSellerCommissionHistory,
    updateGlobalCommission
};



