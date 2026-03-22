import { NavLink } from 'react-router-dom'
import { FiCompass, FiUsers, FiMessageSquare, FiUser, FiBell } from 'react-icons/fi'
import useChatStore from '../store/chatStore'

const navItems = [
  { to: '/discover', icon: FiCompass },
  { to: '/matches', icon: FiUsers },
  { to: '/chat', icon: FiMessageSquare },
  { to: '/notifications', icon: FiBell },
  { to: '/profile', icon: FiUser },
]

export default function MobileNav() {
  const { totalUnread } = useChatStore()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-dark-800/90 backdrop-blur-lg border-t border-dark-600/50 z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-500 bg-primary-500/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <Icon className="text-xl" />
            {to === '/chat' && totalUnread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
