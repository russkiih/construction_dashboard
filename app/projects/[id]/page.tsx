'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Plus, ArrowLeft, Copy, Pencil, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Project, LineItem } from '@/types'
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

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [project, setProject] = useState<Project | null>(null)
  const [newLineItem, setNewLineItem] = useState({
    service: '',
    quantity: '',
    unit: '',
    unitPrice: ''
  })
  const [isAddLineItemDialogOpen, setIsAddLineItemDialogOpen] = useState(false)
  const [editingLineItem, setEditingLineItem] = useState<LineItem | null>(null)
  const [isEditLineItemDialogOpen, setIsEditLineItemDialogOpen] = useState(false)
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
      status: data.status,
      gc: data.gc,
      lineItems: data.line_items.map((item: any) => ({
        id: item.id,
        service: item.service,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price
      }))
    })
  }

  const addLineItem = async () => {
    if (!project) return

    const quantity = parseFloat(newLineItem.quantity) || 0
    const unitPrice = parseFloat(newLineItem.unitPrice) || 0

    const { error } = await supabase
      .from('line_items')
      .insert({
        project_id: project.id,
        service: newLineItem.service,
        quantity: quantity,
        unit: newLineItem.unit,
        unit_price: unitPrice
      })

    if (error) {
      console.error('Error adding line item:', error)
      return
    }

    fetchProject()
    setNewLineItem({
      service: '',
      quantity: '',
      unit: '',
      unitPrice: ''
    })
    setIsAddLineItemDialogOpen(false)
  }

  const duplicateLineItem = async (item: LineItem) => {
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

  const updateLineItem = async () => {
    if (!editingLineItem || !project) return

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

    fetchProject()
    setEditingLineItem(null)
    setIsEditLineItemDialogOpen(false)
  }

  const deleteLineItem = async (itemId: string) => {
    if (!project) return

    const { error } = await supabase
      .from('line_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Error deleting line item:', error)
      return
    }

    fetchProject()
    setLineItemToDelete(null)
  }

  if (!project) return null

  return (
    <div className="p-8">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2" />
        Back
      </Button>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-500">GC: {project.gc}</p>
            <p className="text-gray-500">Status: {project.status}</p>
          </div>
          <Dialog open={isAddLineItemDialogOpen} onOpenChange={setIsAddLineItemDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddLineItemDialogOpen(true)}>
                <Plus className="mr-2" />
                Add Line Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Line Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Service</Label>
                  <Input
                    value={newLineItem.service}
                    onChange={(e) => setNewLineItem({
                      ...newLineItem,
                      service: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newLineItem.quantity}
                    onChange={(e) => setNewLineItem({
                      ...newLineItem,
                      quantity: e.target.value
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={newLineItem.unit}
                    onChange={(e) => setNewLineItem({
                      ...newLineItem,
                      unit: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    value={newLineItem.unitPrice}
                    onChange={(e) => setNewLineItem({
                      ...newLineItem,
                      unitPrice: e.target.value
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={addLineItem}
                  disabled={!newLineItem.service || !newLineItem.quantity || !newLineItem.unit || !newLineItem.unitPrice}
                >
                  Add Line Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Line Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Service</TableHead>
                <TableHead className="w-[15%]">Quantity</TableHead>
                <TableHead className="w-[15%]">Unit</TableHead>
                <TableHead className="w-[15%]">Unit Price</TableHead>
                <TableHead className="w-[15%]">Total</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.lineItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.service}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>${item.unitPrice}</TableCell>
                  <TableCell>
                    ${(item.quantity * item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateLineItem(item)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingLineItem(item)
                          setIsEditLineItemDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLineItemToDelete(item)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell colSpan={4} className="text-right">Total:</TableCell>
                <TableCell>
                  ${project.lineItems.reduce(
                    (sum, item) => sum + item.quantity * item.unitPrice,
                    0
                  ).toLocaleString()}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
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
            <div>
              <Label>Service</Label>
              <Input
                value={editingLineItem?.service || ''}
                onChange={(e) => setEditingLineItem(prev => 
                  prev ? { ...prev, service: e.target.value } : null
                )}
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={editingLineItem?.quantity || ''}
                onChange={(e) => setEditingLineItem(prev => 
                  prev ? { ...prev, quantity: parseFloat(e.target.value) } : null
                )}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                value={editingLineItem?.unit || ''}
                onChange={(e) => setEditingLineItem(prev => 
                  prev ? { ...prev, unit: e.target.value } : null
                )}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                value={editingLineItem?.unitPrice || ''}
                onChange={(e) => setEditingLineItem(prev => 
                  prev ? { ...prev, unitPrice: parseFloat(e.target.value) } : null
                )}
                min="0"
                step="0.01"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={updateLineItem}
              disabled={!editingLineItem?.service || !editingLineItem?.quantity || !editingLineItem?.unit || !editingLineItem?.unitPrice}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!lineItemToDelete} 
        onOpenChange={(open) => !open && setLineItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the line item &quot;{lineItemToDelete?.service}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => lineItemToDelete && deleteLineItem(lineItemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 