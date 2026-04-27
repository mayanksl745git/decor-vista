import { motion } from 'framer-motion'
import { Eye, Filter } from 'lucide-react'
import { useState } from 'react'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

const categories = ['All', 'Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Balcony', 'Office']

const galleryData = [
  // Bedroom
  { id: 1, category: 'Bedroom', style: 'Modern Minimalist', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600' },
  { id: 2, category: 'Bedroom', style: 'Scandinavian', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600' },
  { id: 3, category: 'Bedroom', style: 'Luxury Contemporary', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600' },
  { id: 4, category: 'Bedroom', style: 'Bohemian', image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600' },
  { id: 5, category: 'Bedroom', style: 'Traditional Indian', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600' },
  
  // Living Room
  { id: 6, category: 'Living Room', style: 'Modern Minimalist', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { id: 7, category: 'Living Room', style: 'Industrial', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600' },
  { id: 8, category: 'Living Room', style: 'Luxury Contemporary', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600' },
  { id: 9, category: 'Living Room', style: 'Scandinavian', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600' },
  { id: 10, category: 'Living Room', style: 'Japandi', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600' },

  // Kitchen
  { id: 11, category: 'Kitchen', style: 'Modern Minimalist', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600' },
  { id: 12, category: 'Kitchen', style: 'Industrial', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600' },
  { id: 13, category: 'Kitchen', style: 'Luxury Contemporary', image: 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=600' },
  { id: 14, category: 'Kitchen', style: 'Scandinavian', image: 'https://images.unsplash.com/photo-1556911223-e250e3346227?w=600' },
  
  // Office
  { id: 15, category: 'Office', style: 'Modern Minimalist', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600' },
  { id: 16, category: 'Office', style: 'Industrial', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600' },
  { id: 17, category: 'Office', style: 'Scandinavian', image: 'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=600' },
  
  // Balcony
  { id: 18, category: 'Balcony', style: 'Bohemian', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600' },
  { id: 19, category: 'Balcony', style: 'Modern Minimalist', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600' },
  
  // Bathroom
  { id: 20, category: 'Bathroom', style: 'Luxury Contemporary', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600' },
  { id: 21, category: 'Bathroom', style: 'Modern Minimalist', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600' },
]

export default function DesignGalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredData = activeCategory === 'All' 
    ? galleryData 
    : galleryData.filter(item => item.category === activeCategory)

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="section-shell"
      >
        <section className="text-center mb-12">
          <span className="badge-pill">Inspiration Gallery</span>
          <h1 className="mt-6 text-4xl font-bold text-[var(--dark)] sm:text-6xl">Explore our curated interior concepts</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-7 text-[var(--text-secondary)]">
            Discover a world of styles from around the globe. Filter by room type and find the perfect inspiration for your next redesign.
          </p>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-2 mr-4 px-4 py-2 bg-slate-100 rounded-full text-slate-500 text-sm font-bold">
            <Filter className="h-4 w-4" /> Filter
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-[var(--primary)] text-white shadow-lg shadow-[rgba(255,107,53,0.3)]' 
                  : 'bg-white text-[var(--text-secondary)] hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredData.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              key={item.id}
              className="glass-card group relative rounded-[32px] overflow-hidden aspect-[4/5]"
            >
              <img 
                src={item.image} 
                alt={item.style} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
                  {item.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-4">{item.style}</h3>
                <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-[var(--dark)] text-sm font-bold hover:bg-[var(--primary)] hover:text-white transition-colors">
                  <Eye className="h-4 w-4" /> View Design
                </button>
              </div>
              
              {/* Static overlay for category */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[var(--dark)] group-hover:opacity-0 transition-opacity">
                {item.category}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xl text-[var(--text-secondary)]">No designs found in this category.</p>
          </div>
        )}
      </motion.main>
      <Footer />
    </div>
  )
}
