const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

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
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });
  return multer({ storage: storage });
};

module.exports = createMulter;
