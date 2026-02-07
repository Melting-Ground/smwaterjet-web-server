const db = require('@configs/knex');
const Inquiry = require('@models/inquiry/inquiry');
const InquiryResDto = require('@dtos/inquiry-dto/inquiry-res-dto');
const InquiryListResDto = require('@dtos/inquiry-dto/inquiry-list-res-dto');
const Exception = require('@exceptions/exception');
const fileDeleteUtil = require('@utils/file-delete-util');
const argon2 = require('argon2');
const createSearchQuery = require('@utils/search-query-builder');
const storage = require('@utils/storage');

class InquiryService {
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

    static async getInquiryById(id) {
        const inquiry = await db('inquiries').where({ id }).first();
        if (!inquiry) {
            throw new Exception('ValueNotFoundException', 'Inquiry is not found');
        }

        const inquiryFiles = await db('inquiry_files').where({ inquiry_id: id });

        return new InquiryResDto(inquiry, inquiryFiles);
    }

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

    static async createInquiry(inquiryDto, inquiryFileDto) {
        let storedPaths = [];
        try {
            if (inquiryFileDto.isNotEmpty()) {
                storedPaths = await storage.storePaths(inquiryFileDto.paths);
            }
            return await db.transaction(async (trx) => {
                const hashedPassword = await argon2.hash(inquiryDto.password);

                const newInquiry = new Inquiry({
                    ...inquiryDto,
                    password: hashedPassword,
                });

                const [insertedId] = await trx('inquiries').insert(newInquiry);

                if (storedPaths.length > 0) {
                    const files = storedPaths.map(file => ({
                        inquiry_id: insertedId,
                        file_path: file.path,
                    }));
                    await trx('inquiry_files').insert(files);
                }

                const inquiryFiles = await trx('inquiry_files').where({ inquiry_id: insertedId });

                return new InquiryResDto({ id: insertedId, ...newInquiry }, inquiryFiles);
            });
        } catch (error) {
            for (const file of storedPaths) {
                try {
                    await fileDeleteUtil.deleteFile(file.path);
                } catch (e) { }
            }
            throw error;
        }
    }

    static async editInquiry(id, inquiryDto, inquiryFileDto) {
        let storedPaths = [];
        try {
            if (inquiryFileDto.isNotEmpty()) {
                storedPaths = await storage.storePaths(inquiryFileDto.paths);
            }
            return await db.transaction(async (trx) => {
                const inquiry = await trx('inquiries').where({ id }).first();
                if (!inquiry) {
                    throw new Exception('ValueNotFoundException', 'Inquiry is not found');
                }

                const updateInquiry = new Inquiry(inquiryDto);
                await trx('inquiries').where({ id }).update(updateInquiry);

                if (storedPaths.length > 0) {
                    const files = storedPaths.map(file => ({
                        inquiry_id: id,
                        file_path: file.path,
                    }));
                    await trx('inquiry_files').insert(files);
                }

                const inquiryFiles = await trx('inquiry_files').where({ inquiry_id: id });

                return new InquiryResDto({ id, ...updateInquiry }, inquiryFiles);
            });
        } catch (error) {
            for (const file of storedPaths) {
                try {
                    await fileDeleteUtil.deleteFile(file.path);
                } catch (e) { }
            }
            throw error;
        }
    }

    static async deleteInquiry(id) {
        const inquiry = await db('inquiries').where({ id }).first();
        if (!inquiry) {
            throw new Exception('ValueNotFoundException', 'Inquiry is not found');
        }

        const files = await db('inquiry_files')
            .where({ inquiry_id: id })
            .select('file_path');

        for (const file of files) {
            try {
                await fileDeleteUtil.deleteFile(file.file_path);
            } catch (e) { }
        }

        await db('inquiry_files').where({ inquiry_id: id }).del();
        await db('inquiries').where({ id }).del();
    }

    static async deleteFile(id) {
        const file = await db('inquiry_files').where({ id }).first();
        if (!file) {
            throw new Exception('ValueNotFoundException', 'InquiryFile is not found');
        }

        try {
            await fileDeleteUtil.deleteFile(file.file_path);
        } catch (e) { }
        await db('inquiry_files').where({ id }).del();
    }
}

module.exports = InquiryService;
