const express = require('express');
const router = express.Router();
const { 
    getAllCategories, 
    getCategoryById, 
    createCategory 
} = require('../controllers/categoryController');
const { auth } = require('../middleware/auth');

// Category routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', auth, createCategory);

module.exports = router;

