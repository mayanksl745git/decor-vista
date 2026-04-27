import { motion } from 'framer-motion'
import { Box, Compass, Download, Image, Layers3, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'
import { deleteDesign, getDesigns } from '../services/designService'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

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
  const [isLoading, setIsLoading] = useState(true)
  const [activeDeleteId, setActiveDeleteId] = useState(null)

  useEffect(() => {
    const loadDesigns = async () => {
      setIsLoading(true)

      try {
        const response = await getDesigns()
        setDesigns(resolveDesignList(response))
      } catch (error) {
        setDesigns([])
        toast.error(error.response?.data?.message ?? 'Unable to load saved designs.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDesigns()
  }, [])

  const stats = useMemo(
    () => [
      {
        label: 'Total Designs Saved',
        value: designs.length,
        icon: Image,
        color: 'bg-[rgba(255,107,53,0.12)] text-[var(--primary)]',
      },
      {
        label: 'Vastu Analyses Done',
        value: user?.vastuAnalysisCount ?? 0,
        icon: Compass,
        color: 'bg-[rgba(45,106,79,0.12)] text-[var(--secondary)]',
      },
      {
        label: '3D Sessions',
        value: user?.visualizerSessionCount ?? 0,
        icon: Box,
        color: 'bg-[rgba(123,94,167,0.12)] text-[var(--accent-purple)]',
      },
      {
        label: 'Account Status',
        value: 'Free Plan',
        icon: Layers3,
        color: 'bg-[rgba(255,209,102,0.18)] text-[#A16207]',
      },
    ],
    [designs.length, user],
  )

  const quickActions = [
    {
      title: 'New AI Redesign',
      description: 'Upload a room image and generate fresh concepts instantly.',
      link: '/ai-redesign',
      icon: Sparkles,
      accent: 'from-[var(--primary)] to-[var(--accent-purple)]',
    },
    {
      title: 'Vastu Analysis',
      description: 'Check direction balance and improve room energy flow.',
      link: '/vastu',
      icon: Compass,
      accent: 'from-[var(--secondary)] to-emerald-400',
    },
    {
      title: 'Open 3D Visualizer',
      description: 'Arrange furniture layouts in a room-scale 3D view.',
      link: '/visualizer',
      icon: Box,
      accent: 'from-[var(--accent-purple)] to-blue-500',
    },
  ]

  const handleDelete = async (designId) => {
    setActiveDeleteId(designId)

    try {
      await deleteDesign(designId)
      setDesigns((current) => current.filter((design) => (design.id ?? design._id) !== designId))
      toast.success('Design deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete this design.')
    } finally {
      setActiveDeleteId(null)
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
        <section>
          <span className="badge-pill">Your design command center</span>
          <h1 className="mt-6 text-4xl font-bold text-[var(--dark)] sm:text-5xl">
            Welcome back, {user?.name ?? 'Designer'}! 👋
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            Track everything you&apos;ve created, revisit saved ideas, and jump into the next room transformation.
          </p>
        </section>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <motion.div key={stat.label} variants={itemVariants} className="glass-card rounded-[24px] p-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm font-medium text-[var(--text-secondary)]">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-[var(--dark)]">{stat.value}</p>
              </motion.div>
            )
          })}
        </motion.section>

        <section className="mt-16">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[var(--dark)]">Quick Actions</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Start a new flow in one click and keep your momentum going.
              </p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 grid gap-6 lg:grid-cols-3"
          >
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <motion.div key={action.title} variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Link
                    to={action.link}
                    className={`block overflow-hidden rounded-[24px] bg-gradient-to-br ${action.accent} p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.1)]`}
                  >
                    <div className="glass-card rounded-[23px] bg-white/85 p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dark)] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-2xl font-bold text-[var(--dark)]">{action.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{action.description}</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[var(--dark)]">Your Saved Designs</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Review your favorite concepts and keep only the ones you love.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="glass-card mt-8 flex min-h-64 items-center justify-center rounded-[28px]">
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text-secondary)]">
                <span className="loader-ring h-5 w-5 rounded-full border-2 border-slate-300 border-t-[var(--primary)]" />
                Loading your saved designs...
              </div>
            </div>
          ) : designs.length === 0 ? (
            <div className="glass-card mt-8 flex flex-col items-center rounded-[28px] px-6 py-14 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(255,107,53,0.1)] text-[var(--primary)]">
                <Image className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[var(--dark)]">No designs yet. Start your first AI redesign!</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
                Once you generate and save concepts, they show up here for quick review, download, or cleanup.
              </p>
              <Link to="/ai-redesign" className="btn-primary mt-8">
                Start Designing
              </Link>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {designs.map((design) => {
                const designId = design.id ?? design._id
                const imageUrl = design.thumbnail ?? design.imageUrl ?? '/placeholder-room.jpg'
                const dateValue = design.createdAt ?? design.date ?? new Date().toISOString()
                const styleLabel = design.style ?? design.category ?? 'AI Concept'
                const downloadUrl = design.downloadUrl ?? design.imageUrl ?? imageUrl

                return (
                  <motion.div key={designId} variants={itemVariants} className="glass-card overflow-hidden rounded-[24px]">
                    <img src={imageUrl} alt={design.name ?? 'Saved design'} className="h-56 w-full object-cover" />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-[var(--dark)]">{design.name ?? 'Untitled Design'}</h3>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {new Date(dateValue).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-[rgba(255,107,53,0.12)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                          {styleLabel}
                        </span>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <a href={downloadUrl} download className="btn-secondary flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(designId)}
                          disabled={activeDeleteId === designId}
                          className="btn-primary flex-1 bg-[var(--dark)] shadow-[0_12px_30px_rgba(26,26,46,0.2)] hover:bg-[var(--dark-card)]"
                        >
                          {activeDeleteId === designId ? (
                            <span className="flex items-center gap-2">
                              <span className="loader-ring h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                              Deleting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </section>
      </motion.main>
      <Footer />
    </div>
  )
}
