import { create } from 'zustand'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: (userId) => {
    if (get().socket?.connected) return

    const socket = io('http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      socket.emit('user_connected', userId)
    })

    // Listen for new messages globally for toast notifications
    socket.on('new_message', (message) => {
      // Only show toast if not already in that chat
      if (window.location.pathname !== `/chat/${message.sender._id}` && 
          window.location.pathname !== '/chat') {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} glass-dark max-w-md w-full p-4 flex gap-4 border border-primary-500/30`}>
            <img 
              src={message.sender.profilePicture || `https://ui-avatars.com/api/?name=${message.sender.name}`} 
              className="w-10 h-10 rounded-full shrink-0" 
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white">New message from {message.sender.name}</p>
              <p className="text-xs text-gray-400 truncate">{message.content}</p>
            </div>
          </div>
        ));
      }
    })

    socket.on('notification', (notif) => {
      toast.success(notif.message, { icon: '🔔' });
    })

    socket.on('user_online', ({ userId: id }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.includes(id)
          ? state.onlineUsers
          : [...state.onlineUsers, id],
      }))
    })

    socket.on('user_offline', ({ userId: id }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((uid) => uid !== id),
      }))
    })

    set({ socket })
  },

  disconnectSocket: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, onlineUsers: [] })
    }
  },

  isOnline: (userId) => {
    return get().onlineUsers.includes(userId)
  },
}))

export default useSocketStore
