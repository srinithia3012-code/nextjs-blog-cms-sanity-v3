import { useRouter } from 'next/router'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Signup failed')
        return
      }

      try {
        const latestRes = await fetch('/api/posts/latest')
        const latest = await latestRes.json()
        if (latest?.slug) {
          await router.push(`/posts/${latest.slug}`)
          return
        }
      } catch {
        // ignore and fall back
      }

      await router.push('/')
    } catch {
      setError('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-gray-900">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign up with your email and password.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium">
            Name
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <a className="underline" href="/login">
            Sign in
          </a>
        </p>
      </div>
    </main>
  )
}
