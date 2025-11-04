require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shipper = require('../models/Shipper');

const migrateShipperData = async () => {
    try {
        // Kết nối database
        const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WDP';
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB:', dbUri);

        // Tìm user shipper - thử cả email và shipperCode
        const shipperUser = await User.findOne({ 
            $or: [
                { shipperCode: 'SHIP001' },
                { email: 'phucnthe170081@gmail.com' }
            ]
        });
        
        if (!shipperUser) {
            console.log('Shipper user not found!');
            return;
        }

        console.log('Found shipper user:', shipperUser.email);
        console.log('Shipper info:', shipperUser.shipperInfo);

        // Kiểm tra xem đã có shipper document chưa
        let shipper = await Shipper.findOne({ userId: shipperUser._id });

        if (shipper) {
            console.log('Shipper document already exists, updating...');
        } else {
            console.log('Creating new shipper document...');
        }

        // Lấy thông tin từ shipperInfo trong User
        const shipperInfo = shipperUser.shipperInfo || {};
        
        // Chuẩn bị dữ liệu shipper
        const shipperData = {
            userId: shipperUser._id,
            licenseNumber: shipperInfo.idCardNumber || 'SHP' + Date.now(),
            vehicleType: shipperInfo.vehicleType === 'Xe máy' ? 'MOTORBIKE' : 'CAR',
            vehicleNumber: shipperInfo.vehicleNumber || '30A-12345',
            maxWeight: 50,
            maxVolume: 100,
            serviceAreas: shipperUser.supportedZones || ['Hà Nội', 'Thạch Thất'],
            workingHours: shipperInfo.workingHours || {
                start: '08:00',
                end: '22:00'
            },
            isOnline: shipperInfo.isAvailable || true,
            currentLocation: {
                latitude: shipperInfo.currentLocation?.latitude || 21.0285,
                longitude: shipperInfo.currentLocation?.longitude || 105.8542,
                updatedAt: new Date()
            },
            rating: {
                average: shipperInfo.rating || 4.5,
                totalReviews: shipperInfo.totalDeliveries || 0
            },
            totalDeliveries: shipperInfo.totalDeliveries || 50,
            totalEarnings: 0,
            status: shipperInfo.status === 'active' ? 'APPROVED' : 'PENDING',
            bankInfo: {
                accountName: shipperUser.fullName,
                accountNumber: shipperInfo.bankAccountNumber || '',
                bankName: shipperInfo.bankName || '',
                accountType: 'PERSONAL'
            },
            documents: {
                licenseImage: shipperInfo.idCardFrontUrl || '',
                vehicleRegistration: shipperInfo.idCardBackUrl || '',
                insuranceDocument: ''
            }
        };

        if (shipper) {
            // Cập nhật shipper hiện có
            Object.assign(shipper, shipperData);
            await shipper.save();
            console.log('Updated shipper document');
        } else {
            // Tạo shipper mới
            shipper = new Shipper(shipperData);
            await shipper.save();
            console.log('Created new shipper document');
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('Shipper ID:', shipper._id);
        console.log('User ID:', shipperUser._id);
        console.log('\nShipper details:', {
            vehicleType: shipper.vehicleType,
            vehicleNumber: shipper.vehicleNumber,
            serviceAreas: shipper.serviceAreas,
            status: shipper.status,
            isOnline: shipper.isOnline
        });

    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

// Chạy migration
migrateShipperData();
