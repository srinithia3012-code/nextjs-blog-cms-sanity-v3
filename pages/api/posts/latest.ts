import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllPosts, getClient } from 'lib/sanity.client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const client = getClient()
  const posts = await getAllPosts(client)
  const latest = posts?.[0]

  return res.status(200).json({ slug: latest?.slug || null })
}
