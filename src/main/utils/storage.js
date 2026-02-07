const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Exception = require('@exceptions/exception');

const storageDriver = process.env.STORAGE_DRIVER || 'local';

let r2Client;
const getR2Client = () => {
  if (r2Client) return r2Client;
  const options = {
    region: process.env.R2_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true,
  };
  r2Client = new S3Client(options);
  return r2Client;
};

const normalizePublicPath = (filePath) => {
  if (!filePath) return null;
  const rel = String(filePath).replaceAll('\\', '/').replace(/^\/+/, '');
  return '/' + rel;
};

const getKeyFromPublicPath = (publicPath) => {
  const rel = String(publicPath).replaceAll('\\', '/').replace(/^\/+/, '');
  if (rel.startsWith('public/')) {
    return rel.slice('public/'.length);
  }
  return rel;
};

const buildPublicUrl = (key) => {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) {
    throw new Exception('ConfigurationException', 'R2_PUBLIC_BASE_URL is required for public access');
  }
  return `${base.replace(/\/+$/, '')}/${key}`;
};

const keyFromStoredPath = (storedPath) => {
  if (!storedPath) return null;
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (base && storedPath.startsWith(base)) {
    return storedPath.slice(base.length).replace(/^\/+/, '');
  }
  if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
    const url = new URL(storedPath);
    return url.pathname.replace(/^\/+/, '');
  }
  return getKeyFromPublicPath(storedPath);
};

const deleteLocalFile = async (filePath) => {
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
    await fsp.unlink(abs);
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
};

const storeFromLocalPath = async ({ publicPath, localPath, contentType }) => {
  const normalizedPublicPath = normalizePublicPath(publicPath);
  if (storageDriver !== 'r2') {
    return normalizedPublicPath;
  }

  const key = getKeyFromPublicPath(normalizedPublicPath);
  const body = fs.createReadStream(localPath);
  const client = getR2Client();
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType || undefined,
  }));

  try {
    await fsp.unlink(localPath);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  return buildPublicUrl(key);
};

const storePaths = async (items) => {
  const arr = Array.isArray(items) ? items : [];
  const stored = [];
  for (const item of arr) {
    const storedPath = await storeFromLocalPath({
      publicPath: item.path || item.file_path,
      localPath: item.local_path,
      contentType: item.mime_type,
    });
    stored.push({ path: storedPath, file_path: storedPath });
  }
  return stored;
};

const deleteStoredPath = async (storedPath) => {
  if (!storedPath) return;
  if (storageDriver !== 'r2') {
    return deleteLocalFile(storedPath);
  }
  const key = keyFromStoredPath(storedPath);
  if (!key) return;
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  }));
};

module.exports = {
  storeFromLocalPath,
  storePaths,
  deleteStoredPath,
};
