import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCompass, FiUsers, FiMessageSquare, FiUser,
  FiBell, FiActivity, FiLogOut, FiZap,
} from 'react-icons/fi'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const navItems = [
  { to: '/discover', icon: FiCompass, label: 'Discover' },
  { to: '/matches', icon: FiUsers, label: 'Buddies' },
  { to: '/chat', icon: FiMessageSquare, label: 'Messages' },
  { to: '/feed', icon: FiActivity, label: 'Feed' },
  { to: '/notifications', icon: FiBell, label: 'Alerts' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { totalUnread, fetchConversations } = useChatStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchConversations()
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-dark-600/50 bg-dark-800/40 backdrop-blur-sm p-6 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <FiZap className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">FitMatch</h1>
          <p className="text-gray-500 text-xs">Find your gym buddy</p>
        </div>
      </div>

      {/* User mini profile */}
      <div className="glass p-3 flex items-center gap-3 mb-2">
        <div className="relative">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=f97316&color=fff`}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 online-dot" />
        </div>
        <div className="overflow-hidden">
          <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
          <p className="text-gray-500 text-xs capitalize">{user?.fitnessLevel || 'Getting started'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <div className="relative">
              <Icon className="text-lg" />
              {label === 'Messages' && totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ x: 4 }}
        className="sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-auto"
      >
        <FiLogOut className="text-lg" />
        <span>Logout</span>
      </motion.button>
    </aside>
  )
}
