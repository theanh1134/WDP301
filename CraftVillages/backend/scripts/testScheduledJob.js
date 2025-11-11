/**
 * Test Scheduled Job
 * Tests the seller payment scheduled job
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { runNow } = require('../jobs/sellerPaymentJob');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const main = async () => {
    try {
        await connectDB();
        
        console.log('🧪 Testing Seller Payment Scheduled Job\n');
        console.log('='.repeat(80));
        
        await runNow();
        
        console.log('='.repeat(80));
        console.log('\n✅ Test completed!\n');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

main();

