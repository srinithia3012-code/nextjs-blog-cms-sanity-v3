import type { NextApiRequest, NextApiResponse } from 'next'
import { authCookieName, verifyAuthToken } from 'lib/auth'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.cookies?.[authCookieName]

  if (!token) {
    return res.status(200).json({ user: null })
  }

  const payload = verifyAuthToken(token)

  if (!payload) {
    return res.status(200).json({ user: null })
  }

  return res.status(200).json({
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    },
  })
}
