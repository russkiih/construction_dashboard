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
import Link from "next/link"
import { ArrowRight, BarChart2, Building2, DollarSign, LogIn } from "lucide-react"
import Image from 'next/image'

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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center space-y-8 bg-gradient-to-b from-background to-muted">
        <div className="max-w-2xl space-y-4">
        <div className="flex justify-center mb-8">
          <Image
            src="/cube.png"
            alt="CostCube Logo"
            width={100}
            height={100}
            priority
          />
        </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="text-primary">Cost Cube</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track, analyze, and optimize your construction project costs with precision and ease.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" variant="default" asChild>
              <Link href="/login">
                Login or Sign Up<LogIn className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 space-y-16">
        <h2 className="text-3xl font-bold text-center">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Cost Tracking</h3>
            <p className="text-muted-foreground">
              Real-time tracking of project expenses, labor costs, and material usage.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="p-3 rounded-full bg-primary/10">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Analytics</h3>
            <p className="text-muted-foreground">
              Detailed insights and reports to help you make data-driven decisions.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="p-3 rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Project Management</h3>
            <p className="text-muted-foreground">
              Streamlined project organization and resource allocation tools.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold">Ready to Optimize Your Construction Costs?</h2>
          <p className="text-xl text-muted-foreground">
            Join construction professionals who trust CostCube for their project cost management.
          </p>
          <Button size="lg" asChild>
            <Link href="/login?signup=true">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}