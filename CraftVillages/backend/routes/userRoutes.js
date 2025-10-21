const express = require('express');
const router = express.Router();
const { getUserById, updateUser } = require('../controllers/userController');

router.get('/:id', getUserById);
router.put('/:id', updateUser);

module.exports = router;


