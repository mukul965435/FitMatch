import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiZap, 
  FiMail, FiLock, FiMapPin, FiAward, FiTarget, FiClock 
} from 'react-icons/fi'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const TOTAL_STEPS = 11

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    fitnessLevel: '',
    fitnessGoals: [],
    workoutTime: '',
    workoutDays: [],
    locationName: '',
  })
  
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const [direction, setDirection] = useState(0)
  
  const paginate = (newStep) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  const handleRegister = async () => {
    // Basic validation before final submit
    if (data.fitnessGoals.length === 0) return toast.error('Please select at least one goal')
    if (data.workoutDays.length === 0) return toast.error('Please select at least one workout day')

    const result = await register(data)
    if (result.success) {
      toast.success('Welcome to FitMatch! 🎉')
      navigate('/discover')
    } else {
      toast.error(result.message)
    }
  }

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email)
  
  const canNext = () => {
    switch(step) {
      case 1: return data.name.trim().length >= 2
      case 2: return validateEmail(data.email)
      case 3: return data.password.length >= 6
      case 4: return data.age >= 16 && data.age <= 80
      case 5: return !!data.gender
      case 6: return !!data.fitnessLevel
      case 7: return data.fitnessGoals.length > 0
      case 8: return !!data.workoutTime
      case 9: return data.workoutDays.length > 0
      case 10: return data.locationName.trim().length >= 2
      default: return true
    }
  }

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    })
  }

  return (
    <div className="w-full max-w-lg relative z-10 mx-auto px-4 py-8">
      {/* Progress Indicator */}
      {step > 0 && (
        <div className="mb-8 px-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
              STEP {step} OF {TOTAL_STEPS}
            </span>
            <span className="text-[10px] font-black text-gray-500 tracking-widest">
              {Math.round((step/TOTAL_STEPS)*100)}% COMPLETE
            </span>
          </div>
          <div className="h-1 bg-dark-700/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step/TOTAL_STEPS)*100}%` }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]"
            />
          </div>
        </div>
      )}

      <div className="glass-dark border border-white/5 rounded-[40px] shadow-2xl overflow-hidden min-h-[500px] flex flex-col p-8 lg:p-12 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex-1 flex flex-col"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[35px] flex items-center justify-center shadow-2xl shadow-primary-500/40"
                >
                  <FiZap className="text-white text-4xl" />
                </motion.div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">FitMatch</h1>
                  <p className="text-gray-400 text-lg font-medium">Find your perfect gym partner</p>
                </div>
                <button 
                  onClick={() => paginate(1)}
                  className="btn-primary w-full py-5 text-xl font-black shadow-2xl shadow-primary-500/30 active:scale-95 transition-all mt-6"
                >
                  Create Free Account
                </button>
                <p className="text-sm text-gray-500 font-medium">
                  Already have an account? <Link to="/login" className="text-primary-400 font-black hover:text-primary-300 transition-colors">Sign In</Link>
                </p>
              </div>
            )}

            {/* Step 1: Name */}
            {step === 1 && (
              <StepContent 
                title="What’s your full name?" 
                subtitle="Your name will be visible to potential gym buddies."
                icon={<FiUser />}
              >
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={data.name}
                  onChange={e => setData({...data, name: e.target.value})}
                  className="input-onboarding"
                  onKeyDown={e => e.key === 'Enter' && canNext() && paginate(2)}
                />
              </StepContent>
            )}

            {/* Step 2: Email */}
            {step === 2 && (
              <StepContent 
                title="What’s your email?" 
                subtitle="We'll keep your account secure and send you match alerts."
                icon={<FiMail />}
              >
                <input 
                  autoFocus
                  type="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={e => setData({...data, email: e.target.value})}
                  className="input-onboarding"
                  onKeyDown={e => e.key === 'Enter' && canNext() && paginate(3)}
                />
              </StepContent>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <StepContent 
                title="Secure your account" 
                subtitle="Choose a password (min 6 characters)"
                icon={<FiLock />}
              >
                <input 
                  autoFocus
                  type="password"
                  placeholder="••••••••"
                  value={data.password}
                  onChange={e => setData({...data, password: e.target.value})}
                  className="input-onboarding tracking-widest"
                  onKeyDown={e => e.key === 'Enter' && canNext() && paginate(4)}
                />
                {data.password.length > 0 && (
                  <div className="flex gap-2 mt-4 px-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        data.password.length >= (i*3) ? 'bg-primary-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-dark-600'
                      }`} />
                    ))}
                  </div>
                )}
              </StepContent>
            )}

            {/* Step 4: Age */}
            {step === 4 && (
              <StepContent 
                title="How old are you?" 
                subtitle="Fitness has no age, but helps us find better matches."
                icon={<FiAward />}
              >
                <div className="flex items-center justify-center">
                  <input 
                    autoFocus
                    type="number"
                    placeholder="24"
                    value={data.age}
                    onChange={e => setData({...data, age: e.target.value})}
                    className="input-onboarding text-6xl text-center py-6 border-none focus:ring-0 w-44"
                    onKeyDown={e => e.key === 'Enter' && canNext() && paginate(5)}
                  />
                  <span className="text-2xl font-bold text-gray-600 -ml-4 mt-6 uppercase tracking-widest">Years</span>
                </div>
              </StepContent>
            )}

            {/* Step 5: Gender */}
            {step === 5 && (
              <StepContent title="Select your gender">
                <div className="space-y-3">
                  {['male', 'female', 'non-binary'].map(g => (
                    <SelectionCard 
                      key={g} 
                      label={g} 
                      selected={data.gender === g}
                      onClick={() => setData({...data, gender: g})}
                    />
                  ))}
                </div>
              </StepContent>
            )}

            {/* Step 6: Fitness Level */}
            {step === 6 && (
              <StepContent title="Your fitness level?">
                <div className="space-y-3">
                  {['beginner', 'intermediate', 'advanced'].map(l => (
                    <SelectionCard 
                      key={l} 
                      label={l} 
                      selected={data.fitnessLevel === l}
                      onClick={() => setData({...data, fitnessLevel: l})}
                    />
                  ))}
                </div>
              </StepContent>
            )}

            {/* Step 7: Goals */}
            {step === 7 && (
              <StepContent title="Main fitness goals?" subtitle="Select all that apply to you">
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {['fat loss', 'muscle gain', 'strength', 'endurance', 'general fitness', 'flexibility'].map(g => (
                    <SelectionCard 
                      key={g} 
                      label={g} 
                      selected={data.fitnessGoals.includes(g)}
                      onClick={() => {
                        const goals = data.fitnessGoals.includes(g) 
                          ? data.fitnessGoals.filter(i => i !== g)
                          : [...data.fitnessGoals, g]
                        setData({...data, fitnessGoals: goals})
                      }}
                    />
                  ))}
                </div>
              </StepContent>
            )}

            {/* Step 8: Time */}
            {step === 8 && (
              <StepContent title="When do you train?" icon={<FiClock />}>
                <div className="space-y-3">
                  {['morning', 'afternoon', 'evening', 'night', 'flexible'].map(t => (
                    <SelectionCard 
                      key={t} 
                      label={t} 
                      selected={data.workoutTime === t}
                      onClick={() => setData({...data, workoutTime: t})}
                    />
                  ))}
                </div>
              </StepContent>
            )}

            {/* Step 9: Days */}
            {step === 9 && (
              <StepContent title="Which days do you train?">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => {
                    const active = data.workoutDays.includes(d)
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          const days = active ? data.workoutDays.filter(i => i !== d) : [...data.workoutDays, d]
                          setData({...data, workoutDays: days})
                        }}
                        className={`aspect-square rounded-[20px] flex items-center justify-center text-xs font-black transition-all duration-300 border-2 ${
                          active 
                            ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/30' 
                            : 'bg-dark-700/50 border-transparent text-gray-500 hover:bg-dark-600'
                        }`}
                      >
                        {d.charAt(0).toUpperCase()}
                      </button>
                    )
                  })}
                </div>
                <p className="text-center text-gray-500 text-[10px] mt-8 uppercase font-bold tracking-widest opacity-60">Consistency is key to results</p>
              </StepContent>
            )}

            {/* Step 10: Location */}
            {step === 10 && (
              <StepContent 
                title="Where do you work out?" 
                subtitle="Nearby gym buddies will find you here."
                icon={<FiMapPin />}
              >
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Gold's Gym, New Delhi"
                  value={data.locationName}
                  onChange={e => setData({...data, locationName: e.target.value})}
                  className="input-onboarding"
                  onKeyDown={e => e.key === 'Enter' && canNext() && paginate(11)}
                />
                <button 
                  onClick={() => {
                    if ("geolocation" in navigator) {
                      toast.loading('Detecting location...', { id: 'loc' })
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setData({
                          ...data, 
                          location: { 
                            type: 'Point', 
                            coordinates: [pos.coords.longitude, pos.coords.latitude] 
                          },
                          locationName: 'Detected Location'
                        })
                        toast.success('Location locked! 📍', { id: 'loc' })
                      }, () => {
                         toast.error('Location permission denied', { id: 'loc' })
                      })
                    }
                  }}
                  className="text-[10px] text-primary-400 mt-6 font-black flex items-center gap-2 hover:text-primary-300 uppercase tracking-widest"
                >
                  <FiMapPin className="text-sm" /> Pin current location
                </button>
              </StepContent>
            )}

            {/* Step 11: Review */}
            {step === 11 && (
              <div className="flex-1 flex flex-col pt-4">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white tracking-tighter">Ready to join?</h2>
                  <p className="text-gray-400 font-medium">Review your profile details before we start.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto pr-3 custom-scrollbar mb-6">
                  <ReviewItem label="NAME" value={data.name} icon={<FiUser />} />
                  <ReviewItem label="INFO" value={`${data.age}y / ${data.gender}`} icon={<FiAward />} />
                  <ReviewItem label="LEVEL" value={data.fitnessLevel} icon={<FiZap />} />
                  <ReviewItem label="GOALS" value={data.fitnessGoals.join(' • ')} icon={<FiTarget />} />
                  <ReviewItem label="SCHEDULE" value={data.workoutTime} icon={<FiClock />} />
                </div>

                <button 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="btn-primary w-full py-5 text-xl font-black shadow-2xl shadow-primary-500/30 transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Let's Go! 💪
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Global Navigation */}
            {step > 0 && (
              <div className="flex gap-4 mt-auto pt-8 border-t border-white/5">
                <button 
                  onClick={() => paginate(step - 1)}
                  className="w-16 h-16 flex items-center justify-center rounded-3xl bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600 transition-all active:scale-90 border border-white/5"
                >
                  <FiArrowLeft className="text-2xl" />
                </button>
                {step < TOTAL_STEPS && (
                  <button 
                    disabled={!canNext()}
                    onClick={() => paginate(step + 1)}
                    className="btn-primary flex-1 h-16 rounded-3xl font-black flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale-100 transition-all active:scale-[0.98] text-lg tracking-tight"
                  >
                    Continue
                    <FiArrowRight className="text-xl" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function StepContent({ title, subtitle, icon, children }) {
  return (
    <div className="flex-1 flex flex-col pt-4">
      <div className="mb-10">
        {icon && (
          <div className="w-14 h-14 bg-primary-500/20 text-primary-400 rounded-3xl flex items-center justify-center mb-6 text-2xl border border-primary-500/10 shadow-lg shadow-primary-500/10">
            {icon}
          </div>
        )}
        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-gray-400 text-base mt-2 font-medium opacity-80">{subtitle}</p>}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

function SelectionCard({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-[25px] text-left font-black capitalize transition-all border-2 flex items-center justify-between group ${
        selected 
          ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-xl shadow-primary-500/10' 
          : 'bg-dark-700/50 border-transparent text-gray-500 hover:bg-dark-600 hover:border-dark-600 hover:text-gray-300'
      }`}
    >
      <span className="tracking-tight">{label}</span>
      {selected ? (
        <div className="w-7 h-7 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <FiCheck className="text-white text-sm" />
        </div>
      ) : (
        <div className="w-7 h-7 bg-dark-800 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FiArrowRight className="text-gray-600 text-sm" />
        </div>
      )}
    </button>
  )
}

function ReviewItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-5 p-5 glass-dark rounded-[25px] border border-white/5 hover:border-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-[20px] bg-primary-500/10 text-primary-400 flex items-center justify-center text-xl shrink-0 border border-primary-500/10">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black opacity-80 mb-0.5">{label}</p>
        <p className="text-white font-black capitalize truncate text-lg tracking-tight leading-none">{value || 'NOT SET'}</p>
      </div>
    </div>
  )
}
