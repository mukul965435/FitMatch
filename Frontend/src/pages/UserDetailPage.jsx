import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft, FiMapPin, FiClock, FiTarget, FiStar,
  FiUserPlus, FiMessageSquare, FiAward,
} from 'react-icons/fi'
import axiosInstance from '../utils/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const goalColors = {
  'fat loss': 'badge-green',
  'muscle gain': 'badge-orange',
  strength: 'badge-blue',
  endurance: 'badge-purple',
  flexibility: 'badge-blue',
  'general fitness': 'badge-green',
}

export default function UserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  const isMatch = currentUser?.matches?.includes(userId)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get(`/users/${userId}`)
        setProfile(data.data)
      } catch (err) {
        toast.error('User not found')
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  const handleConnect = async () => {
    try {
      await axiosInstance.post(`/matches/request/${userId}`)
      setRequestSent(true)
      toast.success('Connection request sent! 🚀')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleRate = async () => {
    if (!rating) return toast.error('Please select a rating')
    try {
      await axiosInstance.post(`/users/${userId}/rate`, { rating, review })
      toast.success('Rating submitted! ⭐')
      setShowRating(false)
      setProfile(p => ({ ...p, averageRating: rating }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="h-28 bg-gradient-to-r from-primary-700 to-purple-800" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <img
                src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.name}&background=f97316&color=fff&size=200`}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-dark-800 shadow-xl"
              />
              {profile.isOnline && <span className="absolute -bottom-1 -right-1 online-dot w-4 h-4" />}
            </div>
            <div className="flex gap-2">
              {isMatch ? (
                <>
                  <button
                    onClick={() => navigate(`/chat/${userId}`)}
                    className="btn-primary flex items-center gap-2 py-2 text-sm"
                  >
                    <FiMessageSquare /> Message
                  </button>
                  <button
                    onClick={() => setShowRating(!showRating)}
                    className="btn-ghost flex items-center gap-2 py-2 text-sm"
                  >
                    <FiStar /> Rate
                  </button>
                </>
              ) : requestSent ? (
                <button disabled className="btn-ghost py-2 text-sm opacity-50">Request Sent</button>
              ) : (
                <button onClick={handleConnect} className="btn-primary flex items-center gap-2 py-2 text-sm">
                  <FiUserPlus /> Connect
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white">{profile.name}</h1>
            <span className="badge badge-orange capitalize text-xs">{profile.fitnessLevel}</span>
          </div>
          {profile.age && <p className="text-gray-400 text-sm mb-3">{profile.age} years • {profile.gender}</p>}
          {profile.bio && <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>}

          {/* Stats */}
          <div className="flex gap-6 text-center border-t border-dark-600 pt-4 mt-4">
            <div>
              <div className="text-xl font-bold text-white">{profile.matches?.length || 0}</div>
              <div className="text-gray-500 text-xs">Buddies</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white flex items-center gap-1 justify-center">
                <FiStar className="text-primary-400 text-base" />
                {profile.averageRating || '—'}
              </div>
              <div className="text-gray-500 text-xs">Rating ({profile.totalRatings || 0})</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rating form */}
      {showRating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 border border-primary-500/20"
        >
          <h3 className="font-semibold text-white mb-3">Rate your workout session</h3>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}
                className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                ★
              </button>
            ))}
          </div>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Optional review..."
            rows={2}
            className="input resize-none mb-3"
          />
          <button onClick={handleRate} className="btn-primary py-2 px-6 text-sm">Submit Rating</button>
        </motion.div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <FiMapPin className="text-primary-400" /> Gym & Location
          </h3>
          <p className="text-gray-300 text-sm">{profile.gymName || <span className="text-gray-500">Not set</span>}</p>
          <p className="text-gray-400 text-sm">{profile.locationName || ''}</p>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <FiClock className="text-primary-400" /> Schedule
          </h3>
          <p className="text-gray-300 text-sm capitalize">{profile.workoutTime}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {['mon','tue','wed','thu','fri','sat','sun'].map((day, i) => {
              const full = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'][i]
              const active = profile.workoutDays?.includes(full)
              return (
                <span key={day} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium ${
                  active ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700 text-gray-600'
                }`}>
                  {day.charAt(0).toUpperCase()}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Goals */}
      {profile.fitnessGoals?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <FiTarget className="text-primary-400" /> Fitness Goals
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.fitnessGoals.map(g => (
              <span key={g} className={`badge ${goalColors[g] || 'badge-blue'} capitalize py-2 px-4`}>{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Ratings */}
      {profile.ratings?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <FiAward className="text-primary-400" /> Reviews
          </h3>
          <div className="space-y-3">
            {profile.ratings.slice(0, 5).map((r, i) => (
              <div key={i} className="border-b border-dark-700/50 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400">{'★'.repeat(r.rating)}<span className="text-gray-600">{'★'.repeat(5 - r.rating)}</span></span>
                </div>
                {r.review && <p className="text-gray-400 text-sm">{r.review}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
