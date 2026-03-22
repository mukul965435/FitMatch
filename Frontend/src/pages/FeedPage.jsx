import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiActivity, FiPlus, FiX } from 'react-icons/fi'
import axiosInstance from '../utils/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const activityTypes = [
  'chest day', 'back day', 'leg day', 'shoulder day', 'arm day',
  'cardio', 'full body', 'hiit', 'yoga', 'stretching', 'sports'
]

export default function FeedPage() {
  const [feed, setFeed] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogger, setShowLogger] = useState(false)
  const [newActivity, setNewActivity] = useState({ type: 'chest day', description: '' })
  const { user, refreshUser } = useAuthStore()

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const { data } = await axiosInstance.get('/users/feed')
      setFeed(data.data)
    } catch (err) {
      toast.error('Failed to load feed')
    } finally {
      setIsLoading(false)
    }
  }

  const logActivity = async () => {
    if (!newActivity.description.trim()) return toast.error('Please add a description')
    try {
      await axiosInstance.post('/users/activity', newActivity)
      toast.success('Activity logged! 💪')
      setShowLogger(false)
      setNewActivity({ type: 'chest day', description: '' })
      fetchFeed()
      refreshUser()
    } catch (err) {
      toast.error('Failed to log activity')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiActivity className="text-primary-500" />
            Activity Feed
          </h1>
          <p className="text-gray-400 text-sm mt-1">What's your crew been up to?</p>
        </div>
        <button
          onClick={() => setShowLogger(!showLogger)}
          className="btn-primary flex items-center gap-2 py-2 text-sm"
        >
          <FiPlus /> Log Activity
        </button>
      </div>

      {/* Activity Logger */}
      {showLogger && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 border border-primary-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Log Today's Workout</h3>
            <button onClick={() => setShowLogger(false)} className="text-gray-500 hover:text-white">
              <FiX />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Workout Type</label>
              <div className="flex flex-wrap gap-2">
                {activityTypes.map(t => (
                  <button key={t}
                    onClick={() => setNewActivity(p => ({...p, type: t}))}
                    className={`badge capitalize py-1.5 px-3 cursor-pointer transition-all ${
                      newActivity.type === t ? 'badge-orange' : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={newActivity.description}
                onChange={e => setNewActivity(p => ({...p, description: e.target.value}))}
                placeholder="e.g. Hit a new PR on bench press: 100kg! Feeling strong 💪"
                rows={3}
                className="input resize-none"
              />
            </div>

            <button onClick={logActivity} className="btn-primary py-2 px-6 text-sm">
              Post Activity
            </button>
          </div>
        </motion.div>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏋️</div>
          <h3 className="text-xl font-bold text-white mb-2">Feed is empty</h3>
          <p className="text-gray-400">Connect with buddies to see their activities, or log your own!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item, i) => {
            const isMe = item.user?._id === user?._id
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 flex items-start gap-4"
              >
                <img
                  src={item.user?.profilePicture || `https://ui-avatars.com/api/?name=${item.user?.name}&background=f97316&color=fff`}
                  alt={item.user?.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">
                      {isMe ? 'You' : item.user?.name}
                    </span>
                    <span className="badge badge-orange capitalize text-xs py-0.5">{item.type}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-2xl">💪</span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
