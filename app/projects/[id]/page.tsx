'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Plus, ArrowLeft } from 'lucide-react'
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
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
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Service</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Unit</th>
                <th className="pb-2">Unit Price</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {project.lineItems.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.service}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">{item.unit}</td>
                  <td className="py-2">${item.unitPrice}</td>
                  <td className="py-2">
                    ${(item.quantity * item.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={4} className="py-2 text-right">Total:</td>
                <td className="py-2">
                  ${project.lineItems.reduce(
                    (sum, item) => sum + item.quantity * item.unitPrice,
                    0
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 