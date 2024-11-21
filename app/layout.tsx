import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SupabaseProvider from '@/components/providers/supabase-provider'
import AccountHeader from '@/components/account/account-header'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore  
  })
  
  const [{ data: { session } }, { data: { user } }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser()
  ])

  const verifiedSession = user ? session : null

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider initialSession={verifiedSession}>
          {session && <AccountHeader />}
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
