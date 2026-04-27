import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Edit3, Grid, History, LogOut, Mail, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'
import { deleteAccount, updateProfile } from '../services/authService'
import { deleteDesign, getDesigns } from '../services/designService'
import { getMyBookings } from '../services/vastuService'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('designs')
  const [savedDesigns, setSavedDesigns] = useState([])
  const [vastuHistory, setVastuHistory] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [designsData, historyData] = await Promise.all([
          getDesigns(),
          getMyBookings()
        ])
        setSavedDesigns(designsData?.designs || [])
        setVastuHistory(historyData?.bookings || [])
      } catch (error) {
        console.error('Failed to load profile data', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        toast.success('New avatar selected!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      await updateProfile(formData)
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return

    try {
      await deleteAccount()
      toast.success('Account deleted')
      logout()
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const handleDeleteDesign = async (id) => {
    try {
      await deleteDesign(id)
      setSavedDesigns(prev => prev.filter(d => (d._id ?? d.id) !== id))
      toast.success('Design deleted')
    } catch (error) {
      toast.error('Failed to delete design')
    }
  }

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="section-shell"
      >
        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          {/* User Info Card */}
          <aside className="space-y-6">
            <div className="glass-card rounded-[28px] p-8 text-center">
              <div className="relative mx-auto w-32 h-32 mb-6 group cursor-pointer">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent-purple)] flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white shadow-xl">
                  {avatarPreview || user?.avatar ? (
                    <img src={avatarPreview || user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || 'U'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[var(--dark)] text-white hover:bg-[var(--primary)] transition-all cursor-pointer shadow-lg transform group-hover:scale-110">
                  <Edit3 className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-[var(--dark)]">{user?.name}</h2>
              <p className="text-[var(--text-secondary)] flex items-center justify-center gap-2 mt-2">
                <Mail className="h-4 w-4" /> {user?.email}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-4">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
              
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="mt-8 w-full btn-secondary"
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>

            <div className="glass-card rounded-[28px] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Danger Zone</h3>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-semibold"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-[28px] p-8"
              >
                <h3 className="text-2xl font-bold text-[var(--dark)] mb-6">Update Profile</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--dark)] mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--dark)] mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="input-field" 
                      />
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 my-4" />
                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--dark)] mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--dark)] mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--dark)] mb-2">Confirm Password</label>
                      <input 
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        className="input-field" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary px-10">Save Changes</button>
                </form>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-4 p-1 bg-white/50 rounded-2xl w-fit">
                  <button 
                    onClick={() => setActiveTab('designs')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'designs' ? 'bg-white shadow-md text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
                  >
                    <Grid className="h-4 w-4" /> Saved Designs
                  </button>
                  <button 
                    onClick={() => setActiveTab('vastu')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'vastu' ? 'bg-white shadow-md text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
                  >
                    <History className="h-4 w-4" /> Vastu History
                  </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                  {activeTab === 'designs' ? (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {savedDesigns.length > 0 ? savedDesigns.map((design) => (
                        <div key={design._id} className="glass-card group rounded-[24px] overflow-hidden">
                          <div className="relative h-48">
                            <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                              {design.style}
                            </div>
                            <button 
                              onClick={() => handleDeleteDesign(design._id)}
                              className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-[var(--dark)] truncate">{design.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{design.roomType} • {new Date(design.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full flex flex-col items-center justify-center p-20 text-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Grid className="h-10 w-10 text-slate-300" />
                          </div>
                          <h4 className="text-xl font-bold text-[var(--dark)]">No designs saved yet</h4>
                          <p className="text-[var(--text-secondary)] mt-2">Start redesigning your rooms to see them here.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vastuHistory.length > 0 ? vastuHistory.map((item) => (
                        <div key={item._id} className="glass-card rounded-[24px] p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-white ${item.score > 80 ? 'bg-green-500' : item.score > 50 ? 'bg-orange-500' : 'bg-red-500'}`}>
                              <span className="text-xl">{item.score}</span>
                              <span className="text-[8px] uppercase">Score</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-[var(--dark)]">{item.roomType || item.consultationType} Analysis</h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-1">
                                <Calendar className="inline h-3 w-3 mr-1" /> {new Date(item.preferredDate || item.createdAt).toLocaleDateString()} • {item.facingDirection ? `Facing ${item.facingDirection}` : item.city}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-[var(--text-secondary)] text-xs font-semibold">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> {item.elements?.length} Elements
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <History className="h-10 w-10 text-slate-300" />
                          </div>
                          <h4 className="text-xl font-bold text-[var(--dark)]">No Vastu history found</h4>
                          <p className="text-[var(--text-secondary)] mt-2">Analyze your rooms to get Vastu scores and tips.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.main>
      <Footer />

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-[var(--dark)] mb-4">Delete Account?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              Are you sure? This will permanently delete your account and all saved designs. This action cannot be undone.
            </p>
            <div className="space-y-4">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Type "DELETE" to confirm</p>
              <input 
                type="text" 
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="input-field border-red-200 focus:border-red-500"
              />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE'}
                  className="bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
