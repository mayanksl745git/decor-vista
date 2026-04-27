import { motion } from 'framer-motion'
import { Compass, Download, UploadCloud } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Upload Your Room Photo',
    description: 'Start with an existing room image and unlock instant design intelligence.',
    icon: UploadCloud,
  },
  {
    number: '02',
    title: 'Choose AI Style or Run Vastu Analysis',
    description: 'Mix creative redesign suggestions with practical orientation guidance for every room.',
    icon: Compass,
  },
  {
    number: '03',
    title: 'Download, Save, or Book a Consultant',
    description: 'Keep your best concepts, share them, or get expert help to bring the plan to life.',
    icon: Download,
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

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative">
      <div className="section-shell">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-heading">How DecorVista Works</h2>
          <p className="section-subtitle">
            Go from an empty idea to an actionable interior plan through three guided, high-impact steps.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mt-16 grid gap-8 lg:grid-cols-3"
        >
          <div className="absolute left-[16%] right-[16%] top-16 hidden h-1 rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent-purple)] to-[var(--secondary)] lg:block" />

          {steps.map((step) => {
            const Icon = step.icon

            return (
              <motion.div key={step.number} variants={itemVariants} className="relative">
                <div className="glass-card flex h-full flex-col items-start rounded-[24px] p-8">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dark)] text-xl font-bold text-white shadow-lg">
                    {step.number}
                  </div>
                  <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(255,107,53,0.12)] text-[var(--primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[var(--dark)]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
