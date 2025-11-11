const express = require('express');
const router = express.Router();
const sellerTransactionController = require('../controllers/sellerTransactionController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Current seller's own transactions (must be before /:transactionId)
router.get('/my-transactions', sellerTransactionController.getMyTransactions);
router.get('/my-summary', sellerTransactionController.getMySummary);

// Get all transactions (admin only - add admin middleware if needed)
router.get('/', sellerTransactionController.getAllTransactions);

// Get seller's transactions
router.get('/seller/:sellerId', sellerTransactionController.getSellerTransactions);

// Get seller's transaction summary
router.get('/seller/:sellerId/summary', sellerTransactionController.getSellerTransactionSummary);

// Get single transaction
router.get('/:transactionId', sellerTransactionController.getTransaction);

// Manual process order payment (admin only - add admin middleware if needed)
router.post('/process-payment', sellerTransactionController.manualProcessOrderPayment);

module.exports = router;

