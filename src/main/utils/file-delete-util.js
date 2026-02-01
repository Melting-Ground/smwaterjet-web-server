const fs = require('fs/promises');
const path = require('path');
const Exception = require('@exceptions/exception');

async function deleteFile(filePath) {
  if (!filePath) return;

  const rel = String(filePath).replaceAll('\\', '/').replace(/^\/+/, '');
  const uploadsRoot = path.resolve(process.cwd(), 'public');
  const abs = path.resolve(process.cwd(), rel);
  const relative = path.relative(uploadsRoot, abs);
  const isInsideUploads = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
  if (!isInsideUploads) {
    throw new Exception('BadRequestException', 'Invalid file path');
  }

  try {
    await fs.unlink(abs);
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
}

module.exports = { deleteFile };
