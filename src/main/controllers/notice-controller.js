const NoticeDto = require("@dtos/notice-dto/notice-dto");
const NoticeFileDto = require("@dtos/notice-dto/notice-file-dto");
const NoticeService = require('@services/notice-service');
const Pagination = require('@utils/pagination');
const SearchParameters = require('@utils/search-parameters');

class NoticeController {
    static async getAllNotices(req, res, next) {
        try {
            const pagination = new Pagination(req.query.page, req.query.limit);
            const noticeResDtos = await NoticeService.getAllNotices(pagination);
            res.status(200).json(noticeResDtos);
        } catch (error) {
            next(error);
        }
    }
    static async getNoticeById(req, res, next) {
        try {
            const { noticeId } = req.params;

            const noticeResDto = await NoticeService.getNoticeById(noticeId);
            res.status(200).json(noticeResDto);
        } catch (error) {
            next(error);
        }
    }

    static async searchNotices(req, res, next) {
        try {
            const pagination = new Pagination(req.query.page, req.query.limit);
            const searchParams = new SearchParameters(req.query.query, req.query.searchBy);

            const noticeResDtos = await NoticeService.searchNotices(pagination, searchParams);
            res.status(200).json(noticeResDtos);
        } catch (error) {
            next(error);
        }
    }

    static async createNotice(req, res, next) {
        try {
            const noticeDto = new NoticeDto(req.body);
            const noticeFileDto = new NoticeFileDto(req.files);
            const noticeResDto = await NoticeService.createNotice(noticeDto, noticeFileDto);

            res.status(201).json(noticeResDto);
        } catch (error) {
            next(error);
        }
    }

    static async editNotice(req, res, next) {
        try {
            const { noticeId } = req.params;
            const noticeDto = new NoticeDto(req.body);
            const noticeFileDto = new NoticeFileDto(req.files);

            const noticeResDto = await NoticeService.editNotice(noticeId, noticeDto, noticeFileDto);

            res.status(200).json(noticeResDto);
        } catch(error) {
            next(error);
        }
    }
    
    static async deleteNotice(req, res, next) {
        try {
            const { noticeId } = req.params;
            await NoticeService.deleteNotice(noticeId);

            res.status(200).json({ message: 'Notice deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async deleteFile(req, res, next) {
        try {
            const { noticeFileId } = req.params;
            await NoticeService.deleteFile(noticeFileId);

            res.status(200).json({ message: 'NoticeFile deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NoticeController;