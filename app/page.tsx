'use client'

import { useState } from 'react'
import { Pencil, Trash, Plus } from 'lucide-react'
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

export default function ConstructionDashboard() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Sample Project',
      status: 'pending',
      lineItems: [
        {
          id: '1',
          service: 'Sealant',
          quantity: 1000,
          unit: 'Lf',
          unitPrice: 5.00
        }
      ]
    }
  ])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isLineItemDialogOpen, setIsLineItemDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const calculateTotal = (lineItems: LineItem[]) => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const addProject = (name: string, status: 'pending' | 'awarded' | 'dead') => {
    setProjects([...projects, {
      id: Date.now().toString(),
      name,
      status,
      lineItems: []
    }])
  }

  const addLineItem = (projectId: string, lineItem: Omit<LineItem, 'id'>) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          lineItems: [...project.lineItems, { ...lineItem, id: Date.now().toString() }]
        }
      }
      return project
    }))
  }

  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === statusFilter)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Construction Project Dashboard</h1>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-black/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  addProject(
                    formData.get('name') as string,
                    formData.get('status') as 'pending' | 'awarded' | 'dead'
                  )
                  setIsProjectDialogOpen(false)
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="pending">
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
                  </div>
                  <Button type="submit" className="w-full">Add Project</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="p-6 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{project.name}</h2>
                  <p className="text-sm text-gray-600">Status: {project.status}</p>
                  <p className="text-sm text-gray-600">
                    Total Value: ${calculateTotal(project.lineItems).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Dialog open={isLineItemDialogOpen && currentProject?.id === project.id} 
                     onOpenChange={(open) => {
                       setIsLineItemDialogOpen(open)
                       if (!open) setCurrentProject(null)
                     }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="mb-4"
                    onClick={() => setCurrentProject(project)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Line Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Line Item</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    if (currentProject) {
                      addLineItem(currentProject.id, {
                        service: formData.get('service') as string,
                        quantity: Number(formData.get('quantity')),
                        unit: formData.get('unit') as string,
                        unitPrice: Number(formData.get('unitPrice'))
                      })
                    }
                    setIsLineItemDialogOpen(false)
                    setCurrentProject(null)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="service">Service</Label>
                        <Input id="service" name="service" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" name="unit" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unitPrice">Unit Price ($)</Label>
                        <Input id="unitPrice" name="unitPrice" type="number" step="0.01" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Add Line Item</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.lineItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}