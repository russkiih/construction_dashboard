'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, Pencil, Trash } from 'lucide-react'
import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import type { Project } from '@/types'

export default function Dashboard() {
  const session = useSession()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectGC, setNewProjectGC] = useState('')
  const [newProjectContact, setNewProjectContact] = useState('')
  const [newProjectDueDate, setNewProjectDueDate] = useState('')
  const [newProjectStatus, setNewProjectStatus] = useState<'pending' | 'awarded' | 'dead'>('pending')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        line_items (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return
    }

    const formattedProjects: Project[] = (data || []).map(project => ({
      id: project.id,
      name: project.name,
      gc: project.gc,
      contact: project.contact || '',
      dueDate: project.due_date || '',
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDuplicateProject = async (project: Project) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('projects')
      .insert({
        name: `${project.name} (Copy)`,
        gc: project.gc,
        contact: project.contact,
        due_date: project.dueDate,
        status: project.status,
        user_id: user.id
      })

    if (error) {
      console.error('Error duplicating project:', error)
      return
    }

    fetchProjects()
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectToDelete)

    if (error) {
      console.error('Error deleting project:', error)
      return
    }

    setProjectToDelete(null)
    setIsDeleteDialogOpen(false)
    fetchProjects()
  }

  const handleEditProject = async () => {
    if (!editingProject) return

    const { error } = await supabase
      .from('projects')
      .update({
        name: editingProject.name,
        gc: editingProject.gc,
        contact: editingProject.contact,
        due_date: editingProject.dueDate,
        status: editingProject.status
      })
      .eq('id', editingProject.id)

    if (error) {
      console.error('Error updating project:', error)
      return
    }

    setEditingProject(null)
    setIsEditDialogOpen(false)
    fetchProjects()
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('projects')
      .insert({
        name: newProjectName,
        gc: newProjectGC,
        contact: newProjectContact,
        due_date: newProjectDueDate,
        status: newProjectStatus,
        user_id: user.id
      })

    if (error) {
      console.error('Error creating project:', error)
      return
    }

    setIsNewProjectDialogOpen(false)
    setNewProjectName('')
    setNewProjectGC('')
    setNewProjectContact('')
    setNewProjectDueDate('')
    setNewProjectStatus('pending')
    fetchProjects()
  }

  if (!session) {
    return null
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
                    <Label htmlFor="contact">Contact</Label>
                    <Input 
                      id="contact" 
                      value={newProjectContact}
                      onChange={(e) => setNewProjectContact(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={newProjectDueDate}
                      onChange={(e) => setNewProjectDueDate(e.target.value)}
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
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewProjectDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18%]">Project Name</TableHead>
                <TableHead className="w-[18%]">General Contractor</TableHead>
                <TableHead className="w-[15%]">Contact</TableHead>
                <TableHead className="w-[12%]">Due Date</TableHead>
                <TableHead className="w-[15%]">Lump Sum</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[12%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      {project.name}
                    </Button>
                  </TableCell>
                  <TableCell>{project.gc}</TableCell>
                  <TableCell>{project.contact}</TableCell>
                  <TableCell>{project.dueDate}</TableCell>
                  <TableCell>
                    <div className="bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200">
                      <p className={`text-sm font-medium
                        ${project.status === 'pending' ? 'text-yellow-700' : 
                          project.status === 'awarded' ? 'text-green-700' : 
                          'text-red-700'}`
                      }>
                        ${(project.lineItems?.reduce((sum, item) => 
                          sum + (item.quantity * item.unitPrice), 0) || 0).toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        project.status === 'awarded' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`
                    }>
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDuplicateProject(project)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingProject(project)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setProjectToDelete(project.id)
                          setIsDeleteDialogOpen(true)
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&quot;{projects.find(p => p.id === projectToDelete)?.name}&quot;</strong>?
              This action cannot be undone and will permanently delete the project and all its line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingProject && (
              <>
                <div>
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingProject.status}
                    onValueChange={(value: 'pending' | 'awarded' | 'dead') => 
                      setEditingProject({
                        ...editingProject,
                        status: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                      <SelectItem value="dead">Dead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditProject}>
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </main>
  )
} 