const InquiryDto = require('@dtos/inquiry-dto/inquiry-dto');
const InquiryFileDto = require('@dtos/inquiry-dto/inquiry-file-dto');
const InquiryService = require('@services/inquiry-service');
const Pagination = require('@utils/pagination');
const SearchParameters = require('@utils/search-parameters');

class InquiryController {
    static async getAllInquiries(req, res, next) {
        try {
            const pagination = new Pagination(req.query.page, req.query.limit);
            const inquiryResDtos = await InquiryService.getAllInquiries(pagination);
            res.status(200).json(inquiryResDtos);
        } catch (error) {
            next(error);
        }
    }

    static async getInquiryById(req, res, next) {
        try {
            const { inquiryId } = req.params;
            const inquiryResDto = await InquiryService.getInquiryById(inquiryId);
            res.status(200).json(inquiryResDto);
        } catch (error) {
            next(error);
        }
    }

    static async searchInquiries(req, res, next) {
        try {
            const pagination = new Pagination(req.query.page, req.query.limit);
            const searchParams = new SearchParameters(req.query.query, req.query.searchBy);

            const inquiryResDtos = await InquiryService.searchInquiries(pagination, searchParams);
            res.status(200).json(inquiryResDtos);
        } catch (error) {
            next(error);
        }
    }

    static async createInquiry(req, res, next) {
        try {
            const inquiryDto = new InquiryDto(req.body);
            const inquiryFileDto = new InquiryFileDto(req.files);
            const inquiryResDto = await InquiryService.createInquiry(inquiryDto, inquiryFileDto);

            res.status(201).json(inquiryResDto);
        } catch (error) {
            next(error);
        }
    }

    static async editInquiry(req, res, next) {
        try {
            const { inquiryId } = req.params;
            const inquiryDto = new InquiryDto(req.body);
            const inquiryFileDto = new InquiryFileDto(req.files);

            const inquiryResDto = await InquiryService.editInquiry(inquiryId, inquiryDto, inquiryFileDto);

            res.status(200).json(inquiryResDto);
        } catch (error) {
            next(error);
        }
    }

    static async deleteInquiry(req, res, next) {
        try {
            const { inquiryId } = req.params;
            await InquiryService.deleteInquiry(inquiryId);

            res.status(200).json({ message: 'Inquiry deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async deleteFile(req, res, next) {
        try {
            const { inquiryFileId } = req.params;
            await InquiryService.deleteFile(inquiryFileId);

            res.status(200).json({ message: 'InquiryFile deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = InquiryController;