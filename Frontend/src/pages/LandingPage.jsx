import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiZap, FiUsers, FiMapPin, FiMessageSquare, FiArrowRight, FiCheck } from 'react-icons/fi'

const features = [
  {
    icon: FiUsers,
    title: 'Smart Matching',
    desc: 'Our algorithm finds your perfect gym partner based on goals, schedule, and fitness level.',
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
  },
  {
    icon: FiMapPin,
    title: 'Location-Based',
    desc: 'Discover gym buddies near you — at your gym or within a configurable radius.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FiMessageSquare,
    title: 'Real-Time Chat',
    desc: 'Chat instantly with your matches. Typing indicators, online status, and more.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
]

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Matches Made' },
  { value: '4.9★', label: 'App Rating' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <FiZap className="text-white text-xl" />
          </div>
          <span className="text-xl font-bold">FitMatch</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors font-medium">
            Login
          </Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 badge badge-orange mb-6 text-sm py-2 px-4">
            <FiZap />
            <span>The #1 Gym Buddy Finder App</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Gym Buddy
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop training alone. FitMatch connects you with compatible workout partners based on
            your fitness goals, schedule, experience level, and location.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-lg py-4 px-8">
              Start Matching <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-ghost flex items-center gap-2 text-lg py-4 px-8">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-center gap-12 mt-16 flex-wrap"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black mb-4">Everything You Need</h2>
          <p className="text-gray-400 text-lg">Built for serious fitness enthusiasts.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-8 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon className={`${color} text-2xl`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-gray-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass p-12 text-center rounded-3xl border border-primary-500/20"
        >
          <h2 className="text-4xl font-black mb-4">Ready to Find Your Buddy?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of fitness enthusiasts already on FitMatch.</p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {['Free to join', 'Smart matching', 'Real-time chat', 'Location-based'].map(f => (
              <span key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                <FiCheck className="text-primary-400" /> {f}
              </span>
            ))}
          </div>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg py-4 px-10">
            Get Started Free <FiArrowRight />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
