const db = require('@configs/knex');
const Photo = require("@models/photo/photo");
const PhotoResDto = require("@dtos/photo-dto/photo-res-dto");
const fileDeleteUtil = require('@utils/file-delete-util');
const Exception = require('@exceptions/exception');
const PhotoListResDto = require("@dtos/photo-dto/photo-list-res-dto");


class PhotoService {
    static async getAllPhotos(pagination) {
        const offset = pagination.getOffset();
        const limit = pagination.limit;

        const totalItemsResult = await db('photos').count('id as count').first();
        const totalCount = totalItemsResult.count;

        const photos = await db('photos')
            .select('id', 'title', 'thumbnail_path', 'created_at')
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);        

        const photoListDtos = photos.map((photo, index) => 
        new PhotoListResDto({
            row_num: totalCount - (offset + index),
            ...photo,
        }));
        return {
            items: photoListDtos,
            pagination: pagination.getPaginationInfo(totalCount),
        };
    }

    static async getPhotoById(id) {
        const photo = await db('photos').where({ id }).first();
        if (photo == null) {
            throw new Exception('ValueNotFoundException', 'Photo is not found');
        }

        const photoFiles = await db('photo_files').where({ photo_id: id }).orderBy('id', 'asc');
        
        return new PhotoResDto(photo, photoFiles);
    }

    static async createPhoto(photoDto, photoFileDto) {
        // 1. 첫 번째 파일을 썸네일로 사용
        const thumbnailPath =
            Array.isArray(photoFileDto.files) && photoFileDto.files.length > 0
                ? photoFileDto.files[0].file_path
                : null;

        // 2. photos 테이블용 데이터 생성
            const newPhoto = new Photo({
                ...photoDto,
                thumbnail_path: thumbnailPath,
            });

        // 3. photos insert
        const [insertedId] = await db('photos').insert(newPhoto);

        // 4. photo_files insert
        if (photoFileDto.files?.length) {
            const photoFiles = photoFileDto.files.map(file => ({
                photo_id: insertedId,
                file_path: file.file_path,
            }));
            await db('photo_files').insert(photoFiles);
        }

        return new PhotoResDto(
            { id: insertedId, ...newPhoto },
            photoFileDto.files
        );
    }

    

static async editPhoto(id, photoDto, photoFileDto) {
    const photo = await db('photos').where({ id }).first();
    if (!photo) {
        throw new Exception('ValueNotFoundException', 'Photo is not found');
    }

    let thumbnailPath = photo.thumbnail_path;

    // 새 파일이 업로드된 경우
    if (photoFileDto.files?.length) {
        thumbnailPath = photoFileDto.files[0].file_path;

        const photoFiles = photoFileDto.files.map(file => ({
            photo_id: id,
            file_path: file.file_path,
        }));
        await db('photo_files').insert(photoFiles);
    }

    const updatePhoto = new Photo({
        ...photoDto,
        thumbnail_path: thumbnailPath,
    });

    await db('photos').where({ id }).update(updatePhoto);

    const photoFiles = await db('photo_files').where({ photo_id: id });

    return new PhotoResDto(
        { id, ...updatePhoto },
        photoFiles
    );
}

static async deletePhoto(id) {
    const photo = await db('photos').where({ id }).first();
    if (!photo) {
        throw new Exception('ValueNotFoundException', 'Photo is not found');
    }

    // 연관 파일 조회
    const photoFiles = await db('photo_files').where({ photo_id: id });

    // 실제 파일 삭제
    for (const file of photoFiles) {
        await fileDeleteUtil.deleteFile(file.file_path);
    }

    // photo_files → photos 순서로 삭제
    await db('photo_files').where({ photo_id: id }).del();
    await db('photos').where({ id }).del();
}

static async deleteFile(photoFileId) {
    const file = await db('photo_files').where({ id: photoFileId }).first();
    if (!file) {
        throw new Exception('ValueNotFoundException', 'PhotoFile is not found');
    }

    await fileDeleteUtil.deleteFile(file.file_path);
    await db('photo_files').where({ id: photoFileId }).del();
}
}

module.exports = PhotoService;