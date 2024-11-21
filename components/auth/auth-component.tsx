'use client'

import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function AuthComponent() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user && data.user.identities?.length === 0) {
        setError('This email is already registered. Please sign in instead.')
        return
      }

      setError('Please check your email for the confirmation link.')
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not authorized')) {
          setError('Email registration is currently restricted. Please contact support.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An error occurred during sign up')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="p-8 bg-white">
        <div className="flex justify-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            {/* 3D Blocks */}
            <g transform="translate(60,60)">
            {/* Front cube */}
            <path d="M0 40 L40 20 L80 40 L40 60 Z" fill="#000000"/>
            <path d="M80 40 L40 60 L40 100 L80 80 Z" fill="#1a1a1a"/>
            <path d="M0 40 L40 60 L40 100 L0 80 Z" fill="#333333"/>
      
            {/* Calculator screen */}
            <rect x="15" y="45" width="30" height="20" fill="#ffffff" rx="2"/>
            <text x="30" y="60" fontFamily="monospace" fontSize="14" fill="#000000" textAnchor="middle">1+1</text>
              
            {/* Dollar symbol */}
            {/* <text x="65" y="50" font-family="Arial" font-size="14" fill="#ffffff" text-anchor="middle">$</text> */}
            </g>
    
            {/* Company name */}
            <text x="100" y="175" fontFamily="Arial, sans-serif" fontSize="18" fill="#000000" textAnchor="middle" fontWeight="bold">CostCube</text>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Professional Construction Proposals</h1>
        
        {isSignUp ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Create Account
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-black hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#000000',
                      brandAccent: '#333333',
                    },
                  },
                },
                className: {
                  container: 'flex flex-col gap-4',
                  button: 'bg-primary text-primary-foreground hover:bg-primary/90',
                  input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                }
              }}
              providers={['google', 'github']}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(true)}
                className="text-sm text-gray-600 hover:underline"
              >
                Need an account? Sign up
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
} 