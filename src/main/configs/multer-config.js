const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Exception = require('@exceptions/exception');

const createMulter = (category) => {
  const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      const uploadPath = `public/${category}/`;
      try {
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (err) {
        cb(err);
      }
    },

    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });
  const limits = {
    fileSize: 50 * 1024 * 1024, // 50MB
  };

  const baseMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ];
  const baseExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.mp4',
    '.mov',
    '.webm',
  ];

  const docMimeTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const docExtensions = [
    '.pdf',
    '.ppt',
    '.pptx',
  ];

  const allowDocs = category === 'inquiries' || category === 'notices';
  const allowedMimeTypes = new Set(allowDocs ? [...baseMimeTypes, ...docMimeTypes] : baseMimeTypes);
  const allowedExtensions = new Set(allowDocs ? [...baseExtensions, ...docExtensions] : baseExtensions);

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isAllowed = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(ext);
    if (!isAllowed) {
      return cb(new Exception('BadRequestException', 'Unsupported file type.'));
    }
    cb(null, true);
  };

  return multer({ storage: storage, limits, fileFilter });
};

module.exports = createMulter;
