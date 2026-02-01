const db = require('@configs/knex');
const Inquiry = require("@models/inquiry/inquiry");
const InquiryResDto = require("@dtos/inquiry-dto/inquiry-res-dto");
const InquiryListResDto = require("@dtos/inquiry-dto/inquiry-list-res-dto");
const Exception = require('@exceptions/exception');
const fileDeleteUtil = require('@utils/file-delete-util');
const argon2 = require('argon2');
const createSearchQuery = require('@utils/search-query-builder');

class InquiryService {

    /* 전체 조회 */
    static async getAllInquiries(pagination) {
        const offset = pagination.getOffset();
        const limit = pagination.limit;

        const totalResult = await db('inquiries').count('id as count').first();
        const totalCount = totalResult.count;

        const inquiries = await db('inquiries')
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);

        const items = inquiries.map(inquiry => new InquiryListResDto(inquiry));

        return {
            items,
            pagination: pagination.getPaginationInfo(totalCount),
        };
    }

    /* 단건 조회 */
    static async getInquiryById(id) {
        const inquiry = await db('inquiries').where({ id }).first();
        if (!inquiry) {
            throw new Exception('ValueNotFoundException', 'Inquiry is not found');
        }

        const inquiryFiles = await db('inquiry_files').where({ inquiry_id: id });

        return new InquiryResDto(inquiry, inquiryFiles);
    }

    /* 검색 */
    static async searchInquiries(pagination, searchParams) {
        const offset = pagination.getOffset();
        const limit = pagination.limit;

        const query = createSearchQuery('inquiries', searchParams);

        const totalResult = await query.clone().count('id as count').first();
        const totalCount = totalResult.count;

        const inquiries = await query
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);

        const items = inquiries.map(inquiry => new InquiryListResDto(inquiry));

        return {
            items,
            pagination: pagination.getPaginationInfo(totalCount),
        };
    }

    /* 등록 */
    static async createInquiry(inquiryDto, inquiryFileDto) {
        const hashedPassword = await argon2.hash(inquiryDto.password);

        const newInquiry = new Inquiry({
            ...inquiryDto,
            password: hashedPassword,
        });

        const [insertedId] = await db('inquiries').insert(newInquiry);

        if (inquiryFileDto.isNotEmpty()) {
            const files = inquiryFileDto.paths.map(file => ({
                inquiry_id: insertedId,
                file_path: file.path,
            }));
            await db('inquiry_files').insert(files);
        }

        const inquiryFiles = await db('inquiry_files').where({ inquiry_id: insertedId });

        return new InquiryResDto({ id: insertedId, ...newInquiry }, inquiryFiles);
    }

    /* 수정 */
    static async editInquiry(id, inquiryDto, inquiryFileDto) {
        const inquiry = await db('inquiries').where({ id }).first();
        if (!inquiry) {
            throw new Exception('ValueNotFoundException', 'Inquiry is not found');
        }

        const updateInquiry = new Inquiry(inquiryDto);
        await db('inquiries').where({ id }).update(updateInquiry);

        if (inquiryFileDto.isNotEmpty()) {
            const files = inquiryFileDto.paths.map(file => ({
                inquiry_id: id,
                file_path: file.path,
            }));
            await db('inquiry_files').insert(files);
        }

        const inquiryFiles = await db('inquiry_files').where({ inquiry_id: id });

        return new InquiryResDto({ id, ...updateInquiry }, inquiryFiles);
    }

    /* 삭제 */
    static async deleteInquiry(id) {
        const inquiry = await db('inquiries').where({ id }).first();
        if (!inquiry) {
            throw new Exception('ValueNotFoundException', 'Inquiry is not found');
        }

        const files = await db('inquiry_files')
            .where({ inquiry_id: id })
            .select('file_path');

        for (const file of files) {
            await fileDeleteUtil.deleteFile(file.file_path);
        }

        await db('inquiry_files').where({ inquiry_id: id }).del();
        await db('inquiries').where({ id }).del();
    }

    /* 첨부파일 단건 삭제 */
    static async deleteFile(id) {
        const file = await db('inquiry_files').where({ id }).first();
        if (!file) {
            throw new Exception('ValueNotFoundException', 'InquiryFile is not found');
        }

        await fileDeleteUtil.deleteFile(file.file_path);
        await db('inquiry_files').where({ id }).del();
    }
}

module.exports = InquiryService;
