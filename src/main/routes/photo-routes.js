const express = require('express');
const PhotoController = require('@controllers/photo-controller');
const authenticate = require('@middlewares/jwt-authentication');
const creatMulter = require("@configs/multer-config");

const upload = creatMulter('photos');

const router = express.Router();

router.get('/', PhotoController.getAllPhotos);
router.get('/:photoId', PhotoController.getPhotoById);

router.post('/', authenticate, upload.array('files', 5), PhotoController.createPhoto);

router.put('/:photoId', authenticate, upload.array('newFiles', 5), PhotoController.editPhoto);

router.delete('/file/:photoFileId', authenticate, PhotoController.deleteFile);
router.delete('/:photoId', authenticate, PhotoController.deletePhoto);


module.exports = router;