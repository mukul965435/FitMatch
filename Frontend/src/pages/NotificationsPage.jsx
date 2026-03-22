import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCheck, FiCheckSquare } from 'react-icons/fi'
import axiosInstance from '../utils/axios'
import useSocketStore from '../store/socketStore'
import toast from 'react-hot-toast'

const notifIcons = {
  match_request: '🤝',
  match_accepted: '🎉',
  new_message: '💬',
  new_rating: '⭐',
  activity: '💪',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { socket } = useSocketStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('notification', (notif) => {
      setNotifications(prev => [{
        ...notif, _id: Date.now(), isRead: false, createdAt: new Date()
      }, ...prev])
      setUnreadCount(prev => prev + 1)
      toast(notif.message, { icon: notifIcons[notif.type] || '🔔' })
    })
    return () => socket.off('notification')
  }, [socket])

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications')
      setNotifications(data.data)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const markRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await axiosInstance.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    toast.success('All marked as read')
  }

  const handleClick = (notif) => {
    if (!notif.isRead) markRead(notif._id)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiBell className="text-primary-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="badge badge-orange text-sm">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stay up to date</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost flex items-center gap-2 text-sm py-2">
            <FiCheckSquare /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 flex gap-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`card p-4 flex items-start gap-4 cursor-pointer hover:border-primary-500/20 transition-all ${
                  !notif.isRead ? 'border-primary-500/20 bg-primary-500/5' : ''
                }`}
                onClick={() => handleClick(notif)}
              >
                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl shrink-0">
                  {notifIcons[notif.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {notif.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
