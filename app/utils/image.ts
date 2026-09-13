// Resize + re-encode an image in the browser BEFORE uploading, so a big phone
// photo (several MB) becomes a small web-friendly file. This keeps uploads well
// under Vercel's ~4.5 MB serverless request limit and saves storage.
export async function compressImage(
  file: File,
  { maxSize = 1200, quality = 0.8, type = 'image/webp' } = {}
): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not read image'))
    image.src = dataUrl
  })

  // Scale down only (never up), preserving aspect ratio.
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  )
  if (!blob) throw new Error('Image compression failed')
  return blob
}
