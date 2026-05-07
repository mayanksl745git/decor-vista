import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sangwani',
    city: 'Mumbai',
    initials: 'PS',
    color: 'bg-[var(--primary)]',
    quote:
      'The Vastu analyzer completely changed how I arranged my bedroom. Sleep quality improved noticeably after following the recommendations!',
  },
  {
    name: 'Rohit Kalra',
    city: 'Delhi',
    initials: 'RK',
    color: 'bg-[var(--secondary)]',
    quote:
      'AI redesign blew my mind. It showed me a stunning boho-style living room from my old cluttered photo. Hired a decorator based on that vision!',
  },
  {
    name: 'Sneha Mahajan',
    city: 'Bengaluru',
    initials: 'SM',
    color: 'bg-[var(--accent-purple)]',
    quote: 'The 3D visualizer saved me from buying the wrong sofa. Tried 10 layouts in under 5 minutes!',
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

export default function TestimonialsSection() {
  return (
    <section className="relative">
      <div className="section-shell">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-heading">What Our Users Say</h2>
          <p className="section-subtitle">
            Homeowners trust DecorVista to combine beauty, practicality, and confidence before making design decisions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass-card rounded-[24px] p-8"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${testimonial.color}`}>
                  {testimonial.initials}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--dark)]">{testimonial.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{testimonial.city}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-1 text-[var(--accent)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <p className="mt-6 text-sm leading-7 text-[var(--text-secondary)]">{testimonial.quote}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
