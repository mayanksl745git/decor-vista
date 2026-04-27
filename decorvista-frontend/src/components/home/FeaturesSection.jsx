import { motion } from 'framer-motion'
import { Box, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    title: 'AI Room Redesign',
    description: 'Generate polished interior concepts powered by Gemini guidance and Stable Diffusion visuals in seconds.',
    icon: Sparkles,
    link: '/ai-redesign',
    buttonLabel: 'Try Now',
    gradient: 'from-[var(--primary)] to-[var(--accent-purple)]',
    features: ['Multiple styles', 'HD output', 'Downloadable'],
  },
  {
    title: 'Vastu Shastra Analyzer',
    description: 'Evaluate room orientation, balance energy zones, and get tailored recommendations with our core USP.',
    icon: Compass,
    link: '/vastu',
    buttonLabel: 'Check Vastu',
    gradient: 'from-[var(--secondary)] to-teal-400',
    features: ['Vastu Score', 'Room analysis', 'Expert booking', 'Renovation suggestions'],
    badge: '⭐ Core USP',
  },
  {
    title: '3D Room Visualizer',
    description: 'Build layouts interactively with real-time feedback before you spend on furniture or renovations.',
    icon: Box,
    link: '/visualizer',
    buttonLabel: 'Open Visualizer',
    gradient: 'from-[var(--accent-purple)] to-blue-500',
    features: ['Drag & drop', 'Real-time shadows', 'Export layout'],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative">
      <div className="section-shell">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-heading">Everything You Need to Design Smarter</h2>
          <p className="section-subtitle">
            Switch seamlessly between AI visual ideas, Vastu intelligence, and interactive room planning inside one premium experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {featureCards.map((card) => {
            const Icon = card.icon

            return (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`glass-card overflow-hidden rounded-[24px]`}
              >
                <div className={`h-full bg-gradient-to-br ${card.gradient} p-[1px]`}>
                  <div className="flex h-full flex-col rounded-[23px] bg-white/90 p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dark)]/90 text-white shadow-lg">
                        <Icon className="h-6 w-6" />
                      </div>
                      {card.badge ? (
                        <span className="rounded-full bg-[var(--accent)]/20 px-3 py-1 text-xs font-semibold text-[var(--dark)]">
                          {card.badge}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-7 text-2xl font-bold text-[var(--dark)]">{card.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{card.description}</p>

                    <div className="mt-6 space-y-3">
                      {card.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm font-medium text-[var(--dark)]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Link to={card.link} className="btn-primary mt-8 w-fit">
                      {card.buttonLabel}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
