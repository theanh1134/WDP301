const express = require('express');
const router = express.Router();
const { 
    createShop, 
    getShopByUserId, 
    updateShop, 
    getShopById,
    getAllShops 
} = require('../controllers/shopController');
const { auth } = require('../middleware/auth');

// Shop routes
router.post('/register', auth, createShop);
router.get('/user/:userId', getShopByUserId);
router.get('/:shopId', getShopById);
router.get('/', getAllShops);
router.put('/:shopId', auth, updateShop);

module.exports = router;

