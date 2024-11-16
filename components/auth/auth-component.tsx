'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from "@/components/ui/card"

export default function AuthComponent() {
  const supabase = createClientComponentClient()
  
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
        <h1 className="text-2xl font-bold text-center mb-8">Professional Construction Proposals</h1>
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
      </Card>
    </div>
  )
} 