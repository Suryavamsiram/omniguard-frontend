import { useState } from 'react'
import axios from 'axios'

interface SearchResult {
  document_id: number
  content_snippet: string
  similarity_score: number
  embedding_model: string
}

function SearchPage() {
  const [query, setQuery] = useState('password policy')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSearch = async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await axios.get('/api/v1/search/semantic', {
        params: { organization_id: 1, query, top_k: 10, similarity_threshold: 0.6 },
      })
      setResults(response.data.results)
    } catch (err) {
      setError('Unable to run semantic search')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Semantic Search</h2>
          <p>Search documents by meaning, not just keywords.</p>
        </div>
        <button className="button" onClick={runSearch}>Run Search</button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <label>
          Query
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 12, border: '1px solid #1f2937', background: '#0f172a', color: '#e2e8f0' }}
          />
        </label>
      </div>

      {loading ? (
        <div>Searching...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Snippet</th>
                <th>Similarity</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index}>
                  <td>{item.document_id}</td>
                  <td>{item.content_snippet}</td>
                  <td>{item.similarity_score.toFixed(3)}</td>
                  <td>{item.embedding_model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SearchPage
