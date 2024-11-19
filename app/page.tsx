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
  status: 'pending' | 'awarded' | 'dead'
  lineItems: LineItem[]
}

export default function Home() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectGC, setNewProjectGC] = useState('')
  const [newProjectStatus, setNewProjectStatus] = useState<'pending' | 'awarded' | 'dead'>('pending')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const router = useRouter()
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)

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
          gc: project.gc,
          status: project.status,
          lineItems: project.line_items.map((item: any) => ({
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

  const addProject = async (
    name: string, 
    gc: string, 
    status: 'pending' | 'awarded' | 'dead'
  ) => {
    if (!session?.user?.id) return

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name,
        gc,
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
    setIsNewProjectDialogOpen(false)
  }

  const deleteProject = async (project: Project) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (error) {
      console.error('Error deleting project:', error)
      return
    }

    setProjects(projects.filter(p => p.id !== project.id))
    setProjectToDelete(null)
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        gc: updates.gc,
        status: updates.status
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating project:', error)
      return
    }

    setProjects(projects.map(p => 
      p.id === id 
        ? { ...p, ...updates }
        : p
    ))
  }

  const handleProjectClick = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  const duplicateProject = async (project: Project) => {
    if (!session?.user?.id) return

    // Create new project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: `${project.name} (Copy)`,
        gc: project.gc,
        status: project.status,
        user_id: session.user.id
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error duplicating project:', projectError)
      return
    }

    // Create new line items
    if (project.lineItems.length > 0) {
      const newLineItems = project.lineItems.map(item => ({
        project_id: newProject.id,
        service: item.service,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice
      }))

      const { error: lineItemsError } = await supabase
        .from('line_items')
        .insert(newLineItems)

      if (lineItemsError) {
        console.error('Error duplicating line items:', lineItemsError)
        return
      }
    }

    // Refresh projects
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        line_items (*)
      `)
      .eq('id', newProject.id)
      .single()

    if (error) {
      console.error('Error fetching new project:', error)
      return
    }

    const formattedProject: Project = {
      id: data.id,
      name: data.name,
      gc: data.gc,
      status: data.status,
      lineItems: data.line_items.map((item: any) => ({
        id: item.id,
        service: item.service,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price
      }))
    }

    setProjects([...projects, formattedProject])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <main className="p-8">
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsNewProjectDialogOpen(true)}>
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
                    <Input 
                      id="name" 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc">General Contractor</Label>
                    <Input 
                      id="gc" 
                      value={newProjectGC}
                      onChange={(e) => setNewProjectGC(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newProjectStatus}
                      onValueChange={(value: 'pending' | 'awarded' | 'dead') => 
                        setNewProjectStatus(value)
                      }
                    >
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
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      await addProject(newProjectName, newProjectGC, newProjectStatus)
                      setNewProjectName('')
                      setNewProjectGC('')
                      setNewProjectStatus('pending')
                    }}
                  >
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[25%]">General Contractor</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[20%]">Lump Sum</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow 
                  key={project.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleProjectClick(project)}
                >
                  <TableCell className="w-[25%]">{project.name}</TableCell>
                  <TableCell className="w-[25%]">{project.gc}</TableCell>
                  <TableCell className="w-[15%]">{project.status}</TableCell>
                  <TableCell className="w-[20%]">
                    ${project.lineItems.reduce(
                      (sum, item) => sum + item.quantity * item.unitPrice, 
                      0
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell className="w-[15%] text-right">
                    <div 
                      className="flex gap-2 justify-end" 
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                    >
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateProject(project)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingProject(project)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectToDelete(project)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input 
                id="edit-name" 
                value={editingProject?.name || ''}
                onChange={(e) => setEditingProject(prev => 
                  prev ? { ...prev, name: e.target.value } : null
                )}
              />
            </div>
            <div>
              <Label htmlFor="edit-gc">General Contractor</Label>
              <Input 
                id="edit-gc" 
                value={editingProject?.gc || ''}
                onChange={(e) => setEditingProject(prev => 
                  prev ? { ...prev, gc: e.target.value } : null
                )}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editingProject?.status || 'pending'}
                onValueChange={(value: 'pending' | 'awarded' | 'dead') => 
                  setEditingProject(prev => 
                    prev ? { ...prev, status: value } : null
                  )
                }
              >
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
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                variant="outline"
                onClick={() => setEditingProject(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={async () => {
                  if (editingProject) {
                    const { name, gc, status } = editingProject
                    await updateProject(editingProject.id, { name, gc, status })
                    setEditingProject(null)
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{projectToDelete?.name}" and all its line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => projectToDelete && deleteProject(projectToDelete)}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-right">
        <Button 
          variant="outline" 
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </main>
  )
}