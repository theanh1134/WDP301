const express = require('express');
const router = express.Router();
const { getUserById, updateUser, getUserBalance } = require('../controllers/userController');

router.get('/:id', getUserById);
router.get('/:id/balance', getUserBalance);
router.put('/:id', updateUser);

module.exports = router;


