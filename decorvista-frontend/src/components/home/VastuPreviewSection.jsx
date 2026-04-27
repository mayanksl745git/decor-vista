import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const directions = [
  { label: 'N', text: 'Career / Water', fill: '#5DADE2' },
  { label: 'NE', text: 'Knowledge', fill: '#FFD166' },
  { label: 'E', text: 'Health', fill: '#FF9F1C' },
  { label: 'SE', text: 'Kitchen / Fire', fill: '#F94144' },
  { label: 'S', text: 'Stability', fill: '#2D6A4F' },
  { label: 'SW', text: 'Master Bedroom', fill: '#9C6644' },
  { label: 'W', text: 'Children', fill: '#9CA3AF' },
  { label: 'NW', text: 'Guest / Air', fill: '#8ECAE6' },
]

const featureList = [
  'Compass-based furniture placement',
  'Bedroom/Kitchen/Toilet direction analysis',
  'Negativity zone warnings',
  'Vastu score with improvement plan',
  'Book a human Vastu consultant',
]

export default function VastuPreviewSection() {
  return (
    <section className="bg-[var(--dark)] text-white">
      <div className="section-shell">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card mx-auto w-full max-w-xl rounded-[28px] bg-white/10 p-6"
          >
            <svg viewBox="0 0 400 400" className="w-full">
              <circle cx="200" cy="200" r="170" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              <g transform="translate(200 200)">
                {directions.map((direction, index) => {
                  const startAngle = index * 45 - 90
                  const endAngle = startAngle + 45
                  const x1 = Math.cos((Math.PI / 180) * startAngle) * 170
                  const y1 = Math.sin((Math.PI / 180) * startAngle) * 170
                  const x2 = Math.cos((Math.PI / 180) * endAngle) * 170
                  const y2 = Math.sin((Math.PI / 180) * endAngle) * 170
                  const midAngle = startAngle + 22.5
                  const textX = Math.cos((Math.PI / 180) * midAngle) * 108
                  const textY = Math.sin((Math.PI / 180) * midAngle) * 108

                  return (
                    <g key={direction.label}>
                      <path d={`M 0 0 L ${x1} ${y1} A 170 170 0 0 1 ${x2} ${y2} Z`} fill={direction.fill} opacity="0.92" />
                      <text x={textX} y={textY - 6} fill="#FFFFFF" fontSize="20" fontWeight="700" textAnchor="middle">
                        {direction.label}
                      </text>
                      <text x={textX} y={textY + 18} fill="#FFFFFF" fontSize="11" textAnchor="middle">
                        {direction.text}
                      </text>
                    </g>
                  )
                })}
              </g>
              <circle cx="200" cy="200" r="44" fill="#FFFFFF" />
              <circle cx="200" cy="200" r="16" fill="#1A1A2E" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="badge-pill border-white/15 bg-white/10 text-white">Vastu-first intelligence</span>
            <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">Build harmony into every room layout</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              DecorVista blends directional energy insights with practical redesign advice so your home feels balanced,
              functional, and beautiful.
            </p>

            <div className="mt-8 space-y-4">
              {featureList.map((feature) => (
                <div key={feature} className="flex items-center gap-4">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] shadow-[0_0_20px_rgba(255,209,102,0.75)]">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                  <span className="text-sm font-medium text-white/90 sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/vastu" className="btn-primary mt-10">
              Analyze My Home
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
