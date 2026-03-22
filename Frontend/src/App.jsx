import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import useSocketStore from './store/socketStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DiscoverPage from './pages/DiscoverPage'
import MatchesPage from './pages/MatchesPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import FeedPage from './pages/FeedPage'
import UserDetailPage from './pages/UserDetailPage'
import LandingPage from './pages/LandingPage'

// Route guard
const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

const GuestRoute = ({ children }) => {
  const { user } = useAuthStore()
  return !user ? children : <Navigate to="/discover" replace />
}

export default function App() {
  const { user } = useAuthStore()
  const { connectSocket, disconnectSocket } = useSocketStore()

  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id)
    } else {
      disconnectSocket()
    }
    return () => {
      // Only disconnect on full unmount, not re-renders
    }
  }, [user?._id])

  return (
    <Routes>
      {/* Public landing */}
      <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/:userId" element={<UserDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/feed" element={<FeedPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
