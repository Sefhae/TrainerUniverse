import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_SIZE = 6 * 1024 * 1024;

export async function saveUploadedFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (jpg, png, webp, gif) are allowed.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('That image is too large (6MB maximum).');
  }

  let ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) ext = '.jpg';

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(bytes));

  return `/uploads/${filename}`;
}

export function deleteUploadedFile(photoPath: string) {
  if (!photoPath || !photoPath.startsWith('/uploads/')) return;
  const filepath = path.join(uploadDir, path.basename(photoPath));
  try {
    fs.unlinkSync(filepath);
  } catch {
    // ignore if file not found
  }
}
