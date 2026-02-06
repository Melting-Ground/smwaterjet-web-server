const express = require('express');
const InquiryController = require('@controllers/inquiry-controller');
const creatMulter = require("@configs/multer-config");
const authHandler = require('@middlewares/authentication-handler');
const rateLimit = require('express-rate-limit');
const { getRateLimitConfig } = require('@configs/env');

const upload = creatMulter('inquiries');
const router = express.Router();
const rateLimitConfig = getRateLimitConfig();
const uploadLimiter = rateLimit({
  windowMs: rateLimitConfig.uploadWindowMs,
  max: rateLimitConfig.uploadMax,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', InquiryController.getAllInquiries);
router.get('/search', InquiryController.searchInquiries);
router.get('/:inquiryId', authHandler, InquiryController.getInquiryById);

router.post('/', uploadLimiter, upload.array('files', 5), InquiryController.createInquiry);

router.put('/:inquiryId', authHandler, uploadLimiter, upload.array('files', 5), InquiryController.editInquiry);

router.delete('/files/:inquiryFileId', authHandler, InquiryController.deleteFile);
router.delete('/:inquiryId', authHandler, InquiryController.deleteInquiry);

module.exports = router;
