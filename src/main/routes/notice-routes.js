const express = require('express');
const creatMulter = require("@configs/multer-config");
const authenticate = require('@middlewares/jwt-authentication');
const NoticeController = require('@controllers/notice-controller');

const upload = creatMulter('notices');

const router = express.Router();

router.get('/', NoticeController.getAllNotices);
router.get('/search', NoticeController.searchNotices);
router.get('/:noticeId', NoticeController.getNoticeById);

router.post('/', authenticate, upload.array('files', 5), NoticeController.createNotice);

router.put('/:noticeId', authenticate, upload.array('newFiles', 5), NoticeController.editNotice);

router.delete('/file/:noticeFileId', authenticate, NoticeController.deleteFile);
router.delete('/:noticeId', authenticate, NoticeController.deleteNotice);

module.exports = router;