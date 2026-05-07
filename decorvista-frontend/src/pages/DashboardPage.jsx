import { motion } from 'framer-motion'
import { ArrowUp, ChevronRight, Compass, Sparkles, Trash2, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'
import { deleteDesign, getDesigns, getCount } from '../services/designService'
import { nodeAPI } from '../services/api'

const mainFeatureCards = [
  {
    icon: '🎨',
    title: 'AI Room Redesign Studio',
    subtitle: 'Transform any room with AI-powered design in 4 simple steps',
    features: [
      '✓ Upload room photo',
      '✓ Get 3 design variations',
      '✓ Customize colors & style',
      '✓ Download & share'
    ],
    link: '/ai-redesign',
    gradient: 'from-[#D4AF37] to-[#FF8C00]',
    bg: 'bg-gradient-to-br from-[#D4AF37]/10 to-[#FF8C00]/10'
  },
  {
    icon: '🧭',
    title: 'Vastu Shastra Analyzer',
    subtitle: 'Analyze your space with ancient Indian design wisdom',
    features: [
      '✓ Room photo analysis',
      '✓ Vastu score (0-100)',
      '✓ Problem identification',
      '✓ Expert recommendations'
    ],
    link: '/vastu',
    gradient: 'from-[#00b894] to-[#00cec9]',
    bg: 'bg-gradient-to-br from-[#00b894]/10 to-[#00cec9]/10'
  },
  {
    icon: '🏗️',
    title: '3D Room Visualizer',
    subtitle: 'Drag & drop real furniture in an interactive 3D room',
    features: [
      '✓ 15+ furniture models',
      '✓ Rotate & resize objects',
      '✓ Multiple room views',
      '✓ Save & export layouts'
    ],
    link: '/visualizer',
    gradient: 'from-[#6c5ce7] to-[#0984e3]',
    bg: 'bg-gradient-to-br from-[#6c5ce7]/10 to-[#0984e3]/10'
  }
]

const quickTips = [
  {
    title: 'Photography Tips',
    description: 'For better AI results, take photos in natural light from eye level and capture the entire room.',
    icon: '📸'
  },
  {
    title: 'Vastu Basics',
    description: 'Keep the north-east corner clean and clutter-free for positive energy flow.',
    icon: '🧭'
  },
  {
    title: '3D Modeling Tips',
    description: 'Start with larger furniture pieces first, then add decor items for balanced layouts.',
    icon: '🏗️'
  }
]

function resolveDesignList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.designs)) {
    return payload.designs
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [designs, setDesigns] = useState([])
  const [designCount, setDesignCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeDeleteId, setActiveDeleteId] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [designsRes, countRes, bookingsRes] = await Promise.allSettled([
          getDesigns(),
          getCount(),
          nodeAPI.get('/api/vastu/my-bookings').catch(() => null)
        ])

        if (designsRes.status === 'fulfilled') {
          setDesigns(resolveDesignList(designsRes.value))
        }
        
        if (countRes.status === 'fulfilled') {
          setDesignCount(countRes.value?.count ?? 0)
        }

        if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
          setBookingCount(bookingsRes.value.data?.length ?? 0)
        }
      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDelete = async (designId) => {
    setActiveDeleteId(designId)
    try {
      await deleteDesign(designId)
      setDesigns((current) => current.filter((design) => (design.id ?? design._id) !== designId))
      setDesignCount((c) => c - 1)
      toast.success('Design deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete this design.')
    } finally {
      setActiveDeleteId(null)
    }
  }

  const profileCompletion = useMemo(() => {
    let score = 40
    if (user?.name) score += 20
    if (user?.email) score += 20
    if (designCount > 0) score += 20
    return Math.min(score, 100)
  }, [user, designCount])

  const recentDesigns = useMemo(() => designs.slice(0, 4), [designs])

  return (
    <div className="page-shell min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="section-shell">
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="badge-pill">Your design command center</span>
              <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
                Welcome back, {user?.name ?? 'Designer'}! 👋
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-r from-[#D4AF37] to-[#FF8C00] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user?.name?.split(' ').map(n => n[0]).join('') ?? 'DV'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Designs Created</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {designCount} <ArrowUp className="w-5 h-5 text-green-600" />
                </p>
              </div>
              <div className="w-12 h-12 bg-[#D4AF37]/20 text-[#D4AF37] rounded-2xl flex items-center justify-center text-2xl">🎨</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vastu Score</p>
                <Link to="/vastu" className="mt-2 inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold hover:bg-green-200">
                  View Analysis
                </Link>
              </div>
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">🧭</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultations Booked</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{bookingCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">📅</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Completion</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{profileCompletion}%</p>
              </div>
              <div className="relative">
                <svg className="w-16 h-16" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    stroke={profileCompletion >= 80 ? '#22c55e' : profileCompletion >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${profileCompletion * 1.01} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Design Studio</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {mainFeatureCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`glass-card rounded-2xl p-8 ${card.bg}`}
              >
                <div className="text-7xl mb-4 animate-pulse">{card.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 mb-6">{card.subtitle}</p>
                <ul className="mb-8 space-y-2">
                  {card.features.map((feat, i) => (
                    <li key={i} className="text-sm text-gray-700">{feat}</li>
                  ))}
                </ul>
                <Link 
                  to={card.link}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold bg-gradient-to-r ${card.gradient} text-white hover:opacity-90`}
                >
                  {card.title.split(' ')[0]} Now <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Designs</h2>
            {designs.length > 0 && (
              <Link to="/profile" className="text-[#D4AF37] font-semibold hover:underline">
                View All
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="glass-card rounded-2xl p-12 flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="loader-ring h-6 w-6 rounded-full border-2 border-gray-300 border-t-[#D4AF37]" />
                Loading designs...
              </div>
            </div>
          ) : recentDesigns.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-8xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your First Design</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Upload a room photo and let AI generate stunning design concepts for you.
              </p>
              <Link to="/ai-redesign" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-[#D4AF37] text-white hover:bg-[#b8941f]">
                Start Designing <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentDesigns.map((design) => {
                const designId = design.id ?? design._id
                const imageUrl = design.thumbnail ?? design.imageUrl ?? '/placeholder-room.jpg'
                const dateValue = design.createdAt ?? design.date ?? new Date().toISOString()
                const styleLabel = design.style ?? design.category ?? 'AI Concept'

                return (
                  <motion.div 
                    key={designId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    <img src={imageUrl} alt={design.name ?? 'Design'} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h4 className="font-bold text-gray-900">{design.name ?? 'Untitled Design'}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(dateValue).toLocaleDateString('en-IN')}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-semibold">
                          {styleLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(designId)}
                          disabled={activeDeleteId === designId}
                          className="text-gray-400 hover:text-red-500"
                        >
                          {activeDeleteId === designId ? (
                            <span className="loader-ring h-4 w-4 rounded-full border-2 border-gray-300 border-t-red-500" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickTips.map((tip, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
