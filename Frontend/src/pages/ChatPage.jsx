import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiSend, FiArrowLeft } from 'react-icons/fi'
import { formatRelative } from 'date-fns'
import useAuthStore from '../store/authStore'
import useSocketStore from '../store/socketStore'
import useChatStore from '../store/chatStore'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { socket } = useSocketStore()
  const {
    conversations, fetchConversations, fetchMessages,
    messages, sendMessage, addMessage, activeConversation,
    setActiveConversation, isTyping, setTyping, isLoading
  } = useChatStore()

  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)

  // Fetch conversations list
  useEffect(() => {
    fetchConversations()
  }, [])

  // Set active conversation from URL param
  useEffect(() => {
    if (userId && conversations.length > 0) {
      const conv = conversations.find(c => c.otherUser?._id === userId)
      if (conv) setActiveConversation(conv.otherUser)
    }
  }, [userId, conversations])

  // Fetch messages when activeConversation changes
  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id)
    }
  }, [activeConversation?._id])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    socket.on('new_message', (msg) => {
      addMessage(msg)
    })

    socket.on('typing', ({ senderId }) => {
      if (senderId === activeConversation?._id) setTyping(true)
    })

    socket.on('stop_typing', ({ senderId }) => {
      if (senderId === activeConversation?._id) setTyping(false)
    })

    return () => {
      socket.off('new_message')
      socket.off('typing')
      socket.off('stop_typing')
    }
  }, [socket, activeConversation?._id])

  const handleInputChange = (e) => {
    setInput(e.target.value)

    // Typing indicator
    if (socket && activeConversation) {
      socket.emit('typing', { senderId: user._id, receiverId: activeConversation._id })
      if (typingTimeout) clearTimeout(typingTimeout)
      const timeout = setTimeout(() => {
        socket.emit('stop_typing', { senderId: user._id, receiverId: activeConversation._id })
      }, 1500)
      setTypingTimeout(timeout)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !activeConversation || isSending) return

    setIsSending(true)
    const content = input.trim()
    setInput('')

    try {
      await sendMessage(activeConversation._id, content)
      socket?.emit('stop_typing', { senderId: user._id, receiverId: activeConversation._id })
    } catch (err) {
      toast.error('Failed to send message')
      setInput(content)
    } finally {
      setIsSending(false)
    }
  }

  const selectConversation = (conv) => {
    setActiveConversation(conv.otherUser)
    navigate(`/chat/${conv.otherUser._id}`)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 -mt-6 -mx-4 lg:mx-0">
      {/* Conversation List */}
      <div className={`w-full lg:w-80 flex flex-col card ${activeConversation ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 border-b border-dark-600">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FiMessageSquare className="text-primary-500" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">No conversations yet</p>
              <p className="text-gray-500 text-xs mt-1">Match with a buddy to start chatting</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-dark-700 transition-colors border-b border-dark-700/50 ${
                  activeConversation?._id === conv.otherUser?._id ? 'bg-dark-700/70' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.otherUser?.profilePicture || `https://ui-avatars.com/api/?name=${conv.otherUser?.name}&background=f97316&color=fff`}
                    alt={conv.otherUser?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv.otherUser?.isOnline && <span className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-white font-medium text-sm truncate">{conv.otherUser?.name}</span>
                    <span className="text-gray-500 text-xs shrink-0 ml-2">
                      {conv.lastMessage?.createdAt
                        ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{conv.lastMessage?.content}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col card ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-8xl mb-4">💪</div>
            <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
            <p className="text-gray-400">Choose a buddy from the left to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-3">
              <button
                onClick={() => { setActiveConversation(null); navigate('/chat') }}
                className="lg:hidden text-gray-400 hover:text-white mr-1"
              >
                <FiArrowLeft />
              </button>
              <div className="relative">
                <img
                  src={activeConversation.profilePicture || `https://ui-avatars.com/api/?name=${activeConversation.name}&background=f97316&color=fff`}
                  alt={activeConversation.name}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => navigate(`/profile/${activeConversation._id}`)}
                />
                {activeConversation.isOnline && <span className="absolute -bottom-0.5 -right-0.5 online-dot" />}
              </div>
              <div>
                <h3 className="text-white font-semibold">{activeConversation.name}</h3>
                <p className="text-xs text-gray-500">
                  {activeConversation.isOnline ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    `Last seen ${activeConversation.lastSeen ? formatRelative(new Date(activeConversation.lastSeen), new Date()) : 'recently'}`
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <span className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?._id === user._id || msg.sender === user._id
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <img
                          src={activeConversation.profilePicture || `https://ui-avatars.com/api/?name=${activeConversation.name}&background=f97316&color=fff`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                        />
                      )}
                      <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMine ? 'message-sent' : 'message-received'}`}>
                          {msg.content}
                        </div>
                        <span className="text-gray-600 text-xs mt-1 px-1">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </motion.div>
                  )
                })
              )}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2"
                  >
                    <img
                      src={activeConversation.profilePicture || `https://ui-avatars.com/api/?name=${activeConversation.name}&background=f97316&color=fff`}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="message-received px-4 py-3 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-dark-600 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={`Message ${activeConversation.name}...`}
                className="input flex-1"
                autoFocus
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isSending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-4 py-3 disabled:opacity-40"
              >
                <FiSend />
              </motion.button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
