'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash, Plus } from 'lucide-react'
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
  status: 'pending' | 'awarded' | 'dead'
  lineItems: LineItem[]
}

export default function Home() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      const fetchProjects = async () => {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            line_items (*)
          `)
          .eq('user_id', session.user.id)

        if (error) {
          console.error('Error fetching projects:', error)
          return
        }

        const formattedProjects: Project[] = data.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          lineItems: project.line_items.map(item => ({
            id: item.id,
            service: item.service,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unit_price
          }))
        }))

        setProjects(formattedProjects)
      }

      fetchProjects()
    }
  }, [session, supabase])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md">
          <AuthComponent />
        </div>
      </div>
    )
  }

  const addProject = async (name: string, status: 'pending' | 'awarded' | 'dead') => {
    if (!session?.user?.id) return

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name,
        status,
        user_id: session.user.id
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error adding project:', projectError)
      return
    }

    setProjects([...projects, { ...project, lineItems: [] }])
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return
    }

    setProjects(projects.filter(p => p.id !== id))
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating project:', error)
      return
    }

    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  return (
    <main className="p-8">
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="dead">Dead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Create Project</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Line Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>{project.lineItems.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Pencil />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="text-right">
        <Button 
          variant="outline" 
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </Button>
      </div>
    </main>
  )
}