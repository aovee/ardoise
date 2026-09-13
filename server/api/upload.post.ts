import { put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find((part) => part.name === 'file')

  if (!file?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const type = file.type ?? ''
  if (!type.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File must be an image'
    })
  }

  const ext = type.split('/')[1] || 'jpg'
  const blob = await put(`recipes/${randomUUID()}.${ext}`, file.data, {
    access: 'public',
    contentType: type
  })

  return { url: blob.url }
})
