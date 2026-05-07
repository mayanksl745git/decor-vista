import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, ChevronRight, Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import { analyzeRoom, customizeDesign, generateDesigns } from '../services/aiService'
import { saveDesign } from '../services/designService'

const styleOptions = [
  'Modern Minimalist',
  'Scandinavian',
  'Luxury',
  'Bohemian',
  'Industrial',
  'Traditional Indian',
  'Contemporary',
  'Coastal'
]

const wallColors = ['#FFFFFF', '#F5F5F5', '#E8F4F8', '#FFF3E0', '#4CAF50']
const floorColors = ['#D2B48C', '#8B4513', '#808080', '#F5F5DC', '#2C2C2C']
const ceilingColors = ['#FFFFFF', '#FFFDE7', '#E0E0E0']

function StepIndicator({ step }) {
  const steps = [
    { number: 1, label: 'Upload' },
    { number: 2, label: 'Analyze' },
    { number: 3, label: 'Generate' },
    { number: 4, label: 'Customize' }
  ]

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
      {steps.map((s, idx) => {
        const isActive = s.number === step
        const isCompleted = s.number < step

        return (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#7B5EA7] text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : s.number}
              </div>
              <span className="text-xs text-gray-600 hidden sm:block">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${idx < step - 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card rounded-2xl p-10 text-center max-w-md">
        <div className="loader-ring w-16 h-16 rounded-full border-4 border-white/30 border-t-[#D4AF37] mx-auto mb-6" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
        <p className="text-sm text-gray-600">This may take 10-20 seconds...</p>
      </div>
    </div>
  )
}

export default function AIRedesignPage() {
  const [step, setStep] = useState(1)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [generatedImages, setGeneratedImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [customizations, setCustomizations] = useState({
    style: 'Modern Minimalist',
    keepItems: [],
    removeItemsText: '',
    wallColor: '#FFFFFF',
    floorColor: '#D2B48C',
    ceilingColor: '#FFFFFF',
    customNotes: ''
  })
  const [customizedImageUrl, setCustomizedImageUrl] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [activeRecommendationTab, setActiveRecommendationTab] = useState('budget')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setUploadedImage(file)
        setImagePreviewUrl(URL.createObjectURL(file))
      }
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  })

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const handleAnalyze = async () => {
    if (!uploadedImage) return
    setIsLoading(true)
    setLoadingMessage('Analyzing your room with AI...')
    try {
      const formData = new FormData()
      formData.append('image', uploadedImage)
      const response = await analyzeRoom(formData)
      setAnalysisResult(response)
      setStep(2)
      toast.success('Room analyzed successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze room. Make sure Flask server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!analysisResult) return
    setIsLoading(true)
    setLoadingMessage('Creating 3 design variations...')
    try {
      const response = await generateDesigns({
        analysis: analysisResult.analysis,
        room_type: analysisResult.room_type,
        style: customizations.style
      })
      setGeneratedImages(response.images || [])
      setStep(3)
      toast.success('Designs generated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate designs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomize = async () => {
    if (!analysisResult || selectedImageIndex === null) return
    setIsLoading(true)
    setLoadingMessage('Generating your customized design...')
    try {
      const response = await customizeDesign({
        analysis: analysisResult.analysis,
        room_type: analysisResult.room_type,
        style: customizations.style,
        keep_items: customizations.keepItems,
        remove_items: customizations.removeItemsText.split(',').map(s => s.trim()).filter(Boolean),
        wall_color: customizations.wallColor,
        floor_color: customizations.floorColor,
        ceiling_color: customizations.ceilingColor,
        custom_notes: customizations.customNotes
      })
      setCustomizedImageUrl(response.image_url)
      setRecommendations(response.recommendations)
      setStep(4)
      toast.success('Custom design generated!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to customize design')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!customizedImageUrl) return
    setIsSaving(true)
    try {
      await saveDesign({
        imageUrl: customizedImageUrl,
        thumbnail: customizedImageUrl,
        style: customizations.style,
        name: `Custom ${customizations.style} Design`,
        roomType: analysisResult?.room_type || 'Room'
      })
      toast.success('Design saved to profile!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save design')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setUploadedImage(null)
    setImagePreviewUrl(null)
    setAnalysisResult(null)
    setGeneratedImages([])
    setSelectedImageIndex(null)
    setCustomizations({
      style: 'Modern Minimalist',
      keepItems: [],
      removeItemsText: '',
      wallColor: '#FFFFFF',
      floorColor: '#D2B48C',
      ceilingColor: '#FFFFFF',
      customNotes: ''
    })
    setCustomizedImageUrl(null)
    setRecommendations(null)
  }

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <main className="section-shell">
        <section className="mb-8">
          <span className="badge-pill">AI Redesign</span>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            Transform Your Room with AI
          </h1>
        </section>

        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Room Photo</h2>
                  
                  {!imagePreviewUrl ? (
                    <div
                      {...getRootProps()}
                      className={`min-h-80 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragActive
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                          : 'border-gray-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-16 h-16 text-[#D4AF37] mb-4" />
                      <p className="text-lg font-semibold text-gray-900">Drag & drop your room photo or click to browse</p>
                      <p className="text-sm text-gray-600 mt-2">JPG, PNG, or WEBP up to 10MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={imagePreviewUrl} alt="Uploaded room" className="w-full h-96 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImage(null)
                          setImagePreviewUrl(null)
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {imagePreviewUrl && (
                    <>
                      <div className="mt-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Room Style</label>
                        <select
                          value={customizations.style}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, style: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                        >
                          {styleOptions.map(style => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FF8C00] text-white rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        Analyze This Room <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Room</h3>
                  {imagePreviewUrl && (
                    <img src={imagePreviewUrl} alt="Original" className="w-full h-80 object-cover rounded-xl" />
                  )}
                </div>

                <div className="glass-card rounded-2xl p-6 border-l-4 border-[#D4AF37]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">AI Design Analysis</h3>
                    {analysisResult?.room_type && (
                      <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-sm font-semibold">
                        Room Type: {analysisResult.room_type}
                      </span>
                    )}
                  </div>
                  <div className="mb-6">
                    <p className="text-sm leading-relaxed text-gray-700">
                      {analysisResult?.analysis || 'AI analysis will appear here...'}
                    </p>
                  </div>
                  {analysisResult?.furniture_items?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Detected Furniture Items</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.furniture_items.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FF8C00] text-white rounded-xl text-lg font-semibold hover:opacity-90"
                  >
                    Generate 3 Design Variations <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">✨ Generated Designs (Click to Select for Customization)</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {generatedImages.length > 0 ? (
                    generatedImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all border-4 ${
                          selectedImageIndex === idx ? 'border-green-500 scale-105' : 'border-transparent hover:border-[#D4AF37]'
                        }`}
                      >
                        <img
                          src={img.url || '/placeholder-room.jpg'}
                          alt={`Variation ${idx + 1}`}
                          className="w-full h-80 object-cover"
                        />
                        {selectedImageIndex === idx && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Selected
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {img.style || 'Variation'} {idx + 1}
                        </div>
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map(i => (
                      <div key={i} className="rounded-2xl bg-gray-100 h-80 flex items-center justify-center">
                        <span className="text-gray-400">Design {i}</span>
                      </div>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={selectedImageIndex === null}
                  className="w-full mt-8 max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FF8C00] text-white rounded-xl text-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Customize Selected Design <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Original Room</h2>
                  {imagePreviewUrl && (
                    <img src={imagePreviewUrl} alt="Original" className="w-full max-w-md h-64 object-cover rounded-xl" />
                  )}
                </div>

                <div className="glass-card rounded-2xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">🎨 Customize Your Design</h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">🏠 Room Style</label>
                      <select
                        value={customizations.style}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, style: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                      >
                        {styleOptions.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>

                    {analysisResult?.furniture_items?.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">🪑 Select Furniture & Elements to Keep</label>
                        <div className="grid grid-cols-2 gap-3">
                          {analysisResult.furniture_items.map((item, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white/70 border border-gray-200">
                              <input
                                type="checkbox"
                                checked={customizations.keepItems.includes(item)}
                                onChange={(e) => {
                                  setCustomizations(prev => ({
                                    ...prev,
                                    keepItems: e.target.checked
                                      ? [...prev.keepItems, item]
                                      : prev.keepItems.filter(i => i !== item)
                                  }))
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                              />
                              <span className="text-sm text-gray-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">🗑️ Remove Specific Items</label>
                      <input
                        type="text"
                        value={customizations.removeItemsText}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, removeItemsText: e.target.value }))}
                        placeholder="Enter items to remove (comma-separated)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-6">🎨 Choose Colors</label>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Wall Color</label>
                        <div className="flex gap-2 mb-3">
                          {wallColors.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setCustomizations(prev => ({ ...prev, wallColor: color }))}
                              className={`w-10 h-10 rounded-xl border-2 ${customizations.wallColor === color ? 'border-[#D4AF37]' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          value={customizations.wallColor}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, wallColor: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Floor Color</label>
                        <div className="flex gap-2 mb-3">
                          {floorColors.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setCustomizations(prev => ({ ...prev, floorColor: color }))}
                              className={`w-10 h-10 rounded-xl border-2 ${customizations.floorColor === color ? 'border-[#D4AF37]' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          value={customizations.floorColor}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, floorColor: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Ceiling Color</label>
                        <div className="flex gap-2 mb-3">
                          {ceilingColors.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setCustomizations(prev => ({ ...prev, ceilingColor: color }))}
                              className={`w-10 h-10 rounded-xl border-2 ${customizations.ceilingColor === color ? 'border-[#D4AF37]' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          value={customizations.ceilingColor}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, ceilingColor: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">📝 Additional Customization Notes</label>
                    <textarea
                      value={customizations.customNotes}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, customNotes: e.target.value }))}
                      rows="4"
                      placeholder="Describe any specific requirements... e.g., 'Add a reading corner' or 'Make it suitable for kids'"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCustomize}
                    className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-lg font-semibold hover:opacity-90"
                  >
                    ✨ Generate Customized Design
                  </button>
                </div>

                {customizedImageUrl && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Customized Design</h2>
                    <div className="glass-card rounded-2xl p-6">
                      <img src={customizedImageUrl} alt="Customized" className="w-full max-w-2xl mx-auto h-96 object-cover rounded-xl" />
                      <div className="flex flex-col sm:flex-row gap-4 mt-6 max-w-md mx-auto">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex-1 px-6 py-3 bg-[#D4AF37] text-white rounded-xl font-semibold hover:bg-[#b8941f] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <span className="loader-ring h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                          ) : null}
                          💾 Save Design
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                        >
                          🔄 Start Over
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {recommendations && (
                  <div className="glass-card rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">🛍️ Shop This Look</h2>
                    <div className="flex gap-3 mb-6">
                      {['budget', 'midrange', 'luxury'].map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveRecommendationTab(tab)}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeRecommendationTab === tab
                              ? 'bg-[#D4AF37] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}-Friendly
                        </button>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {(recommendations[activeRecommendationTab] || []).map((item, idx) => (
                        <div key={idx} className="glass-card rounded-xl p-4">
                          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-400 mb-3">
                            {item.name?.charAt(0) || '?'}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.name || 'Product'}</h4>
                          <p className="text-[#D4AF37] font-bold mb-2">{item.price || '$0'}</p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.category || 'Furniture'}</span>
                          <button
                            type="button"
                            className="w-full mt-3 px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg text-sm font-semibold hover:bg-[#D4AF37] hover:text-white"
                          >
                            Shop Now <ChevronRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </div>
  )
}
