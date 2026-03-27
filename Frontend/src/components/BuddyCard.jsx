import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiClock, FiTarget, FiStar, FiUserPlus, FiMessageSquare, FiZap } from 'react-icons/fi'

const goalColors = {
  'fat loss': 'badge-green',
  'muscle gain': 'badge-orange',
  strength: 'badge-blue',
  endurance: 'badge-purple',
  flexibility: 'badge-blue',
  'general fitness': 'badge-green',
}

const levelColors = {
  beginner: 'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-red-400 bg-red-400/10',
}

export default function BuddyCard({ user, onConnect, onMessage, requestSent, isMatch }) {
  const navigate = useNavigate()
  const score = user.compatibilityScore || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="buddy-card group"
    >
      {/* Header with image */}
      <div
        className="relative h-52 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/profile/${user._id}`)}
      >
        <img
          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff&size=400`}
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />

        {/* Compatibility Score Badge */}
        <div className="absolute top-3 right-3">
          <div className="glass px-3 py-1.5 flex items-center gap-1.5">
            <FiStar className="text-primary-400 text-sm" />
            <span className="text-white font-bold text-sm">{score}%</span>
          </div>
        </div>

        {/* Online indicator */}
        {user.isOnline && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 glass px-2 py-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Online</span>
          </div>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-bold text-xl leading-tight">{user.name}</h3>
          <p className="text-gray-300 text-sm">{user.age ? `${user.age} years` : ''}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Level & Gym */}
        <div className="flex items-center justify-between">
          <span className={`badge ${levelColors[user.fitnessLevel] || 'text-gray-400 bg-gray-400/10'} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>
            {user.fitnessLevel}
          </span>
          {user.gymName && (
            <span className="text-gray-400 text-xs flex items-center gap-1 truncate max-w-[140px]">
              <FiMapPin className="shrink-0" />
              {user.gymName}
            </span>
          )}
        </div>

        {/* Goals */}
        {user.fitnessGoals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.fitnessGoals.slice(0, 3).map((goal) => (
              <span key={goal} className={`badge ${goalColors[goal] || 'badge-blue'} capitalize text-xs`}>
                <FiTarget className="text-xs" />
                {goal}
              </span>
            ))}
          </div>
        )}

        {/* Workout time */}
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <FiClock className="text-primary-400" />
          <span className="capitalize">{user.workoutTime} workouts</span>
        </div>

        {/* Bio snippet */}
        {user.bio && (
          <p className="text-gray-400 text-xs line-clamp-2">{user.bio}</p>
        )}

        {/* Compatibility bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Compatibility</span>
            <span className="text-xs text-primary-400 font-semibold">{score}%</span>
          </div>
          <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
            />
          </div>
          {/* Match Insight */}
          <div className="mt-3 flex items-start gap-1.5 p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
            <FiZap className="text-primary-400 text-xs shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-tight">
              <span className="text-primary-400 font-bold uppercase tracking-wider">Insight:</span>{' '}
              {score > 80 ? 'Perfect match! ' : score > 50 ? 'Strong potential. ' : 'Worth checking. '}
              Great for {user.fitnessGoals?.[0] || 'working out'} together.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isMatch ? (
            <button
              onClick={() => onMessage(user)}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              <FiMessageSquare />
              Message
            </button>
          ) : requestSent ? (
            <button disabled className="btn-ghost flex-1 py-2.5 text-sm opacity-50 cursor-not-allowed">
              Request Sent
            </button>
          ) : (
            <>
              <button
                onClick={() => onConnect(user._id)}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <FiUserPlus />
                Connect
              </button>
              <button
                onClick={() => navigate(`/profile/${user._id}`)}
                className="btn-ghost px-3 py-2.5 text-sm"
              >
                View
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
