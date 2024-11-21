export type LineItem = {
  id: string
  service: string
  quantity: number
  unit: string
  unitPrice: number
}

export type Project = {
  id: string
  name: string
  gc: string
  contact: string
  dueDate: string
  status: 'pending' | 'awarded' | 'dead'
  lineItems: LineItem[]
} 