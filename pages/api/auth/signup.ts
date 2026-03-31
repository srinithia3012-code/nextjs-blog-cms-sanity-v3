import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildAuthCookie,
  hashPassword,
  signAuthToken,
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

  const { name, email, password } = req.body || {}

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required' })
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be 8+ characters' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const serverClient = getServerClient()

  const existing = await serverClient.fetch(userByEmailQuery, {
    email: normalizedEmail,
  })

  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const passwordHash = await hashPassword(password)

  const user = await serverClient.create({
    _type: 'blogUser',
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
  })

  const token = signAuthToken({
    sub: user._id,
    email: user.email,
    role: user.role || 'user',
  })

  res.setHeader('Set-Cookie', buildAuthCookie(token))

  return res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    },
  })
}
