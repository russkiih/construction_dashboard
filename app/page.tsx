'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash, Plus, Copy } from 'lucide-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import AuthComponent from '@/components/auth/auth-component'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type LineItem = {
  id: string
  service: string
  quantity: number
  unit: string
  unitPrice: number
}

type Project = {
  id: string
  name: string
  gc: string
  contact: string
  dueDate: string
  status: 'pending' | 'awarded' | 'dead'
  lineItems: LineItem[]
}

export default function Home() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (session) {
    return null // or a loading spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <AuthComponent />
      </div>
    </div>
  )
}