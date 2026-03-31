import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

const authSecret = process.env.AUTH_SECRET

if (!authSecret) {
  throw new Error('Missing environment variable: AUTH_SECRET')
}

export const authCookieName = 'blog_auth'

export type AuthTokenPayload = {
  sub: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, authSecret, { expiresIn: '7d' })
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, authSecret) as AuthTokenPayload
  } catch {
    return null
  }
}

export function buildAuthCookie(token: string): string {
  return serialize(authCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookie(): string {
  return serialize(authCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
