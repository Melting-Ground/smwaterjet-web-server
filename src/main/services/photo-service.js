const db = require('@configs/knex');
const Photo = require('@models/photo/photo');
const PhotoResDto = require('@dtos/photo-dto/photo-res-dto');
const fileDeleteUtil = require('@utils/file-delete-util');
const Exception = require('@exceptions/exception');
const PhotoListResDto = require('@dtos/photo-dto/photo-list-res-dto');
const storage = require('@utils/storage');

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
      throw new Exception('BadRequestException', 'Photo files are required.');
    }

    let storedFiles = [];
    try {
      storedFiles = await storage.storePaths(photoFileDto.files);
    } catch (error) {
      throw error;
    }

    const thumbnailPath = storedFiles[0]?.path;
    if (!thumbnailPath) {
      throw new Exception('InternalServerException', 'Failed to set thumbnail_path (missing file_path).');
    }

    try {
      return await db.transaction(async (trx) => {
        const newPhoto = new Photo({
          ...photoDto,
          thumbnail_path: thumbnailPath,
        });

        const [insertedId] = await trx('photos').insert(newPhoto);

        const photoFiles = storedFiles.map(file => ({
          photo_id: insertedId,
          file_path: file.path,
        }));
        await trx('photo_files').insert(photoFiles);

        return new PhotoResDto(
          { id: insertedId, ...newPhoto },
          photoFiles
        );
      });
    } catch (error) {
      for (const file of storedFiles) {
        try {
          await fileDeleteUtil.deleteFile(file.path);
        } catch (e) { }
      }
      throw error;
    }
  }

  static async editPhoto(id, photoDto, photoFileDto) {
    let storedFiles = [];
    try {
      if (photoFileDto?.files?.length) {
        storedFiles = await storage.storePaths(photoFileDto.files);
      }
      return await db.transaction(async (trx) => {
        const photo = await trx('photos').where({ id }).first();
        if (!photo) {
          throw new Exception('ValueNotFoundException', 'Photo is not found');
        }

        let thumbnailPath = photo.thumbnail_path;

        if (storedFiles.length) {
          const nextThumb = storedFiles[0]?.path;
          if (!nextThumb) {
            throw new Exception('InternalServerException', 'Failed to set thumbnail_path (missing file_path).');
          }
          thumbnailPath = nextThumb;

          const photoFiles = storedFiles.map(file => ({
            photo_id: id,
            file_path: file.path,
          }));
          await trx('photo_files').insert(photoFiles);
        }

        const updatePhoto = new Photo({
          ...photoDto,
          thumbnail_path: thumbnailPath,
        });

        await trx('photos').where({ id }).update(updatePhoto);

        const photoFiles = await trx('photo_files').where({ photo_id: id });

        return new PhotoResDto(
          { id, ...updatePhoto },
          photoFiles
        );
      });
    } catch (error) {
      for (const file of storedFiles) {
        try {
          await fileDeleteUtil.deleteFile(file.path);
        } catch (e) { }
      }
      throw error;
    }
  }

  static async deletePhoto(id) {
    const photo = await db('photos').where({ id }).first();
    if (!photo) {
      throw new Exception('ValueNotFoundException', 'Photo is not found');
    }

    const photoFiles = await db('photo_files').where({ photo_id: id });

    for (const file of photoFiles) {
      try {
        await fileDeleteUtil.deleteFile(file.file_path);
      } catch (e) { }
    }

    await db('photo_files').where({ photo_id: id }).del();
    await db('photos').where({ id }).del();
  }

  static async deleteFile(photoFileId) {
    const file = await db('photo_files').where({ id: photoFileId }).first();
    if (!file) {
      throw new Exception('ValueNotFoundException', 'PhotoFile is not found');
    }

    try {
      await fileDeleteUtil.deleteFile(file.file_path);
    } catch (e) { }
    await db('photo_files').where({ id: photoFileId }).del();

    const photo = await db('photos').where({ id: file.photo_id }).first();
    if (!photo) return;

    if (photo.thumbnail_path === file.file_path) {
      const remain = await db('photo_files')
        .where({ photo_id: file.photo_id })
        .orderBy('id', 'asc')
        .first();

      if (!remain) {
        throw new Exception('BadRequestException', 'Cannot delete the last file because thumbnail_path is required.');
      }

      await db('photos')
        .where({ id: file.photo_id })
        .update({ thumbnail_path: remain.file_path });
    }
  }
}

module.exports = PhotoService;
