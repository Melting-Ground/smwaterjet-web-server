const express = require('express');
const AdminController = require('@controllers/admin-controller');
const rateLimit = require('express-rate-limit');
const { getRateLimitConfig } = require('@configs/env');

const router = express.Router();

const rateLimitConfig = getRateLimitConfig();
const loginLimiter = rateLimit({
  windowMs: rateLimitConfig.loginWindowMs,
  max: rateLimitConfig.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, AdminController.loginAdmin);

module.exports = router;
