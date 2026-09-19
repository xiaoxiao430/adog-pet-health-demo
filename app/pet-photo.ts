/** Resize local images before storing them; no image is uploaded to a server. */
export async function preparePetPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('请选择 JPG、PNG 或 WebP 格式的照片。');
  if (file.size > 8 * 1024 * 1024) throw new Error('照片不能超过 8 MB，请选择小一点的照片。');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('empty image');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.fillStyle = '#fffdf8'; context.fillRect(0, 0, 512, 512);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, (image.naturalWidth-side)/2, (image.naturalHeight-side)/2, side, side, 0, 0, 512, 512);
    return canvas.toDataURL('image/jpeg', .82);
  } catch { throw new Error('这张照片无法读取，请选择另一张照片。'); }
  finally { URL.revokeObjectURL(url); }
}
