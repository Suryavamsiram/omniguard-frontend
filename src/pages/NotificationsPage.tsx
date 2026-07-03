import { useEffect, useState } from 'react'
import axios from 'axios'

interface NotificationItem {
  id: number
  title: string
  message: string
  notification_type: string
  priority: string
  is_read: boolean
  created_at: string
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/v1/notifications?organization_id=1')
        setNotifications(response.data.data)
      } catch (err) {
        setError('Unable to load notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2>Notifications</h2>
        <button className="button secondary">Mark all read</button>
      </div>

      {loading ? (
        <div>Loading notifications...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Read</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.notification_type}</td>
                  <td>{item.priority}</td>
                  <td>{item.is_read ? 'Yes' : 'No'}</td>
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

export default NotificationsPage
