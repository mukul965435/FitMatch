import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUser, FiMapPin, FiClock, FiTarget, FiEdit2,
  FiStar, FiCalendar, FiAward,
} from 'react-icons/fi'
import useAuthStore from '../store/authStore'

const goalColors = {
  'fat loss': 'badge-green',
  'muscle gain': 'badge-orange',
  strength: 'badge-blue',
  endurance: 'badge-purple',
  flexibility: 'badge-blue',
  'general fitness': 'badge-green',
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!user) return null

  const completionFields = ['age', 'bio', 'gymName', 'fitnessLevel', 'profilePicture', 'workoutDays', 'locationName']
  const completed = completionFields.filter(f => {
    const val = user[f]
    if (Array.isArray(val)) return val.length > 0
    return !!val
  }).length
  const completionPct = Math.round((completed / completionFields.length) * 100)

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-800 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff&size=200`}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-dark-800 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 online-dot w-4 h-4" />
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="btn-ghost flex items-center gap-2 text-sm py-2"
            >
              <FiEdit2 />
              Edit Profile
            </button>
          </div>

          {/* Name & badge */}
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <span className={`badge text-xs capitalize px-2 py-0.5 ${
              user.fitnessLevel === 'advanced' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : user.fitnessLevel === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {user.fitnessLevel || 'beginner'}
            </span>
          </div>

          {user.age && (
            <p className="text-gray-400 text-sm mb-3">{user.age} years old • {user.gender}</p>
          )}

          {user.bio && (
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{user.bio}</p>
          )}

          {/* Stats row */}
          <div className="flex gap-6 text-center border-t border-dark-600 pt-4">
            <div>
              <div className="text-xl font-bold text-white">{user.matches?.length || 0}</div>
              <div className="text-gray-500 text-xs">Buddies</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white flex items-center gap-1 justify-center">
                <FiStar className="text-primary-400 text-base" />
                {user.averageRating || '—'}
              </div>
              <div className="text-gray-500 text-xs">Rating</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{user.activities?.length || 0}</div>
              <div className="text-gray-500 text-xs">Activities</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Completion */}
      {completionPct < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-4 border border-primary-500/20"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">Profile Completion</span>
            <span className="text-primary-400 font-bold text-sm">{completionPct}%</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
            />
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Complete your profile to get better matches!{' '}
            <button onClick={() => navigate('/profile/edit')} className="text-primary-400 hover:underline">
              Update now
            </button>
          </p>
        </motion.div>
      )}

      {/* Gym Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FiMapPin className="text-primary-400" /> Gym & Location
          </h3>
          <p className="text-gray-300 text-sm">{user.gymName || <span className="text-gray-500">Not set</span>}</p>
          <p className="text-gray-400 text-sm">{user.locationName || <span className="text-gray-500">Location not set</span>}</p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FiClock className="text-primary-400" /> Schedule
          </h3>
          <p className="text-gray-300 text-sm capitalize">{user.workoutTime || <span className="text-gray-500">Not set</span>}</p>
          <div className="flex flex-wrap gap-1.5">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day, i) => {
              const fullDay = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'][i]
              const active = user.workoutDays?.includes(fullDay)
              return (
                <span key={day} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
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
      {user.fitnessGoals?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <FiTarget className="text-primary-400" /> Fitness Goals
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.fitnessGoals.map(goal => (
              <span key={goal} className={`badge ${goalColors[goal] || 'badge-blue'} capitalize text-sm py-2 px-4`}>
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {user.activities?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <FiAward className="text-primary-400" /> Recent Activities
          </h3>
          <div className="space-y-2">
            {user.activities.slice(0, 5).map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-dark-700/50 last:border-0">
                <span className="text-primary-500 mt-0.5">💪</span>
                <div>
                  <span className="text-white font-medium capitalize">{act.type}</span>
                  <span className="text-gray-400 ml-2">{act.description}</span>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
