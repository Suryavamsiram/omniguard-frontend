import { useEffect, useState } from 'react'
import axios from 'axios'

interface Metric {
  metric_name: string
  value: number
  target: number
  unit: string
}

interface DashboardMetrics {
  coverage: number
  adoption: number
  total_findings: number
  open_findings: number
  critical_findings: number
}

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const baseUrl = '/api/v1/analytics/dashboard/executive?organization_id=1'
        const response = await axios.get(baseUrl)
        setMetrics(response.data.metrics)
      } catch (err) {
        setError('Unable to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Executive Dashboard</h2>
          <p>Governance metrics and policy health summary.</p>
        </div>
      </div>

      {loading ? (
        <div>Loading metrics...</div>
      ) : error ? (
        <div>{error}</div>
      ) : metrics ? (
        <div className="card-grid">
          <div className="card">
            <h3>Coverage</h3>
            <p className="metric">{metrics.coverage.toFixed(1)}%</p>
          </div>
          <div className="card">
            <h3>Adoption</h3>
            <p className="metric">{metrics.adoption.toFixed(1)}%</p>
          </div>
          <div className="card">
            <h3>Total Findings</h3>
            <p className="metric">{metrics.total_findings}</p>
          </div>
          <div className="card">
            <h3>Open Findings</h3>
            <p className="metric">{metrics.open_findings}</p>
          </div>
          <div className="card">
            <h3>Critical Findings</h3>
            <p className="metric">{metrics.critical_findings}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardPage
