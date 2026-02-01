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
    const totalCount = Number(totalItemsResult.count) || 0;

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
    if (!photoFileDto?.files || photoFileDto.files.length === 0) {
      throw new Exception('BadRequestException', '사진 파일(files)이 필요합니다.');
    }

    const thumbnailPath = photoFileDto.files[0]?.file_path;
    if (!thumbnailPath) {
      throw new Exception('InternalServerException', 'thumbnail_path 생성 실패 (file_path 없음)');
    }

    // 2) photos insert
    const newPhoto = new Photo({
      ...photoDto,
      thumbnail_path: thumbnailPath,
    });

    const [insertedId] = await db('photos').insert(newPhoto);

    // 3) photo_files insert
    const photoFiles = photoFileDto.files.map(file => ({
      photo_id: insertedId,
      file_path: file.file_path,
    }));
    await db('photo_files').insert(photoFiles);

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

    if (photoFileDto?.files?.length) {
      const nextThumb = photoFileDto.files[0]?.file_path;
      if (!nextThumb) {
        throw new Exception('InternalServerException', 'thumbnail_path 생성 실패 (file_path 없음)');
      }
      thumbnailPath = nextThumb;

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
      try {
        await fileDeleteUtil.deleteFile(file.file_path);
      } catch (e) { }
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

    // 1) 실제 파일 삭제 + photo_files row 삭제
    try {
      await fileDeleteUtil.deleteFile(file.file_path);
    } catch (e) { }
    await db('photo_files').where({ id: photoFileId }).del();

    // 2) 해당 photo의 현재 썸네일이 방금 삭제한 파일이면 썸네일 재지정
    const photo = await db('photos').where({ id: file.photo_id }).first();
    if (!photo) return;

    if (photo.thumbnail_path === file.file_path) {
      const remain = await db('photo_files')
        .where({ photo_id: file.photo_id })
        .orderBy('id', 'asc')
        .first();

      if (!remain) {
        throw new Exception('BadRequestException', '마지막 파일은 삭제할 수 없습니다(썸네일 NOT NULL).');
      }

      await db('photos')
        .where({ id: file.photo_id })
        .update({ thumbnail_path: remain.file_path });
    }
  }
}

module.exports = PhotoService;