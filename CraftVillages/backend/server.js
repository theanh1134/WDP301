const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const shopRoutes = require('./routes/shopRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const setupChatSocket = require('./socket/chatSocket');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

//Make io accessible globally for shipment updates
global.io = io;

// Initialize auto payment checker after DB connection
const { initializeAutoPaymentChecker } = require('./jobs/autoPaymentChecker');
connectDB().then(() => {
    console.log('✅ Database connected successfully');
    // Start auto payment checker (runs every hour)
    initializeAutoPaymentChecker();
}).catch(err => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
});

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.get('/', async (req, res) => {
    try {
        res.send({ message: 'Welcome to Craft Villages API!' });
    } catch (error) {
        res.send({ error: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', emailRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/conversations', conversationRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const withdrawalRoutes = require('./routes/withdrawalRoutes');
app.use('/api/withdrawals', withdrawalRoutes);

const platformFeeRoutes = require('./routes/platformFeeRoutes');
app.use('/api/platform-fees', platformFeeRoutes);

const sellerTransactionRoutes = require('./routes/sellerTransactionRoutes');
app.use('/api/seller-transactions', sellerTransactionRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const indexRoutes = require('./routes/index.js');

app.use("/", indexRoutes);

app.use(errorHandler);

// Setup Socket.IO for real-time chat
setupChatSocket(io);

const PORT = process.env.PORT || 9999;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💬 Socket.IO ready for real-time chat`);
});