import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSave, FiCamera, FiMapPin, FiLoader } from 'react-icons/fi'
import useAuthStore from '../store/authStore'
import axiosInstance from '../utils/axios'
import toast from 'react-hot-toast'

const fitnessLevels = ['beginner', 'intermediate', 'advanced']
const workoutTimes = ['early morning', 'morning', 'afternoon', 'evening', 'night', 'flexible']
const allGoals = ['fat loss', 'muscle gain', 'strength', 'endurance', 'flexibility', 'general fitness']
const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const genders = ['male', 'female', 'non-binary', 'prefer not to say']

export default function EditProfilePage() {
  const { user, updateUser, refreshUser } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    gymName: '',
    fitnessLevel: 'beginner',
    fitnessGoals: [],
    workoutTime: 'morning',
    workoutDays: [],
    locationName: '',
    longitude: '',
    latitude: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)

  // Pre-fill form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || '',
        bio: user.bio || '',
        gymName: user.gymName || '',
        fitnessLevel: user.fitnessLevel || 'beginner',
        fitnessGoals: user.fitnessGoals || [],
        workoutTime: user.workoutTime || 'morning',
        workoutDays: user.workoutDays || [],
        locationName: user.locationName || '',
        longitude: user.location?.coordinates?.[0] || '',
        latitude: user.location?.coordinates?.[1] || '',
      })
      setPreviewUrl(user.profilePicture || '')
    }
  }, [user])

  const toggleGoal = (goal) => {
    setForm(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal],
    }))
  }

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day)
        ? prev.workoutDays.filter(d => d !== day)
        : [...prev.workoutDays, day],
    }))
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationName: `Lat: ${pos.coords.latitude.toFixed(2)}, Lng: ${pos.coords.longitude.toFixed(2)}`,
        }))
        setGeoLoading(false)
        toast.success('Location detected! 📍')
      },
      () => {
        setGeoLoading(false)
        toast.error('Could not get location')
      }
    )
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    setPreviewUrl(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const { data } = await axiosInstance.put('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser({ profilePicture: data.data.profilePicture })
      toast.success('Profile picture updated! 📸')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Build payload — only include coordinates if they are real numbers
    const payload = { ...form }
    const lng = parseFloat(form.longitude)
    const lat = parseFloat(form.latitude)
    if (!isFinite(lng) || !isFinite(lat)) {
      // Remove coords so backend doesn't receive NaN
      delete payload.longitude
      delete payload.latitude
    }

    try {
      const { data } = await axiosInstance.put('/users/profile', payload)
      updateUser(data.data)
      toast.success('Profile updated! 💪')
      navigate('/profile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Keep your profile up to date for better matches</p>
      </div>

      {/* Avatar Section */}
      <div className="card p-6 flex items-center gap-6">
        <div className="relative">
          <img
            src={previewUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=f97316&color=fff&size=200`}
            alt="Avatar"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-dark-500"
          />
          {avatarLoading && (
            <div className="absolute inset-0 bg-dark-900/70 rounded-2xl flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost flex items-center gap-2 text-sm py-2"
          >
            <FiCamera />
            Change Photo
          </button>
          <p className="text-gray-500 text-xs mt-2">JPG, PNG or WebP — max 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-lg mb-2">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="input" required />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" value={form.age} onChange={e => setForm(p => ({...p, age: e.target.value}))}
                min="16" max="80" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Gender</label>
            <div className="flex flex-wrap gap-2">
              {genders.map(g => (
                <button type="button" key={g}
                  onClick={() => setForm(p => ({...p, gender: g}))}
                  className={`badge capitalize py-2 px-4 cursor-pointer transition-all ${
                    form.gender === g ? 'badge-orange' : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Bio <span className="text-gray-600 font-normal">({form.bio?.length || 0}/300)</span></label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({...p, bio: e.target.value}))}
              maxLength={300}
              rows={3}
              placeholder="Tell potential buddies about yourself..."
              className="input resize-none"
            />
          </div>
        </div>

        {/* Fitness Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-lg mb-2">Fitness Profile</h2>

          <div>
            <label className="label">Gym Name</label>
            <input type="text" value={form.gymName}
              onChange={e => setForm(p => ({...p, gymName: e.target.value}))}
              placeholder="e.g. Gold's Gym, AnytimeFitness..."
              className="input" />
          </div>

          <div>
            <label className="label">Fitness Level</label>
            <div className="flex gap-3">
              {fitnessLevels.map(l => (
                <button type="button" key={l}
                  onClick={() => setForm(p => ({...p, fitnessLevel: l}))}
                  className={`flex-1 py-3 rounded-xl capitalize font-medium text-sm border transition-all ${
                    form.fitnessLevel === l
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                      : 'border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Fitness Goals (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {allGoals.map(g => (
                <button type="button" key={g}
                  onClick={() => toggleGoal(g)}
                  className={`badge capitalize py-2 px-4 cursor-pointer transition-all ${
                    form.fitnessGoals.includes(g)
                      ? 'badge-orange border-primary-500'
                      : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-lg mb-2">Workout Schedule</h2>

          <div>
            <label className="label">Preferred Workout Time</label>
            <div className="flex flex-wrap gap-2">
              {workoutTimes.map(t => (
                <button type="button" key={t}
                  onClick={() => setForm(p => ({...p, workoutTime: t}))}
                  className={`badge capitalize py-2 px-4 cursor-pointer transition-all ${
                    form.workoutTime === t ? 'badge-orange' : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Workout Days</label>
            <div className="flex flex-wrap gap-2">
              {allDays.map(d => (
                <button type="button" key={d}
                  onClick={() => toggleDay(d)}
                  className={`badge capitalize py-2 px-3 cursor-pointer transition-all ${
                    form.workoutDays.includes(d) ? 'badge-orange' : 'border border-dark-500 text-gray-400 hover:border-dark-400'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-lg mb-2">Location</h2>

          <div>
            <label className="label">Location Name</label>
            <input
              type="text"
              value={form.locationName}
              onChange={e => setForm(p => ({...p, locationName: e.target.value}))}
              placeholder="e.g. New Delhi, India"
              className="input"
            />
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={geoLoading}
            className="btn-ghost flex items-center gap-2 text-sm py-2 w-full justify-center"
          >
            {geoLoading ? <FiLoader className="animate-spin" /> : <FiMapPin />}
            {geoLoading ? 'Detecting...' : 'Auto-detect my location'}
          </button>

          {form.latitude && form.longitude && (
            <p className="text-xs text-green-400 text-center">
              📍 Location: {typeof form.latitude === 'number' ? form.latitude.toFixed(4) : form.latitude},
              {typeof form.longitude === 'number' ? form.longitude.toFixed(4) : form.longitude}
            </p>
          )}
        </div>

        {/* Save */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiSave />
              Save Changes
            </>
          )}
        </motion.button>
      </form>
    </div>
  )
}
