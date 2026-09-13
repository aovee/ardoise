import { del } from '@vercel/blob'

export function isBlobUrl(url?: string | null): url is string {
  return !!url && url.includes('.blob.vercel-storage.com')
}

export async function deleteBlobIfOwned(url?: string | null): Promise<void> {
  if (!isBlobUrl(url)) return
  try {
    await del(url)
  } catch (error) {
    console.error('Failed to delete blob', url, error)
  }
}
