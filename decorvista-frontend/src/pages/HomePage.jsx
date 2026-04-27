import { motion } from 'framer-motion'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import CTASection from '../components/home/CTASection'
import FeaturesSection from '../components/home/FeaturesSection'
import HeroSection from '../components/home/HeroSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import TeamSection from '../components/home/TeamSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import VastuPreviewSection from '../components/home/VastuPreviewSection'

export default function HomePage() {
  return (
    <div className="page-shell">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <VastuPreviewSection />
        <TestimonialsSection />
        <TeamSection />
        <CTASection />
      </motion.main>
      <Footer />
    </div>
  )
}
