import { motion } from 'framer-motion'
import { Compass, UploadCloud } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const roomTypes = [
  { value: 'Bedroom', icon: '🛏️' },
  { value: 'Living Room', icon: '🛋️' },
  { value: 'Kitchen', icon: '🍳' },
  { value: 'Bathroom', icon: '🚿' },
  { value: 'Pooja Room', icon: '🪔' },
  { value: 'Office', icon: '💼' },
]

const directionLabels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const floorOptions = ['Ground Floor', '1st Floor', '2nd Floor', 'Other']
const roomElements = [
  { label: 'Bed', icon: '🛏️' },
  { label: 'Wardrobe', icon: '🚪' },
  { label: 'Study Table', icon: '📚' },
  { label: 'TV', icon: '📺' },
  { label: 'AC', icon: '❄️' },
  { label: 'Plants', icon: '🌿' },
  { label: 'Mirror', icon: '🪞' },
  { label: 'Toilet', icon: '🚽' },
  { label: 'Water Element', icon: '💧' },
  { label: 'Pooja Corner', icon: '🪔' },
]

function buildSegmentPath(index, innerRadius = 56, outerRadius = 124) {
  const startAngle = index * 45 - 90
  const endAngle = startAngle + 45
  const largeArcFlag = 0
  const x1 = Math.cos((Math.PI / 180) * startAngle) * outerRadius
  const y1 = Math.sin((Math.PI / 180) * startAngle) * outerRadius
  const x2 = Math.cos((Math.PI / 180) * endAngle) * outerRadius
  const y2 = Math.sin((Math.PI / 180) * endAngle) * outerRadius
  const x3 = Math.cos((Math.PI / 180) * endAngle) * innerRadius
  const y3 = Math.sin((Math.PI / 180) * endAngle) * innerRadius
  const x4 = Math.cos((Math.PI / 180) * startAngle) * innerRadius
  const y4 = Math.sin((Math.PI / 180) * startAngle) * innerRadius

  return `M ${x4} ${y4} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`
}

export default function VastuForm({
  values,
  onSelectRoomType,
  onSelectDirection,
  onFloorChange,
  onToggleElement,
  onFloorPlanChange,
  onSubmit,
  isSubmitting,
}) {
  const onDrop = (acceptedFiles) => {
    const [file] = acceptedFiles

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      onFloorPlanChange({
        name: file.name,
        dataUrl: reader.result,
      })
    }
    reader.readAsDataURL(file)
  }

  const onDropRejected = () => {
    toast.error('Please upload a JPG, PNG, or WEBP floor plan under 10MB.')
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-card rounded-[28px] p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(45,106,79,0.12)] text-[var(--secondary)]">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[var(--dark)]">Vastu Analysis Inputs</h3>
          <p className="text-sm text-[var(--text-secondary)]">Detailed analysis form lands in Part 2.</p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">Room Type selector</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roomTypes.map((room) => {
            const isActive = values.roomType === room.value

            return (
              <button
                key={room.value}
                type="button"
                onClick={() => onSelectRoomType(room.value)}
                className={`rounded-[22px] border px-4 py-4 text-left transition duration-300 ${
                  isActive
                    ? 'border-[var(--primary)] bg-[rgba(255,107,53,0.1)]'
                    : 'border-slate-200 bg-white/85 hover:border-[var(--primary)] hover:bg-[rgba(255,107,53,0.05)]'
                }`}
              >
                <div className="text-2xl">{room.icon}</div>
                <p className="mt-3 text-sm font-semibold text-[var(--dark)]">{room.value}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">House Facing Direction</h4>
        <div className="mt-4 rounded-[24px] border border-slate-200 bg-white/80 p-5">
          <div className="mx-auto max-w-sm">
            <svg viewBox="-150 -150 300 300" className="w-full">
              {directionLabels.map((direction, index) => {
                const isActive = values.facingDirection === direction
                const midAngle = index * 45 - 67.5
                const textX = Math.cos((Math.PI / 180) * midAngle) * 92
                const textY = Math.sin((Math.PI / 180) * midAngle) * 92

                return (
                  <g key={direction} onClick={() => onSelectDirection(direction)} className="cursor-pointer">
                    <path
                      d={buildSegmentPath(index)}
                      className={`transition duration-300 ${
                        isActive ? 'fill-[var(--primary)]' : 'fill-slate-100 hover:fill-[rgba(255,107,53,0.12)]'
                      }`}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      className={`text-sm font-bold ${isActive ? 'fill-white' : 'fill-slate-700'}`}
                    >
                      {direction}
                    </text>
                  </g>
                )
              })}
              <circle cx="0" cy="0" r="42" fill="#1A1A2E" />
              <text x="0" y="8" textAnchor="middle" className="fill-white text-base font-bold">
                <tspan className="font-display">DV</tspan>
              </text>
            </svg>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-[var(--text-secondary)]">
            Your house main door faces <span className="font-semibold text-[var(--primary)]">{values.facingDirection}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <label htmlFor="floorLevel" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
            Floor Level
          </label>
          <select
            id="floorLevel"
            value={values.floor}
            onChange={(event) => onFloorChange(event.target.value)}
            className="input-field"
          >
            {floorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--dark)]">Current Elements in Room</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {roomElements.map((element) => {
              const isChecked = values.elements.includes(element.label)

              return (
                <label
                  key={element.label}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition duration-300 ${
                    isChecked
                      ? 'border-[var(--secondary)] bg-[rgba(45,106,79,0.08)]'
                      : 'border-slate-200 bg-white/85 hover:border-[var(--secondary)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleElement(element.label)}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--secondary)] focus:ring-[var(--secondary)]"
                  />
                  <span className="text-xl">{element.icon}</span>
                  <span className="text-sm font-medium text-[var(--dark)]">{element.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-semibold text-[var(--dark)]">Upload Floor Plan (optional)</p>
        <button
          type="button"
          {...getRootProps()}
          className={`flex min-h-32 w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-6 py-5 text-center transition duration-300 ${
            isDragActive
              ? 'border-[var(--secondary)] bg-[rgba(45,106,79,0.08)]'
              : 'border-slate-300 bg-white/70 hover:border-[var(--secondary)]'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-8 w-8 text-[var(--secondary)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--dark)]">Upload floor plan image (optional)</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {values.floorPlanImage?.name ?? 'Add a layout snapshot for more context'}
          </p>
        </button>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="mt-8 flex w-full items-center justify-center rounded-full bg-[var(--secondary)] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(45,106,79,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--secondary-light)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="loader-ring h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
            Analyzing room...
          </span>
        ) : (
          'Analyze Vastu 🧭'
        )}
      </button>
    </motion.div>
  )
}
