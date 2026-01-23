const fs = require('fs/promises');
const path = require('path');

async function deleteFile(filePath) {
  if (!filePath) return;

  // DB에는 "/public/photos/xxx.png" 형태로 저장되어 있음
  // -> 앞의 "/" 제거해서 상대경로로 만든 다음, 프로젝트 루트에 붙인다.
  const rel = String(filePath).replaceAll('\\', '/').replace(/^\/+/, '');
  // "public/photos/xxx.png"

  const abs = path.join(process.cwd(), rel);
  // 예: D:\smwaterjet\smwaterjet-web\public\photos\xxx.png

  try {
    await fs.unlink(abs);
  } catch (e) {
    // 파일이 이미 없으면 무시
    if (e.code === 'ENOENT') return;
    throw e;
  }
}

module.exports = { deleteFile };

