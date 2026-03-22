import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'
import { motion } from 'framer-motion'
import { FiFilter, FiCompass, FiX } from 'react-icons/fi'
import axiosInstance from '../utils/axios'
import useAuthStore from '../store/authStore'
import BuddyCard from '../components/BuddyCard'
import SkeletonCard from '../components/SkeletonCard'
import toast from 'react-hot-toast'

const fitnessLevels = ['beginner', 'intermediate', 'advanced']
const workoutTimes = ['early morning', 'morning', 'afternoon', 'evening', 'night', 'flexible']
const goals = ['fat loss', 'muscle gain', 'strength', 'endurance', 'flexibility', 'general fitness']
const distances = [5, 10, 25, 50]

export default function DiscoverPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [sentRequests, setSentRequests] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    fitnessLevel: '',
    workoutTime: '',
    fitnessGoals: '',
    maxDistance: '',
    gym: '',
  })

  const fetchUsers = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 9 })
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })

      const { data } = await axiosInstance.get(`/users/discover?${params}`)
      const newUsers = data.data

      if (reset || pageNum === 1) {
        setUsers(newUsers)
      } else {
        setUsers((prev) => [...prev, ...newUsers])
      }

      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(pageNum + 1)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    setIsLoading(true)
    setPage(1)
    fetchUsers(1, true)
  }, [filters])

  const handleConnect = async (receiverId) => {
    try {
      await axiosInstance.post(`/matches/request/${receiverId}`)
      setSentRequests((prev) => new Set([...prev, receiverId]))
      toast.success('Connection request sent! 🚀')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleMessage = (user) => {
    navigate(`/chat/${user._id}`)
  }

  const applyFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value }))
  }

  const clearFilters = () => {
    setFilters({ fitnessLevel: '', workoutTime: '', fitnessGoals: '', maxDistance: '', gym: '' })
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiCompass className="text-primary-500" />
            Discover Buddies
          </h1>
          <p className="text-gray-400 text-sm mt-1">Find your perfect workout partner</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative btn-ghost flex items-center gap-2 text-sm py-2 ${showFilters ? 'border-primary-500/50' : ''}`}
        >
          <FiFilter />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Filter Buddies</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-primary-400 flex items-center gap-1 hover:text-primary-300">
                <FiX /> Clear all
              </button>
            )}
          </div>

          {/* Fitness Level */}
          <div>
            <p className="label">Fitness Level</p>
            <div className="flex flex-wrap gap-2">
              {fitnessLevels.map(l => (
                <button
                  key={l}
                  onClick={() => applyFilter('fitnessLevel', l)}
                  className={`badge capitalize py-1.5 px-3 cursor-pointer transition-all ${
                    filters.fitnessLevel === l
                      ? 'badge-orange border-primary-500'
                      : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Workout Time */}
          <div>
            <p className="label">Workout Time</p>
            <div className="flex flex-wrap gap-2">
              {workoutTimes.map(t => (
                <button
                  key={t}
                  onClick={() => applyFilter('workoutTime', t)}
                  className={`badge capitalize py-1.5 px-3 cursor-pointer transition-all ${
                    filters.workoutTime === t
                      ? 'badge-orange'
                      : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <p className="label">Fitness Goal</p>
            <div className="flex flex-wrap gap-2">
              {goals.map(g => (
                <button
                  key={g}
                  onClick={() => applyFilter('fitnessGoals', g)}
                  className={`badge capitalize py-1.5 px-3 cursor-pointer transition-all ${
                    filters.fitnessGoals === g
                      ? 'badge-orange'
                      : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Distance & Gym */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Max Distance (km)</p>
              <div className="flex flex-wrap gap-2">
                {distances.map(d => (
                  <button
                    key={d}
                    onClick={() => applyFilter('maxDistance', d.toString())}
                    className={`badge py-1.5 px-3 cursor-pointer transition-all ${
                      filters.maxDistance === d.toString()
                        ? 'badge-orange'
                        : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                    }`}
                  >
                    {d}km
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Gym Name</p>
              <input
                type="text"
                placeholder="Search gym..."
                value={filters.gym}
                onChange={e => setFilters(prev => ({ ...prev, gym: e.target.value }))}
                className="input text-sm py-2"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏋️</div>
          <h3 className="text-xl font-bold text-white mb-2">No buddies found</h3>
          <p className="text-gray-400">Try adjusting your filters or location</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={users.length}
          next={() => fetchUsers(page)}
          hasMore={hasMore}
          loader={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 py-8">You've seen everyone — check back later!</p>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map((u) => (
              <BuddyCard
                key={u._id}
                user={u}
                onConnect={handleConnect}
                onMessage={handleMessage}
                requestSent={sentRequests.has(u._id)}
                isMatch={user?.matches?.includes(u._id)}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}
