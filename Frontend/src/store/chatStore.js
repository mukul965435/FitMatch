import { create } from 'zustand'
import axiosInstance from '../utils/axios'

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  totalUnread: 0,

  setActiveConversation: (user) => {
    set({ activeConversation: user, messages: [] })
  },

  fetchConversations: async () => {
    try {
      const { data } = await axiosInstance.get('/messages')
      const total = data.data.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
      set({ conversations: data.data, totalUnread: total })
    } catch (err) {
      console.error(err)
    }
  },

  fetchMessages: async (userId) => {
    set({ isLoading: true })
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`)
      set({ messages: data.data, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
    }
  },

  sendMessage: async (receiverId, content) => {
    try {
      const { data } = await axiosInstance.post(`/messages/${receiverId}`, { content })
      return data.data
    } catch (err) {
      throw err
    }
  },

  addMessage: (message) => {
    set((state) => {
      // Avoid duplicates
      const exists = state.messages.find((m) => m._id === message._id)
      if (exists) return state
      return { messages: [...state.messages, message] }
    })
  },

  setTyping: (value) => set({ isTyping: value }),

  resetUnread: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
      totalUnread: Math.max(0, state.totalUnread - (state.conversations.find(c => c._id === conversationId)?.unreadCount || 0)),
    }))
  },
}))

export default useChatStore
