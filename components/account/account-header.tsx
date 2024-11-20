'use client'

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, HelpCircle, CreditCard, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Profile = {
  first_name: string
  last_name: string
  company_name: string
}

export default function AccountHeader() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session?.user?.id)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  if (!session?.user) return null

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="w-full bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              Welcome, {profile?.first_name || session.user.email?.split('@')[0]}
            </h2>
            {profile?.company_name && (
              <span className="text-sm text-gray-500">
                {profile.company_name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleNavigation('/help')}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
} 