import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiMessageSquare, FiUserX, FiCheck, FiX } from 'react-icons/fi'
import axiosInstance from '../utils/axios'
import toast from 'react-hot-toast'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('buddies')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [matchRes, reqRes] = await Promise.all([
        axiosInstance.get('/matches'),
        axiosInstance.get('/matches/requests'),
      ])
      setMatches(matchRes.data.data)
      setRequests(reqRes.data.data)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (matchId) => {
    try {
      await axiosInstance.put(`/matches/accept/${matchId}`)
      toast.success('You\'re now gym buddies! 🎉')
      fetchData()
    } catch (err) {
      toast.error('Failed to accept request')
    }
  }

  const handleReject = async (matchId) => {
    try {
      await axiosInstance.put(`/matches/reject/${matchId}`)
      setRequests(prev => prev.filter(r => r._id !== matchId))
    } catch (err) {
      toast.error('Failed to reject request')
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this gym buddy?')) return
    try {
      await axiosInstance.delete(`/matches/${userId}`)
      setMatches(prev => prev.filter(m => m._id !== userId))
      toast.success('Buddy removed')
    } catch (err) {
      toast.error('Failed to remove buddy')
    }
  }

  const levelColors = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiUsers className="text-primary-500" />
          Gym Buddies
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your workout connections</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-800 p-1 rounded-xl w-fit">
        {[
          { id: 'buddies', label: `My Buddies (${matches.length})` },
          { id: 'requests', label: `Requests (${requests.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="skeleton w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'buddies' ? (
        matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-white mb-2">No gym buddies yet</h3>
            <p className="text-gray-400 mb-6">Discover users and send connection requests</p>
            <button onClick={() => navigate('/discover')} className="btn-primary">
              Discover Buddies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(buddy => (
              <motion.div
                key={buddy._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 flex items-center gap-4 hover:border-primary-500/20 transition-all cursor-pointer group"
                onClick={() => navigate(`/profile/${buddy._id}`)}
              >
                <div className="relative">
                  <img
                    src={buddy.profilePicture || `https://ui-avatars.com/api/?name=${buddy.name}&background=f97316&color=fff`}
                    alt={buddy.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {buddy.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 online-dot" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">{buddy.name}</h3>
                  <p className={`text-sm capitalize ${levelColors[buddy.fitnessLevel] || 'text-gray-400'}`}>
                    {buddy.fitnessLevel}
                  </p>
                  {buddy.gymName && (
                    <p className="text-gray-500 text-xs truncate">{buddy.gymName}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/chat/${buddy._id}`) }}
                    className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
                  >
                    <FiMessageSquare />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleRemove(buddy._id) }}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <FiUserX />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📬</div>
            <h3 className="text-xl font-bold text-white mb-2">No pending requests</h3>
            <p className="text-gray-400">When someone sends you a request, it'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-5 flex items-center gap-4"
              >
                <img
                  src={req.sender?.profilePicture || `https://ui-avatars.com/api/?name=${req.sender?.name}&background=f97316&color=fff`}
                  alt={req.sender?.name}
                  className="w-16 h-16 rounded-full object-cover cursor-pointer"
                  onClick={() => navigate(`/profile/${req.sender?._id}`)}
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold cursor-pointer hover:text-primary-400"
                    onClick={() => navigate(`/profile/${req.sender?._id}`)}>
                    {req.sender?.name}
                  </h3>
                  <p className="text-gray-400 text-sm capitalize">{req.sender?.fitnessLevel} • {req.sender?.gymName}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {req.sender?.fitnessGoals?.slice(0, 2).map(g => (
                      <span key={g} className="badge badge-orange text-xs capitalize">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    title="Accept"
                  >
                    <FiCheck className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Reject"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
