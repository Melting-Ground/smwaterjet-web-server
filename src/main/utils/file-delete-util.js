const storage = require('@utils/storage');

async function deleteFile(filePath) {
  return storage.deleteStoredPath(filePath);
}

module.exports = { deleteFile };
