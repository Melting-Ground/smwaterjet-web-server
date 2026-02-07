const db = require('@configs/knex');
const NoticeResDto = require('@dtos/notice-dto/notice-res-dto');
const NoticeListResDto = require('@dtos/notice-dto/notice-list-res-dto');
const Notice = require('@models/notice/notice');
const Exception = require('@exceptions/exception');
const fileDeleteUtil = require('@utils/file-delete-util');
const createSearchQuery = require('@utils/search-query-builder');
const storage = require('@utils/storage');

class NoticeService {
    static async getAllNotices(pagination) {
        const offset = pagination.getOffset();
        const limit = pagination.limit;

        const totalResult = await db('notices')
            .count('id as count')
            .first();
        const totalCount = totalResult.count;

        const notices = await db('notices')
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);

        const items = notices.map(notice => new NoticeListResDto(notice));

        return {
            items,
            pagination: pagination.getPaginationInfo(totalCount),
        };
    }

    static async getNoticeById(id) {
        const notice = await db('notices').where({ id }).first();
        if (!notice) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }

        const noticeFiles = await db('notice_files').where({ notice_id: id });

        return new NoticeResDto(notice, noticeFiles);
    }

    static async searchNotices(pagination, searchParams) {
        const offset = pagination.getOffset();
        const limit = pagination.limit;

        const query = createSearchQuery('notices', searchParams);

        const totalResult = await query.clone()
            .count('id as count')
            .first();
        const totalCount = totalResult.count;

        const notices = await query
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);

        const items = notices.map(notice => new NoticeListResDto(notice));

        return {
            items,
            pagination: pagination.getPaginationInfo(totalCount),
        };
    }

    static async createNotice(noticeDto, noticeFileDto) {
        let storedPaths = [];
        try {
            if (noticeFileDto.isNotEmpty()) {
                storedPaths = await storage.storePaths(noticeFileDto.paths);
            }
            return await db.transaction(async (trx) => {
                const newNotice = new Notice(noticeDto);
                const [insertedId] = await trx('notices').insert(newNotice);

                if (storedPaths.length > 0) {
                    const files = storedPaths.map(file => ({
                        notice_id: insertedId,
                        file_path: file.path,
                    }));
                    await trx('notice_files').insert(files);
                }

                const noticeFiles = await trx('notice_files').where({ notice_id: insertedId });

                return new NoticeResDto({ id: insertedId, ...newNotice }, noticeFiles);
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

    static async editNotice(id, noticeDto, noticeFileDto) {
        let storedPaths = [];
        try {
            if (noticeFileDto.isNotEmpty()) {
                storedPaths = await storage.storePaths(noticeFileDto.paths);
            }
            return await db.transaction(async (trx) => {
                const notice = await trx('notices').where({ id }).first();
                if (!notice) {
                    throw new Exception('ValueNotFoundException', 'Notice is not found');
                }

                const updateNotice = new Notice(noticeDto);
                await trx('notices').where({ id }).update(updateNotice);

                if (storedPaths.length > 0) {
                    const files = storedPaths.map(file => ({
                        notice_id: id,
                        file_path: file.path,
                    }));
                    await trx('notice_files').insert(files);
                }

                const noticeFiles = await trx('notice_files').where({ notice_id: id });

                return new NoticeResDto({ id, ...updateNotice }, noticeFiles);
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

    static async deleteNotice(id) {
        const notice = await db('notices').where({ id }).first();
        if (!notice) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }

        const files = await db('notice_files')
            .where({ notice_id: id })
            .select('file_path');

        for (const file of files) {
            try {
                await fileDeleteUtil.deleteFile(file.file_path);
            } catch (e) { }
        }

        await db('notice_files').where({ notice_id: id }).del();
        await db('notices').where({ id }).del();
    }

    static async deleteFile(id) {
        const file = await db('notice_files').where({ id }).first();
        if (!file) {
            throw new Exception('ValueNotFoundException', 'NoticeFile is not found');
        }

        try {
            await fileDeleteUtil.deleteFile(file.file_path);
        } catch (e) { }
        await db('notice_files').where({ id }).del();
    }
}

module.exports = NoticeService;
