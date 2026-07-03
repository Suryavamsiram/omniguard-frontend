import { useEffect, useState } from 'react'
import axios from 'axios'

interface WorkflowItem {
  id: number
  name: string
  workflow_type: string
  is_active: boolean
  created_at: string
}

function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await axios.get('/api/v1/workflows?organization_id=1')
        setWorkflows(response.data.data)
      } catch (err) {
        setError('Unable to load workflows')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkflows()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2>Workflows</h2>
        <button className="button">Start Workflow</button>
      </div>

      {loading ? (
        <div>Loading workflows...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Active</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.workflow_type}</td>
                  <td>{item.is_active ? 'Yes' : 'No'}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default WorkflowsPage
