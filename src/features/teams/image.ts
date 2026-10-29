/** Decode and re-encode locally; no remote upload, SVG or metadata retained. */
export async function importLogo(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !/\.(png|jpe?g|webp)$/i.test(file.name)) throw Error('Admite JPG, PNG o WebP.')
  if (file.size === 0 || file.size > 10 * 1024 * 1024) throw Error('La imagen debe pesar entre 1 byte y 10 MB.')
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (!(file.type === 'image/png' && png || file.type === 'image/jpeg' && jpeg || file.type === 'image/webp' && webp)) throw Error('El contenido de la imagen no coincide con su formato declarado.')
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw Error('No se pudo decodificar la imagen.') }
  try {
    if (bitmap.width < 64 || bitmap.height < 64 || bitmap.width > 8192 || bitmap.height > 8192 || bitmap.width * bitmap.height > 32000000) throw Error('Dimensiones: mínimo 64×64, máximo 8192 por lado y 32 megapíxeles. Recomendado: 512×512.')
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) throw Error('El navegador no permite procesar la imagen.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const data = canvas.toDataURL('image/webp', .85)
    if (!data.startsWith('data:image/webp;') || data.length > 2000000) throw Error('No se pudo optimizar la imagen. Prueba otra más pequeña.')
    return data
  } finally { bitmap.close() }
}
