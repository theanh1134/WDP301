/**
 * Job Routes
 * API endpoints to manually trigger scheduled jobs
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { runNow } = require('../jobs/sellerPaymentJob');

/**
 * POST /api/jobs/seller-payment/run
 * Manually trigger seller payment job
 * Admin only
 */
router.post('/seller-payment/run', auth, async (req, res) => {
    try {
        // Check if user is admin (you can add admin check here)
        // For now, any authenticated user can trigger
        
        console.log(`🔧 Manual trigger by user: ${req.user._id}`);
        
        await runNow();
        
        res.json({
            success: true,
            message: 'Seller payment job executed successfully'
        });
    } catch (error) {
        console.error('Error running seller payment job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to run seller payment job',
            error: error.message
        });
    }
});

module.exports = router;

