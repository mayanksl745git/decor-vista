import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="pb-20">
      <div className="section-shell py-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-[32px] bg-[image:var(--gradient-ai)] px-6 py-14 text-center text-white shadow-[0_24px_70px_rgba(123,94,167,0.25)] sm:px-12"
        >
          <h2 className="text-4xl font-bold sm:text-5xl">Ready to Transform Your Space?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
            Join thousands of homeowners designing smarter with AI
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--dark)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
            >
              Get Started Free
            </Link>
            <Link
              to="/visualizer"
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Try 3D Visualizer
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
