'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<Awaited<ReturnType<typeof import('@/lib/supabase/client').createClient>> | null>(null)

  useEffect(() => {
    setMounted(true)
    import('@/lib/supabase/client').then(({ createClient }) => {
      supabaseRef.current = createClient()
    }).catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!supabaseRef.current) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    const { error } = await supabaseRef.current.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/app')
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabaseRef.current) return
    await supabaseRef.current.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,158,255,0.06)_0%,transparent_70%)] rounded-full animate-glow-pulse pointer-events-none" />
      <div className="w-full max-w-sm relative">
        <div className="animate-fade-in-down text-center mb-8">
          <h1 className="text-2xl font-medium text-[#fcfdff] mb-2">Sign in to LocalMind</h1>
          <p className="text-sm text-[#a1a4a5]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#3b9eff] hover:underline transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in-up delay-200">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-[#ff2047] animate-fade-in-down">{error}</p>
          )}

          <Button type="submit" className="w-full transition-all duration-200 hover:scale-[1.02]" disabled={loading || !mounted}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="relative my-6 animate-fade-in delay-400">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#000000] px-3 text-[#464a4d]">or</span>
          </div>
        </div>

        <div className="animate-fade-in-up delay-500">
          <Button variant="outline" className="w-full transition-all duration-200 hover:scale-[1.02]" onClick={handleGoogleLogin} disabled={!mounted}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
