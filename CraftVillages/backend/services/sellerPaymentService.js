const Order = require('../models/Order');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Return = require('../models/Return');
const PlatformFeeConfig = require('../models/PlatformFeeConfig');
const SellerTransaction = require('../models/SellerTransaction');

/**
 * Seller Payment Service
 * Xử lý tự động chuyển tiền cho seller sau khi đơn hàng hoàn tất
 */

class SellerPaymentService {
    /**
     * Process seller payment for a delivered order
     * @param {String} orderId - Order ID
     * @returns {Object} Payment result
     */
    static async processOrderPayment(orderId) {
        try {
            console.log(`\n💰 Processing seller payment for order: ${orderId}`);

            // 1. Get order details
            const order = await Order.findById(orderId).populate('items.productId');
            if (!order) {
                throw new Error('Order not found');
            }

            console.log(`📦 Order status: ${order.status}`);

            // 2. Validate order status
            if (order.status !== 'DELIVERED') {
                throw new Error(`Order must be DELIVERED to process payment. Current status: ${order.status}`);
            }

            // 3. Check if already paid
            if (order.sellerPayment && order.sellerPayment.isPaid) {
                console.log(`⚠️  Seller already paid for this order at ${order.sellerPayment.paidAt}`);
                return {
                    success: false,
                    message: 'Seller already paid for this order',
                    alreadyPaid: true
                };
            }

            // 4. Check for refund/return requests
            const refundCheck = await this.checkRefundRequest(orderId);
            if (refundCheck.hasRefund) {
                console.log(`❌ Order has refund/return request. Payment blocked.`);

                // Update order to mark refund request
                order.hasRefundRequest = true;
                order.refundRequestId = refundCheck.refundRequest._id;
                await order.save();

                return {
                    success: false,
                    message: 'Order has refund/return request. Payment blocked.',
                    hasRefund: true,
                    refundId: refundCheck.refundRequest._id
                };
            }

            // 5. Get seller information
            const sellerId = await this.getSellerIdFromOrder(order);
            if (!sellerId) {
                throw new Error('Cannot determine seller for this order');
            }

            const seller = await User.findById(sellerId);
            if (!seller) {
                throw new Error('Seller not found');
            }

            console.log(`👤 Seller: ${seller.fullName} (${seller.email})`);

            // 6. Get shop information (if available)
            const shopId = await this.getShopIdFromOrder(order);
            let shop = null;
            if (shopId) {
                shop = await Shop.findById(shopId);
            }

            // 7. Calculate platform fee
            const grossAmount = order.finalAmount;
            const feeCalculation = await this.calculatePlatformFee(order, shopId);
            
            console.log(`💵 Amount calculation:`, {
                grossAmount: `${grossAmount.toLocaleString()} VND`,
                platformFee: `${feeCalculation.feeAmount.toLocaleString()} VND (${feeCalculation.feeRate}%)`,
                netAmount: `${feeCalculation.netAmount.toLocaleString()} VND`
            });

            // 8. Update seller balance
            const currentBalance = seller.getBalance();
            await seller.addBalance(feeCalculation.netAmount, `Nhận tiền từ đơn hàng #${order._id}`);
            
            console.log(`💰 Seller balance updated:`, {
                before: `${currentBalance.toLocaleString()} VND`,
                added: `${feeCalculation.netAmount.toLocaleString()} VND`,
                after: `${seller.getBalance().toLocaleString()} VND`
            });

            // 9. Create seller transaction record
            const transaction = await SellerTransaction.createOrderPayment({
                sellerId: seller._id,
                shopId: shopId,
                orderId: order._id,
                grossAmount: grossAmount,
                platformFee: feeCalculation.feeAmount,
                platformFeeRate: feeCalculation.feeRate,
                platformFeeConfig: feeCalculation,
                currentBalance: currentBalance
            });

            console.log(`📝 Transaction created: ${transaction.transactionCode}`);

            // 10. Update order with payment info
            order.sellerPayment = {
                isPaid: true,
                paidAt: new Date(),
                transactionId: transaction._id,
                platformFee: feeCalculation.feeAmount,
                platformFeeRate: feeCalculation.feeRate,
                netAmount: feeCalculation.netAmount
            };
            await order.save();

            console.log(`✅ Seller payment processed successfully!`);

            return {
                success: true,
                message: 'Seller payment processed successfully',
                data: {
                    orderId: order._id,
                    sellerId: seller._id,
                    transactionId: transaction._id,
                    transactionCode: transaction.transactionCode,
                    grossAmount: grossAmount,
                    platformFee: feeCalculation.feeAmount,
                    platformFeeRate: feeCalculation.feeRate,
                    netAmount: feeCalculation.netAmount,
                    sellerBalanceBefore: currentBalance,
                    sellerBalanceAfter: seller.getBalance()
                }
            };

        } catch (error) {
            console.error(`❌ Error processing seller payment:`, error);
            throw error;
        }
    }

    /**
     * Check if order has refund/return request
     * @returns {Object} { hasRefund: boolean, refundRequest: Object|null }
     */
    static async checkRefundRequest(orderId) {
        const refundRequest = await Return.findOne({
            orderId: orderId,
            status: { $in: ['REQUESTED', 'APPROVED', 'SHIPPED', 'RETURNED', 'REFUNDED', 'COMPLETED'] }
        });
        return {
            hasRefund: refundRequest !== null,
            refundRequest: refundRequest
        };
    }

    /**
     * Get seller ID from order
     */
    static async getSellerIdFromOrder(order) {
        // Get first product to determine seller
        if (!order.items || order.items.length === 0) {
            return null;
        }

        const firstProduct = order.items[0].productId;
        if (!firstProduct) {
            return null;
        }

        // Get product (either already populated or fetch it)
        let product = firstProduct;
        if (!firstProduct.shopId) {
            // Not populated, fetch it
            product = await Product.findById(firstProduct._id || firstProduct);
            if (!product) {
                return null;
            }
        }

        // Get shop to find seller
        const Shop = require('../models/Shop');
        const shopId = product.shopId._id || product.shopId;
        const shop = await Shop.findById(shopId);

        return shop ? shop.sellerId : null;
    }

    /**
     * Get shop ID from order
     */
    static async getShopIdFromOrder(order) {
        if (!order.items || order.items.length === 0) {
            return null;
        }

        const firstProduct = order.items[0].productId;
        if (!firstProduct) {
            return null;
        }

        // If product is populated
        if (firstProduct.shopId) {
            return firstProduct.shopId;
        }

        // If not populated, fetch product
        const product = await Product.findById(firstProduct._id || firstProduct);
        return product ? product.shopId : null;
    }

    /**
     * Calculate platform fee for order
     */
    static async calculatePlatformFee(order, shopId = null) {
        // Get category IDs from order items
        const categoryIds = [];
        for (const item of order.items) {
            const product = item.productId;
            if (product && product.categoryId) {
                categoryIds.push(product.categoryId);
            }
        }

        // Get applicable fee configuration
        const feeConfig = await PlatformFeeConfig.getApplicableConfig({
            shopId: shopId,
            categoryIds: categoryIds,
            orderAmount: order.finalAmount
        });

        if (!feeConfig) {
            console.log('⚠️  No platform fee config found, using default 5%');
            // Default fallback: 5%
            const feeAmount = Math.round(order.finalAmount * 0.05);
            return {
                feeAmount: feeAmount,
                netAmount: order.finalAmount - feeAmount,
                feeRate: 5,
                feeType: 'PERCENTAGE',
                configId: null,
                configName: 'Default (5%)'
            };
        }

        console.log(`📋 Using fee config: ${feeConfig.name} (${feeConfig.formattedRate})`);
        return feeConfig.calculateFee(order.finalAmount);
    }

    /**
     * Process refund deduction from seller balance
     * Called when a refund is approved
     */
    static async processRefundDeduction(returnRequest) {
        try {
            console.log(`\n💸 Processing refund deduction for return: ${returnRequest.rmaCode}`);

            const order = await Order.findById(returnRequest.orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Check if seller was already paid
            if (!order.sellerPayment || !order.sellerPayment.isPaid) {
                console.log(`ℹ️  Seller was not paid yet, no deduction needed`);
                return {
                    success: true,
                    message: 'Seller was not paid yet, no deduction needed',
                    deductionNeeded: false
                };
            }

            // Get seller
            const sellerId = await this.getSellerIdFromOrder(order);
            const seller = await User.findById(sellerId);
            if (!seller) {
                throw new Error('Seller not found');
            }

            // Get refund amount
            const refundAmount = returnRequest.amounts.refundTotal;
            
            console.log(`💵 Refund amount: ${refundAmount.toLocaleString()} VND`);

            // Check seller balance
            const currentBalance = seller.getBalance();
            if (currentBalance < refundAmount) {
                console.warn(`⚠️  Seller balance insufficient for refund deduction!`, {
                    required: refundAmount,
                    available: currentBalance,
                    shortage: refundAmount - currentBalance
                });
                // Still proceed but log the issue
            }

            // Deduct from seller balance
            await seller.subtractBalance(refundAmount, `Trừ tiền do hoàn hàng ${returnRequest.rmaCode}`);

            // Create transaction record
            const shopId = await this.getShopIdFromOrder(order);
            const transaction = await SellerTransaction.createRefundDeduction({
                sellerId: seller._id,
                shopId: shopId,
                orderId: order._id,
                returnId: returnRequest._id,
                refundAmount: refundAmount,
                currentBalance: currentBalance
            });

            console.log(`✅ Refund deduction processed: ${transaction.transactionCode}`);

            return {
                success: true,
                message: 'Refund deduction processed successfully',
                data: {
                    transactionId: transaction._id,
                    transactionCode: transaction.transactionCode,
                    refundAmount: refundAmount,
                    sellerBalanceBefore: currentBalance,
                    sellerBalanceAfter: seller.getBalance()
                }
            };

        } catch (error) {
            console.error(`❌ Error processing refund deduction:`, error);
            throw error;
        }
    }
}

module.exports = SellerPaymentService;

