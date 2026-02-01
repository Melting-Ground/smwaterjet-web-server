const express = require('express');
const TurnstileController = require('@controllers/turnstile-controller');

const router = express.Router();

router.post('/', TurnstileController.handlePost);

module.exports = router;