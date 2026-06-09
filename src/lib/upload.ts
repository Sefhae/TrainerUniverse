// Uploaded images are stored as base64 data URLs in the database rather than
// written to the filesystem. The deploy target (Vercel) has a read-only
// filesystem, so writing to public/uploads fails there; data URLs work
// everywhere and need no external storage. resolveImage() passes them straight
// through to <img src>.

const MAX_SIZE = 6 * 1024 * 1024;

export async function saveUploadedFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (jpg, png, webp, gif) are allowed.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('That image is too large (6MB maximum).');
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

// Data URLs live in the DB row, so there is nothing on disk to remove.
export function deleteUploadedFile(_photoPath: string) {
  void _photoPath;
}
