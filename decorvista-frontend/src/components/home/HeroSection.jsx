import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '10K+', label: 'Designs' },
  { value: '500+', label: 'Happy Users' },
  { value: '98%', label: 'Vastu Accuracy' },
]

export default function HeroSection() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="floating-orb left-[-8rem] top-20 h-72 w-72 bg-[rgba(255,107,53,0.28)]" />
      <div className="floating-orb right-[-6rem] top-32 h-80 w-80 bg-[rgba(123,94,167,0.24)] [animation-delay:2s]" />
      <div className="floating-orb bottom-0 left-1/3 h-72 w-72 bg-[rgba(82,183,136,0.22)] [animation-delay:4s]" />

      <div className="section-shell flex min-h-screen items-center py-14">
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10"
          >
            <span className="badge-pill">🏠 AI-Powered Interior Design</span>
            <h1 className="mt-8 max-w-3xl text-5xl font-black leading-tight text-[var(--dark)] sm:text-6xl lg:text-7xl">
              Transform Your Space With <span className="gradient-text">Intelligent Design</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              Reimagine every room with AI redesigns, align layouts with Vastu recommendations, and preview furniture in a
              stunning 3D planner built for modern homeowners.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary">
                Start Designing Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button type="button" onClick={scrollToHowItWorks} className="btn-secondary">
                <PlayCircle className="mr-2 h-4 w-4" />
                Watch Demo
              </button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card px-5 py-4">
                  <p className="text-2xl font-bold text-[var(--dark)]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-[var(--gradient-hero)] opacity-30 blur-3xl" />
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-4 sm:p-5">
              <div className="rounded-[1.5rem] bg-[var(--dark-card)]/90 p-3">
                <img
                  src="/Images/ai5.jpg"
                  alt="DecorVista AI room preview"
                  className="h-[420px] w-full rounded-[1.25rem] object-cover"
                />
              </div>

              <div className="absolute left-4 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--dark)] shadow-lg">
                ✨ AI Redesign
              </div>
              <div className="absolute bottom-8 right-4 rounded-full bg-[var(--secondary)] px-4 py-2 text-sm font-semibold text-white shadow-lg">
                🧭 Vastu Score: 92%
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
