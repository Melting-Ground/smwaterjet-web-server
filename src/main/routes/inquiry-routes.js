const express = require('express');
const InquiryController = require('@controllers/inquiry-controller');
const creatMulter = require("@configs/multer-config");
const authHandler = require('@middlewares/authentication-handler');

const upload = creatMulter('inquiries');
const router = express.Router();

router.get('/', InquiryController.getAllInquiries);
router.get('/search', InquiryController.searchInquiries);
router.get('/:inquiryId', authHandler, InquiryController.getInquiryById);

router.post('/', upload.array('files', 5), InquiryController.createInquiry);

router.put('/:inquiryId', authHandler, upload.array('newFiles', 5), InquiryController.editInquiry);

router.delete('/files/:inquiryFileId', authHandler, InquiryController.deleteFile);
router.delete('/:inquiryId', authHandler, InquiryController.deleteInquiry);

module.exports = router;