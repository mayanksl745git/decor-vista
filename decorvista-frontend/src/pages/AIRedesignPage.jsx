import { motion } from 'framer-motion'
import { Check, ImagePlus, Link2, Sparkles, UploadCloud, Wand2, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import { redesignRoom } from '../services/aiService'
import { saveDesign } from '../services/designService'

const loadingMessages = ['Analyzing your room...', 'Applying style...', 'Adding finishing touches...', 'Almost done...']

const styleOptions = [
  { name: 'Modern Minimalist', icon: '✨' },
  { name: 'Bohemian', icon: '🌿' },
  { name: 'Scandinavian', icon: '🕯️' },
  { name: 'Industrial', icon: '🏗️' },
  { name: 'Traditional Indian', icon: '🪔' },
  { name: 'Luxury Contemporary', icon: '💎' },
  { name: 'Rustic/Farmhouse', icon: '🌾' },
  { name: 'Japandi', icon: '🍃' },
]

const colorPreferences = ['No Preference', 'Warm Tones', 'Cool Tones', 'Earthy', 'Monochrome']
const roomTypes = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room']

function resolveImageUrl(payload) {
  return (
    payload?.imageUrl ??
    payload?.outputImage ??
    payload?.generatedImage ??
    payload?.result?.imageUrl ??
    payload?.data?.imageUrl ??
    payload?.data?.outputImage ??
    payload?.data?.generatedImage ??
    ''
  )
}

export default function AIRedesignPage() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [useImageUrl, setUseImageUrl] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [colorPreference, setColorPreference] = useState('No Preference')
  const [roomType, setRoomType] = useState('Living Room')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [comparePosition, setComparePosition] = useState(50)
  const compareRef = useRef(null)

  const previewImage = useMemo(() => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile)
    }

    return imageUrlInput.trim()
  }, [imageUrlInput, uploadedFile])

  useEffect(() => {
    if (uploadedFile) {
      const objectUrl = URL.createObjectURL(uploadedFile)
      return () => URL.revokeObjectURL(objectUrl)
    }

    return undefined
  }, [uploadedFile])

  useEffect(() => {
    if (!isGenerating) {
      setLoadingMessageIndex(0)
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length)
    }, 2000)

    return () => window.clearInterval(intervalId)
  }, [isGenerating])

  useEffect(() => {
    compareRef.current?.style.setProperty('--compare-position', `${comparePosition}%`)
  }, [comparePosition])

  const onDrop = (acceptedFiles) => {
    const [file] = acceptedFiles

    if (!file) {
      return
    }

    setUploadedFile(file)
    setUseImageUrl(false)
    setGeneratedImage('')
  }

  const onDropRejected = (fileRejections) => {
    const rejection = fileRejections[0]
    const message = rejection?.errors?.[0]?.message ?? 'Please upload a JPG, PNG, or WEBP image under 10MB.'
    toast.error(message)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const hasImageSource = Boolean(uploadedFile || imageUrlInput.trim())

  const handleRemoveImage = () => {
    setUploadedFile(null)
    setImageUrlInput('')
    setGeneratedImage('')
  }

  const handleGenerate = async () => {
    if (!hasImageSource || !selectedStyle) {
      toast.error('Add an image and choose a style before generating.')
      return
    }

    setIsGenerating(true)
    setGeneratedImage('')

    try {
      const formData = new FormData()

      if (uploadedFile) {
        formData.append('image', uploadedFile)
      }

      if (!uploadedFile && imageUrlInput.trim()) {
        formData.append('imageUrl', imageUrlInput.trim())
      }

      formData.append('style', selectedStyle)
      formData.append('colorPreference', colorPreference)
      formData.append('roomType', roomType)
      formData.append('prompt', customPrompt)

      const response = await redesignRoom(formData)
      const nextImage = resolveImageUrl(response)

      if (!nextImage) {
        throw new Error('No redesigned image returned by the service.')
      }

      setGeneratedImage(nextImage)
      setComparePosition(50)
      toast.success('Your room redesign is ready!')
    } catch (error) {
      toast.error(error.response?.data?.message ?? error.message ?? 'Unable to redesign your room right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDesign = async () => {
    if (!generatedImage) {
      return
    }

    setIsSaving(true)

    try {
      await saveDesign({
        imageUrl: generatedImage,
        style: selectedStyle,
        roomType,
        name: `Design ${Date.now()}`,
      })

      toast.success('Design saved to your profile.')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to save this design right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) {
      return
    }

    const anchor = document.createElement('a')
    anchor.href = generatedImage
    anchor.download = `decorvista-${selectedStyle.toLowerCase().replaceAll(' ', '-')}-${Date.now()}.jpg`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  const handleTryAnotherStyle = () => {
    setSelectedStyle('')
    setGeneratedImage('')
    setComparePosition(50)
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
          <span className="badge-pill">AI Redesign</span>
          <h1 className="mt-6 text-4xl font-bold text-[var(--dark)] sm:text-5xl">Redesign your room with AI-powered interior styling</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
            Upload your space, choose a design direction, and generate polished before-and-after concepts tailored to your style.
          </p>
        </section>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_1.02fr]">
          <div className="space-y-6">
            <div className="glass-card rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,107,53,0.12)] text-[var(--primary)]">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--dark)]">Step 1: Upload Room Photo</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Use JPG, PNG, or WEBP up to 10MB.</p>
                </div>
              </div>

              {!previewImage ? (
                <button
                  type="button"
                  {...getRootProps()}
                  className={`mt-6 flex min-h-64 w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-6 py-8 text-center transition duration-300 ${
                    isDragActive
                      ? 'border-[var(--primary)] bg-[rgba(255,107,53,0.08)]'
                      : 'border-slate-300 bg-white/70 hover:border-[var(--primary)] hover:bg-[rgba(255,107,53,0.05)]'
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="h-12 w-12 text-[var(--primary)]" />
                  <p className="mt-5 max-w-md text-base font-semibold text-[var(--dark)]">
                    Drag & drop your room photo here or click to browse
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">High-resolution room photos work best for accurate styling.</p>
                </button>
              ) : (
                <div className="relative mt-6 overflow-hidden rounded-[24px] border border-white/60">
                  <img src={previewImage} alt="Uploaded room" className="h-72 w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dark)]/85 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setUseImageUrl((current) => !current)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
              >
                <Link2 className="h-4 w-4" />
                {useImageUrl ? 'Hide image URL input' : 'Or paste image URL'}
              </button>

              {useImageUrl ? (
                <div className="mt-4">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(event) => {
                      setImageUrlInput(event.target.value)
                      setUploadedFile(null)
                      setGeneratedImage('')
                    }}
                    placeholder="https://example.com/your-room-image.jpg"
                    className="input-field"
                  />
                </div>
              ) : null}
            </div>

            <div className="glass-card rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(123,94,167,0.12)] text-[var(--accent-purple)]">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--dark)]">Step 2: Choose Interior Style</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Select Your Style</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {styleOptions.map((style) => {
                  const isSelected = selectedStyle === style.name

                  return (
                    <button
                      key={style.name}
                      type="button"
                      onClick={() => setSelectedStyle(style.name)}
                      className={`relative rounded-[22px] border px-4 py-4 text-left transition duration-300 ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[rgba(255,107,53,0.1)] shadow-[0_16px_35px_rgba(255,107,53,0.12)]'
                          : 'border-slate-200 bg-white/85 hover:border-[var(--primary)] hover:bg-[rgba(255,107,53,0.05)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-2xl">{style.icon}</p>
                          <p className="mt-3 text-sm font-semibold text-[var(--dark)]">{style.name}</p>
                        </div>
                        {isSelected ? (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="glass-card rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,209,102,0.22)] text-[#A16207]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--dark)]">Step 3: Additional Options</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Fine-tune the mood and functional intent.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="colorPreference" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                    Color Preference
                  </label>
                  <select
                    id="colorPreference"
                    value={colorPreference}
                    onChange={(event) => setColorPreference(event.target.value)}
                    className="input-field"
                  >
                    {colorPreferences.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="roomType" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                    Room Type
                  </label>
                  <select id="roomType" value={roomType} onChange={(event) => setRoomType(event.target.value)} className="input-field">
                    {roomTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="customPrompt" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                  Any specific changes you want?
                </label>
                <textarea
                  id="customPrompt"
                  value={customPrompt}
                  maxLength={200}
                  onChange={(event) => setCustomPrompt(event.target.value)}
                  placeholder="Add any special requests like brighter lighting, more storage, or a cozier seating layout."
                  className="input-field min-h-32 resize-none"
                />
                <p className="mt-2 text-right text-xs font-medium text-[var(--text-secondary)]">{customPrompt.length}/200</p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!hasImageSource || !selectedStyle || isGenerating}
                className="mt-6 flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(255,107,53,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-3">
                    <span className="loader-ring h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
                    {loadingMessages[loadingMessageIndex]}
                  </span>
                ) : (
                  '✨ Redesign My Room'
                )}
              </button>
            </div>
          </div>

          <div className="glass-card flex min-h-[780px] flex-col rounded-[28px] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(45,106,79,0.12)] text-[var(--secondary)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--dark)]">AI Output</h2>
                <p className="text-sm text-[var(--text-secondary)]">Preview your transformed room and compare results.</p>
              </div>
            </div>

            {!generatedImage ? (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-300 bg-white/60 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(255,107,53,0.1)] text-[var(--primary)]">
                  <Sparkles className="h-9 w-9" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[var(--dark)]">Your redesigned room will appear here</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                  Upload a room photo, pick your favorite style, and generate a polished concept with before-and-after comparison.
                </p>
              </div>
            ) : (
              <>
                <div ref={compareRef} className="compare-shell relative mt-6 h-[520px] overflow-hidden rounded-[24px] bg-slate-100">
                  <img src={previewImage} alt="Original room" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="compare-after-layer absolute inset-y-0 left-0 overflow-hidden">
                    <img src={generatedImage} alt="Redesigned room" className="h-full w-full min-w-full object-cover" />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 compare-handle w-1 -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.75)]" />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-[var(--dark)]/80 px-3 py-1 text-xs font-semibold text-white">
                    Before
                  </div>
                  <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white">
                    After
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparePosition}
                    onChange={(event) => setComparePosition(Number(event.target.value))}
                    className="compare-range absolute inset-x-4 bottom-5 z-20 h-6 cursor-ew-resize"
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleSaveDesign}
                    disabled={isSaving}
                    className="btn-primary w-full"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="loader-ring h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </span>
                    ) : (
                      '💾 Save to Profile'
                    )}
                  </button>
                  <button type="button" onClick={handleDownload} className="btn-secondary w-full">
                    ⬇️ Download
                  </button>
                  <button type="button" onClick={handleTryAnotherStyle} className="btn-secondary w-full border-[var(--accent-purple)] text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]">
                    🔄 Try Another Style
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  )
}
