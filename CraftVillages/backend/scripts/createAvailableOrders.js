const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WDP')
.then(async () => {
    console.log('✅ Connected to WDP database\n');
    
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    const shipmentsCollection = db.collection('shipments');
    
    // Find confirmed orders without shipments
    const confirmedOrders = await ordersCollection.find({
        orderStatus: 'CONFIRMED'
    }).limit(5).toArray();
    
    console.log(`Found ${confirmedOrders.length} confirmed orders\n`);
    
    if (confirmedOrders.length === 0) {
        console.log('⚠️  No confirmed orders found. Creating sample orders...\n');
        
        // Create sample orders
        const sampleOrders = [];
        for (let i = 0; i < 3; i++) {
            const timestamp = Date.now() + i;
            sampleOrders.push({
                orderNumber: `ORD${timestamp}`,
                orderStatus: 'CONFIRMED',
                buyerInfo: {
                    fullName: `Khách hàng ${i + 1}`,
                    phoneNumber: `098765432${i}`
                },
                shippingAddress: {
                    recipientName: `Người nhận ${i + 1}`,
                    phoneNumber: `098765432${i}`,
                    fullAddress: `Địa chỉ giao hàng số ${i + 1}, Quận 1, TP.HCM`
                },
                items: [
                    {
                        productName: `Sản phẩm ${i + 1}`,
                        quantity: 2,
                        price: 100000 + (i * 50000)
                    }
                ],
                subtotal: 200000 + (i * 100000),
                finalAmount: 200000 + (i * 100000),
                paymentInfo: {
                    transactionId: `TXN${timestamp}${i}`, // Unique transaction ID
                    paymentMethod: 'COD'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        const insertResult = await ordersCollection.insertMany(sampleOrders);
        console.log(`✅ Created ${insertResult.insertedCount} sample orders\n`);
        
        // Refresh confirmed orders
        const newConfirmedOrders = await ordersCollection.find({
            _id: { $in: Object.values(insertResult.insertedIds) }
        }).toArray();
        
        confirmedOrders.push(...newConfirmedOrders);
    }
    
    // Create shipments for these orders (without shipper)
    console.log('📦 Creating available shipments...\n');
    
    const shipments = [];
    for (const order of confirmedOrders) {
        // Check if shipment already exists
        const existingShipment = await shipmentsCollection.findOne({ orderId: order._id });
        if (existingShipment) {
            console.log(`⏭️  Shipment already exists for order ${order.orderNumber}`);
            continue;
        }
        
        shipments.push({
            orderId: order._id,
            shipperId: null, // No shipper assigned
            status: 'PENDING',
            pickupLocation: {
                address: 'Cửa hàng ABC, Quận 3, TP.HCM',
                latitude: 10.7769,
                longitude: 106.7009
            },
            deliveryLocation: {
                address: order.shippingAddress.fullAddress,
                latitude: 10.7769 + (Math.random() * 0.1),
                longitude: 106.7009 + (Math.random() * 0.1)
            },
            estimatedDistance: Math.round(5 + Math.random() * 15), // 5-20 km
            estimatedDuration: Math.round(20 + Math.random() * 40), // 20-60 mins
            trackingHistory: [
                {
                    status: 'PENDING',
                    notes: 'Đơn hàng đã được xác nhận, chờ shipper nhận',
                    timestamp: new Date()
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    
    if (shipments.length > 0) {
        await shipmentsCollection.insertMany(shipments);
        console.log(`✅ Created ${shipments.length} available shipments\n`);
        
        // Show summary
        shipments.forEach((shipment, index) => {
            console.log(`${index + 1}. Shipment ID: ${shipment._id}`);
            console.log(`   Order ID: ${shipment.orderId}`);
            console.log(`   Distance: ${shipment.estimatedDistance} km`);
            console.log(`   Status: ${shipment.status}`);
            console.log('');
        });
    } else {
        console.log('ℹ️  No new shipments created (all orders already have shipments)\n');
    }
    
    // Show total available shipments
    const totalAvailable = await shipmentsCollection.countDocuments({
        $or: [
            { shipperId: null },
            { shipperId: { $exists: false } }
        ],
        status: { $in: ['PENDING', 'READY_FOR_PICKUP'] }
    });
    
    console.log(`📊 Total available shipments: ${totalAvailable}\n`);
    console.log('✨ Done! Reload Dashboard Shipper to see available orders.');
    
    await mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
