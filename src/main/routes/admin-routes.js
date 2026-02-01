const express = require('express');
const AdminController = require('@controllers/admin-controller');

const router = express.Router();

router.post('/login', AdminController.loginAdmin);

module.exports = router;