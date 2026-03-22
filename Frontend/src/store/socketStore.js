import { create } from 'zustand'
import { io } from 'socket.io-client'

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: (userId) => {
    if (get().socket?.connected) return

    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      socket.emit('user_connected', userId)
      console.log('Socket connected:', socket.id)
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
