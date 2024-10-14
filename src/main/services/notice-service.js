const db = require('@configs/knex');
const NoticeResDto = require('@dtos/notice-dto/notice-res-dto');
const Notice = require('@models/notice/notice');
const Exception = require('@exceptions/exceptions');
const fileDeleteUtil = require('@utils/file-delete-util');

class NoticeService {
    static async getAllNotices(page, limit) {
        const offset = (page - 1) * limit;
        const notices = await db('notices').limit(limit).offset(offset);
        const noticeResDtos = notices.map(cert => new NoticeResDto(cert));
        return noticeResDtos;
    }

    static async getNoticeById(id) {
        const notice = await db('notices').where({ id }).first();
        if (notice == null) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }

        const noticeFiles = await db('notice_files').where({ notice_id: id });
        return new NoticeResDto(notice, noticeFiles);
    }

    static async createNotice(noticeDto, noticeFileDto) {
        const newNotice = new Notice(noticeDto);

        const result = await db('notices').insert(newNotice);
        const insertedId = result[0];

        if (noticeFileDto.isNotEmpty()) {
            const fileInsertPromises = noticeFileDto.paths.map(async (path) => {
                return await db('notice_files').insert({
                    notice_id: insertedId,
                    path: path,
                });
            });
            await Promise.all(fileInsertPromises);
        }
        return new NoticeResDto(newNotice);
    }

    static async editNotice(id, noticeDto, noticeFileDto) {
        const notice = await db('notices').where({ id }).first();
        const updateNotice = new Notice(noticeDto);
        if (notice == null) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }
        await db('notices').where({ id }).update(updateNotice);

        if (noticeFileDto.isNotEmpty()) {
            const fileInsertPromises = noticeFileDto.paths.map(async (path) => {
                return await db('notice_files').insert({
                    notice_id: id,
                    path: path,
                });
            });
            await Promise.all(fileInsertPromises);
        }
        return new NoticeResDto(updateNotice);
    }

    static async deleteNotice(id) {
        const notice = await db('notices').where({ id }).first();
        if (notice == null) {
            throw new Exception('ValueNotFoundException', 'Notice is not found');
        }
        const filePaths = await db('notice_files').where({ notice_id: id }).select('file_path');

        for (const file of filePaths) {
            try {
                await fileDeleteUtil.deleteFile(file.path);
            } catch (error) {
                console.error(`Failed to delete file at ${file.path}:`, error);
            }
        }
        await db('notice_files').where({ notice_id: id }).del();
        await db('notices').where({ id }).del();
    }

    static async deleteFile(id) {
        try {
            const file = await db('notice_files').where({ id }).select('file_path').first();
            if (!file) {
                throw new Exception('ValueNotFoundException', 'NoticeFiles is not found');
            }
            const filePath = file.file_path;

            await db('notice_files').where({ id }).del();

            await fileDeleteUtil.deleteFile(filePath);

        } catch (error) {
            console.error(`Failed to delete file:`, error);
        }
    }
}

module.exports = NoticeService;