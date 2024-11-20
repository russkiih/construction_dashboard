'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/supabase/database.types'
import { Project, LineItem } from '@/types'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import AccountHeader from '@/components/account/account-header'

export default function ConstructionDashboard() {
  const supabase = useSupabaseClient<Database>()
  const session = useSession()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects()
    }
  }, [session])

  const fetchProjects = async () => {
    if (!session?.user?.id) return

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

    // Transform the data to match Project type
    const formattedProjects: Project[] = data.map(project => ({
      id: project.id,
      name: project.name,
      gc: project.gc,
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

  const addTestProject = async () => {
    if (!session?.user?.id) return

    // Insert a test project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        gc: 'Test Contractor',
        status: 'pending',
        user_id: session.user.id
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error adding project:', projectError)
      return
    }

    // Insert a test line item
    if (project) {
      const { error: lineItemError } = await supabase
        .from('line_items')
        .insert({
          project_id: project.id,
          service: 'Test Service',
          quantity: 1,
          unit: 'hours',
          unit_price: 100
        })

      if (lineItemError) {
        console.error('Error adding line item:', lineItemError)
      }
    }

    // Refresh projects
    fetchProjects()
  }

  return (
    <div className="p-4">
      <AccountHeader />
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Construction Dashboard</h1>
        
        <div className="mb-4">
          <Button onClick={addTestProject}>
            Add Test Project
          </Button>
        </div>

        <div className="space-y-4">
          {projects.map(project => (
            <Card key={project.id} className="p-4">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p>Status: {project.status}</p>
              <h3 className="font-medium mt-2">Line Items:</h3>
              <ul className="list-disc pl-5">
                {project.lineItems.map(item => (
                  <li key={item.id}>
                    {item.service} - {item.quantity} {item.unit} @ ${item.unitPrice}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Logged in as: {session?.user?.email}
          </p>
          <Button 
            variant="outline" 
            onClick={() => supabase.auth.signOut()}
            className="mt-2"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
} 