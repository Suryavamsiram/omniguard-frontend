import { useEffect, useState } from 'react'
import axios from 'axios'

interface DocumentItem {
  id: number
  title: string
  document_type: string
  category: string
  is_approved: boolean
  created_at: string
}

function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/v1/documents?organization_id=1')
        setDocuments(response.data.data)
      } catch (err) {
        setError('Unable to load documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2>Documents</h2>
        <button className="button">Upload Document</button>
      </div>

      {loading ? (
        <div>Loading documents...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Approved</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.document_type}</td>
                  <td>{doc.category || '—'}</td>
                  <td>{doc.is_approved ? 'Yes' : 'No'}</td>
                  <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DocumentsPage
