const db = require('@configs/knex');
const NoticeResDto = require('@dtos/notice-dto/notice-res-dto');
const NoticeListResDto = require('@dtos/notice-dto/notice-list-res-dto');
const Notice = require('@models/notice/notice');
const Exception = require('@exceptions/exception');
const fileDeleteUtil = require('@utils/file-delete-util');
const createSearchQuery = require('@utils/search-query-builder');

class NoticeService {

    /* 전체 조회 */
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

    /* 단건 조회 */
    static async getNoticeById(id) {
        const notice = await db('notices').where({ id }).first();
        if (!notice) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }

        const noticeFiles = await db('notice_files').where({ notice_id: id });

        return new NoticeResDto(notice, noticeFiles);
    }

    /* 검색 */
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

    /* 등록 */
    static async createNotice(noticeDto, noticeFileDto) {
        const newNotice = new Notice(noticeDto);
        const [insertedId] = await db('notices').insert(newNotice);

        if (noticeFileDto.isNotEmpty()) {
            const files = noticeFileDto.paths.map(file => ({
                notice_id: insertedId,
                file_path: file.path,
            }));
            await db('notice_files').insert(files);
        }

        const noticeFiles = await db('notice_files').where({ notice_id: insertedId });

        return new NoticeResDto({ id: insertedId, ...newNotice }, noticeFiles);
    }

    /* 수정 */
    static async editNotice(id, noticeDto, noticeFileDto) {
        const notice = await db('notices').where({ id }).first();
        if (!notice) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }

        const updateNotice = new Notice(noticeDto);
        await db('notices').where({ id }).update(updateNotice);

        if (noticeFileDto.isNotEmpty()) {
            const files = noticeFileDto.paths.map(file => ({
                notice_id: id,
                file_path: file.path,
            }));
            await db('notice_files').insert(files);
        }

        const noticeFiles = await db('notice_files').where({ notice_id: id });

        return new NoticeResDto({ id, ...updateNotice }, noticeFiles);
    }

    /* 삭제 */
    static async deleteNotice(id) {
        const notice = await db('notices').where({ id }).first();
        if (!notice) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }

        const files = await db('notice_files')
            .where({ notice_id: id })
            .select('file_path');

        for (const file of files) {
            await fileDeleteUtil.deleteFile(file.file_path);
        }

        await db('notice_files').where({ notice_id: id }).del();
        await db('notices').where({ id }).del();
    }

    /* 첨부파일 단건 삭제 */
    static async deleteFile(id) {
        const file = await db('notice_files').where({ id }).first();
        if (!file) {
            throw new Exception('ValueNotFoundException', 'NoticeFile is not found');
        }

        await fileDeleteUtil.deleteFile(file.file_path);
        await db('notice_files').where({ id }).del();
    }
}

module.exports = NoticeService;
