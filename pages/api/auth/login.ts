import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildAuthCookie,
  signAuthToken,
  verifyPassword,
} from 'lib/auth'
import { getServerClient } from 'lib/sanity.server'

const userByEmailQuery = `*[_type == "blogUser" && email == $email][0]{
  _id,
  name,
  email,
  role,
  passwordHash
}`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const serverClient = getServerClient()

  const user = await serverClient.fetch(userByEmailQuery, {
    email: normalizedEmail,
  })

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const ok = await verifyPassword(password, user.passwordHash)

  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signAuthToken({
    sub: user._id,
    email: user.email,
    role: user.role || 'user',
  })

  res.setHeader('Set-Cookie', buildAuthCookie(token))

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    },
  })
}
