const PhotoDto = require("@dtos/photo-dto/photo-dto");
const PhotoFileDto = require("@dtos/photo-dto/photo-file-dto");
const PhotoService = require("@services/photo-service");
const Pagination = require('@utils/pagination');

class PhotoController {
    static async getAllPhotos(req, res, next) {
        try {
            const pagination = new Pagination(req.query.page, req.query.limit);
            const photoResDtos = await PhotoService.getAllPhotos(pagination);
            res.status(200).json(photoResDtos);
        } catch (error) {
            next(error);
        }
    }

    static async getPhotoById(req, res, next) {
        try {
            const { photoId } = req.params;
            const photoResDto = await PhotoService.getPhotoById(photoId);
            res.status(200).json(photoResDto);
        } catch (error) {
            next(error);
        }
    }

    static async createPhoto(req, res, next) {
        try {
            const photoDto = new PhotoDto(req.body);
            const photoFileDto = new PhotoFileDto(req.files);
            const photoResDto = await PhotoService.createPhoto(photoDto, photoFileDto);

            res.status(201).json(photoResDto);
        } catch (error) {
            next(error);
        }
    }

    static async editPhoto(req, res, next) {
        try {
            const { photoId } = req.params;
            const photoDto = new PhotoDto(req.body);
            const photoFileDto = new PhotoFileDto(req.files);

            const photoResDto = await PhotoService.editPhoto(photoId, photoDto, photoFileDto);

            res.status(200).json(photoResDto);
        } catch (error) {
            next(error);
        }
    }

    static async deletePhoto(req, res, next) {
        try {
            const { photoId } = req.params;
            await PhotoService.deletePhoto(photoId);

            res.status(200).json({ message: 'Photo deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async deleteFile(req, res, next) {
        try {
            const { photoFileId } = req.params;
            await PhotoService.deleteFile(photoFileId);

            res.status(200).json({ message: 'PhotoFile deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PhotoController;
