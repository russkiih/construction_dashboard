'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, ArrowLeft, Pencil, Trash, Copy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { Project, LineItem } from '@/types'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [project, setProject] = useState<Project | null>(null)
  const [isAddLineItemDialogOpen, setIsAddLineItemDialogOpen] = useState(false)
  const [newLineItem, setNewLineItem] = useState({
    service: '',
    quantity: '',
    unit: '',
    unitPrice: ''
  })
  const [isEditLineItemDialogOpen, setIsEditLineItemDialogOpen] = useState(false)
  const [editingLineItem, setEditingLineItem] = useState<LineItem | null>(null)
  const [isDeleteLineItemDialogOpen, setIsDeleteLineItemDialogOpen] = useState(false)
  const [lineItemToDelete, setLineItemToDelete] = useState<LineItem | null>(null)

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        line_items (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return
    }

    setProject({
      id: data.id,
      name: data.name,
      gc: data.gc,
      contact: data.contact || '',
      dueDate: data.due_date || '',
      status: data.status,
      lineItems: data.line_items.map((item: any) => ({
        id: item.id,
        service: item.service,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price
      }))
    })
  }

  const handleAddLineItem = async () => {
    if (!project || !newLineItem.service || !newLineItem.quantity || !newLineItem.unit || !newLineItem.unitPrice) return

    const { error } = await supabase
      .from('line_items')
      .insert({
        project_id: project.id,
        service: newLineItem.service,
        quantity: Number(newLineItem.quantity),
        unit: newLineItem.unit,
        unit_price: Number(newLineItem.unitPrice)
      })

    if (error) {
      console.error('Error adding line item:', error)
      return
    }

    setIsAddLineItemDialogOpen(false)
    setNewLineItem({ service: '', quantity: '', unit: '', unitPrice: '' })
    fetchProject()
  }

  const handleEditLineItem = async () => {
    if (!editingLineItem) return

    const { error } = await supabase
      .from('line_items')
      .update({
        service: editingLineItem.service,
        quantity: editingLineItem.quantity,
        unit: editingLineItem.unit,
        unit_price: editingLineItem.unitPrice
      })
      .eq('id', editingLineItem.id)

    if (error) {
      console.error('Error updating line item:', error)
      return
    }

    setIsEditLineItemDialogOpen(false)
    setEditingLineItem(null)
    fetchProject()
  }

  const handleDeleteLineItem = async () => {
    if (!lineItemToDelete) return

    const { error } = await supabase
      .from('line_items')
      .delete()
      .eq('id', lineItemToDelete.id)

    if (error) {
      console.error('Error deleting line item:', error)
      return
    }

    setIsDeleteLineItemDialogOpen(false)
    setLineItemToDelete(null)
    fetchProject()
  }

  const handleDuplicateLineItem = async (item: LineItem) => {
    if (!project) return

    const { error } = await supabase
      .from('line_items')
      .insert({
        project_id: project.id,
        service: `${item.service} (Copy)`,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice
      })

    if (error) {
      console.error('Error duplicating line item:', error)
      return
    }

    fetchProject()
  }

  if (!project) {
    return null
  }

  const totalAmount = project.lineItems.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  )

  return (
    <main className="p-8">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => router.push('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
              <p className="text-gray-500">General Contractor: {project.gc}</p>
              {project.contact && (
                <p className="text-gray-500">Contact: {project.contact}</p>
              )}
              {project.dueDate && (
                <p className="text-gray-500">Due Date: {project.dueDate}</p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium
                    ${project.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                      project.status === 'awarded' ? 'bg-green-100 text-green-800 border border-green-200' : 
                      'bg-red-100 text-red-800 border border-red-200'}`
                  }>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className={`text-2xl font-bold
                    ${project.status === 'pending' ? 'text-yellow-700' : 
                      project.status === 'awarded' ? 'text-green-700' : 
                      'text-red-700'}`
                  }>
                    ${totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Line Items</h2>
            <Dialog open={isAddLineItemDialogOpen} onOpenChange={setIsAddLineItemDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Line Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Line Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="service">Service</Label>
                    <Input
                      id="service"
                      value={newLineItem.service}
                      onChange={(e) => setNewLineItem({
                        ...newLineItem,
                        service: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newLineItem.quantity}
                      onChange={(e) => setNewLineItem({
                        ...newLineItem,
                        quantity: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newLineItem.unit}
                      onChange={(e) => setNewLineItem({
                        ...newLineItem,
                        unit: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={newLineItem.unitPrice}
                      onChange={(e) => setNewLineItem({
                        ...newLineItem,
                        unitPrice: e.target.value
                      })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddLineItemDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddLineItem}>
                      Add Line Item
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Service</TableHead>
                <TableHead className="w-[15%]">Quantity</TableHead>
                <TableHead className="w-[15%]">Unit</TableHead>
                <TableHead className="w-[15%]">Unit Price</TableHead>
                <TableHead className="w-[15%]">Total</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.lineItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.service}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>${item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    ${(item.quantity * item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDuplicateLineItem(item)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingLineItem(item)
                          setIsEditLineItemDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setLineItemToDelete(item)
                          setIsDeleteLineItemDialogOpen(true)
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

      <Dialog open={isEditLineItemDialogOpen} onOpenChange={setIsEditLineItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Line Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingLineItem && (
              <>
                <div>
                  <Label htmlFor="edit-service">Service</Label>
                  <Input
                    id="edit-service"
                    value={editingLineItem.service}
                    onChange={(e) => setEditingLineItem({
                      ...editingLineItem,
                      service: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingLineItem.quantity}
                    onChange={(e) => setEditingLineItem({
                      ...editingLineItem,
                      quantity: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={editingLineItem.unit}
                    onChange={(e) => setEditingLineItem({
                      ...editingLineItem,
                      unit: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unitPrice">Unit Price</Label>
                  <Input
                    id="edit-unitPrice"
                    type="number"
                    value={editingLineItem.unitPrice}
                    onChange={(e) => setEditingLineItem({
                      ...editingLineItem,
                      unitPrice: Number(e.target.value)
                    })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditLineItemDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditLineItem}>
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={isDeleteLineItemDialogOpen} 
        onOpenChange={setIsDeleteLineItemDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Line Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this line item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLineItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Line Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
} 