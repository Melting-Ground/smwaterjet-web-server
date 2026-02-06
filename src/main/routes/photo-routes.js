const express = require('express');
const PhotoController = require('@controllers/photo-controller');
const authenticate = require('@middlewares/jwt-authentication');
const creatMulter = require("@configs/multer-config");
const rateLimit = require('express-rate-limit');
const { getRateLimitConfig } = require('@configs/env');

const upload = creatMulter('photos');

const router = express.Router();
const rateLimitConfig = getRateLimitConfig();
const uploadLimiter = rateLimit({
  windowMs: rateLimitConfig.uploadWindowMs,
  max: rateLimitConfig.uploadMax,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', PhotoController.getAllPhotos);
router.get('/:photoId', PhotoController.getPhotoById);

router.post('/', authenticate, uploadLimiter, upload.array('files', 5), PhotoController.createPhoto);

router.put('/:photoId', authenticate, uploadLimiter, upload.array('files', 5), PhotoController.editPhoto);

router.delete('/file/:photoFileId', authenticate, PhotoController.deleteFile);
router.delete('/:photoId', authenticate, PhotoController.deletePhoto);


module.exports = router;
