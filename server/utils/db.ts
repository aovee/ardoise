import { createClient, type Client } from '@libsql/client'

let client: Client | undefined

/**
 * Returns a singleton libSQL client connected to the Turso database.
 * Auto-imported by Nitro, so call `useDb()` directly in any server route.
 */
export function useDb(): Client {
  if (client) return client

  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set')
  }

  client = createClient({ url, authToken })
  return client
}
