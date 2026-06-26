'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<Awaited<ReturnType<typeof import('@/lib/supabase/client').createClient>> | null>(null)

  useEffect(() => {
    setMounted(true)
    import('@/lib/supabase/client').then(({ createClient }) => {
      supabaseRef.current = createClient()
    }).catch(() => {})
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!supabaseRef.current) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    const { error } = await supabaseRef.current.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabaseRef.current) return
    await supabaseRef.current.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="animate-scale-in text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(17,255,153,0.1)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#11ff99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-medium text-[#fcfdff] mb-2">Check your email</h1>
          <p className="text-sm text-[#a1a4a5]">
            We sent a confirmation link to <span className="text-[#fcfdff]">{email}</span>
          </p>
          <Button variant="ghost" className="mt-6" onClick={() => router.push('/login')}>
            Back to sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] rounded-full animate-glow-pulse pointer-events-none" />
      <div className="w-full max-w-sm relative">
        <div className="animate-fade-in-down text-center mb-8">
          <h1 className="text-2xl font-medium text-[#fcfdff] mb-2">Create your account</h1>
          <p className="text-sm text-[#a1a4a5]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#3b9eff] hover:underline transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 animate-fade-in-up delay-200">
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
            {loading ? 'Creating account...' : 'Sign up'}
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
