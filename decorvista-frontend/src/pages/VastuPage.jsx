import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import ConsultancyBooking from '../components/vastu/ConsultancyBooking'
import VastuForm from '../components/vastu/VastuForm'
import VastuScore from '../components/vastu/VastuScore'
import { analyzeVastu } from '../services/vastuService'

const tabs = [
  { id: 'analyze', label: '🔍 Analyze Room' },
  { id: 'guide', label: '📖 Room Guide' },
  { id: 'book', label: '📅 Book Consultant' },
]

const guideDirections = [
  {
    direction: 'North',
    short: 'N',
    color: '#5DADE2',
    element: 'Career & Water',
    rule: 'Place aquarium, water fountain. Good for study and work growth.',
    detail: 'North enhances flow, networking, and career momentum when kept open and active.',
  },
  {
    direction: 'North-East',
    short: 'NE',
    color: '#FFD166',
    element: 'Sacred / Knowledge',
    rule: 'Pooja room, meditation. Keep light and clutter-free.',
    detail: 'The most sacred direction. Ideal for devotion, spiritual calm, and mindful routines.',
  },
  {
    direction: 'East',
    short: 'E',
    color: '#FF9F1C',
    element: 'Health & Sunrise',
    rule: 'Best for main entrance. Represents health and morning energy.',
    detail: 'East brings clarity, vitality, and natural light into daily routines.',
  },
  {
    direction: 'South-East',
    short: 'SE',
    color: '#F94144',
    element: 'Fire / Kitchen',
    rule: 'Kitchen here is ideal. Never place bedroom in SE.',
    detail: 'Use this zone for cooking or active energy, but avoid restful furniture placement.',
  },
  {
    direction: 'South',
    short: 'S',
    color: '#2D6A4F',
    element: 'Stability',
    rule: 'Avoid main door. Good for master bedroom.',
    detail: 'South supports strong grounding, discipline, and mature decision making.',
  },
  {
    direction: 'South-West',
    short: 'SW',
    color: '#9C6644',
    element: 'Ownership',
    rule: 'Master bedroom for house owner. Place heavy furniture.',
    detail: 'This zone is ideal for authority and long-term stability in the home.',
  },
  {
    direction: 'West',
    short: 'W',
    color: '#9CA3AF',
    element: 'Creativity',
    rule: "Children's room or creativity zone. Dining room works well.",
    detail: 'West encourages expression, learning, and shared family time.',
  },
  {
    direction: 'North-West',
    short: 'NW',
    color: '#8ECAE6',
    element: 'Air / Guests',
    rule: 'Guest bedroom. Bathroom acceptable here.',
    detail: 'North-West supports movement, circulation, and short-term stays.',
  },
]

const placementTabs = {
  'Bed Direction': [
    'Head pointing South or East = Good (promotes deep sleep)',
    'Head pointing North = Bad (magnetic interference, health issues)',
    'Head pointing West = Acceptable',
  ],
  'Kitchen Rules': [
    'Cook facing East = Ideal',
    'SE direction = Best location',
    'Never in NE (sacred zone)',
  ],
  'Toilet Rules': [
    'NW or SE = Acceptable',
    'Never in NE = Very bad (destroys prosperity)',
    "Never in SW = Weakens owner's health",
  ],
  'Mirror Rules': [
    'Never facing bed (causes health issues, disturbed sleep)',
    'East or North wall = Good',
    'South wall = Avoid',
  ],
}

// ── ONLY used as fallback when backend is completely unreachable ──
function buildFallbackResult(values) {
  return {
    score: 50,
    summary: `Analysis unavailable. Showing general guidelines for ${values.roomType}.`,
    working: ['Backend connection failed — showing general Vastu guidelines.'],
    issues: [
      {
        title: 'Could not connect to Vastu engine',
        severity: 'Minor',
        description: 'Please ensure the Flask server is running on port 5001.',
      },
    ],
    recommendations: [
      'Keep North-East corner clean and clutter-free',
      'Place heavy furniture in South-West direction',
      'Use appropriate colors for your room direction',
    ],
    placements: [
      { furniture: 'Main Furniture', current: values.facingDirection, ideal: 'South-West' },
      { furniture: 'Storage Unit',   current: 'Mixed placement',       ideal: 'South / West walls' },
      { furniture: 'Decor / Plants', current: 'Scattered',             ideal: 'North / East' },
    ],
  }
}

// ── Normalize Flask response: { success, result: { score, issues, ... } } ──
function normalizeResult(payload, values) {
  const fallback = buildFallbackResult(values)

  if (!payload) return fallback

  // Flask returns { success: true, result: { score, label, issues, ... } }
  const data = payload?.result ?? payload

  if (!data || typeof data.score === 'undefined') return fallback

  // Normalize issues array
  const issues = Array.isArray(data.issues) && data.issues.length > 0
    ? data.issues.map((issue) =>
        typeof issue === 'string'
          ? { title: issue, severity: 'Moderate', description: 'Review this area for better Vastu alignment.' }
          : {
              title:       issue.issue ?? issue.title ?? issue.name ?? 'Potential issue',
              severity:    issue.severity ?? 'Moderate',
              description: issue.reason ?? issue.description ?? issue.detail ?? 'Review this area.',
            },
      )
    : fallback.issues

  // Normalize placement guide
  const placements = Array.isArray(data.placementGuide) && data.placementGuide.length > 0
    ? data.placementGuide.map((p) =>
        typeof p === 'string'
          ? { furniture: p, current: 'Current layout', ideal: 'Suggested layout' }
          : {
              furniture: p.item     ?? p.furniture ?? 'Furniture',
              current:   p.current  ?? values.facingDirection,
              ideal:     p.ideal    ?? 'South-West',
            },
      )
    : fallback.placements

  // Merge AI + rule-based recommendations
  const recs = [
    ...(data.aiRecommendations ?? []),
    ...(data.recommendations   ?? []),
  ].filter(Boolean).slice(0, 6)

  return {
    score:           Number(data.score),
    label:           data.label ?? '',
    summary:         data.analysis ?? data.summary ?? `${values.roomType} facing ${values.facingDirection} — Score: ${data.score}/100`,
    working:         Array.isArray(data.positives) && data.positives.length > 0
      ? data.positives
      : [`✅ ${values.roomType} in ${values.facingDirection} direction has been analyzed`, `✅ Score: ${data.score}/100 — ${data.label || 'See details below'}`],
    issues,
    recommendations: recs.length > 0 ? recs : fallback.recommendations,
    placements,
    aiPowered:       data.aiPowered ?? false,
    colorSuggestion: data.colorSuggestion ?? '',
    element:         data.element ?? '',
  }
}

function GuideCompass() {
  const [hovered, setHovered] = useState(guideDirections[0])

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-card rounded-[28px] p-6">
        <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-md">
          <g transform="translate(200 200)">
            {guideDirections.map((direction, index) => {
              const startAngle = index * 45 - 90
              const endAngle   = startAngle + 45
              const x1 = Math.cos((Math.PI / 180) * startAngle) * 165
              const y1 = Math.sin((Math.PI / 180) * startAngle) * 165
              const x2 = Math.cos((Math.PI / 180) * endAngle)   * 165
              const y2 = Math.sin((Math.PI / 180) * endAngle)   * 165
              const midAngle = startAngle + 22.5
              const textX = Math.cos((Math.PI / 180) * midAngle) * 108
              const textY = Math.sin((Math.PI / 180) * midAngle) * 108

              return (
                <g key={direction.direction} onMouseEnter={() => setHovered(direction)} className="cursor-pointer">
                  <path
                    d={`M 0 0 L ${x1} ${y1} A 165 165 0 0 1 ${x2} ${y2} Z`}
                    fill={direction.color}
                    opacity={hovered.direction === direction.direction ? '1' : '0.86'}
                  />
                  <text x={textX} y={textY - 6}  fill="#FFFFFF" fontSize="20" fontWeight="700" textAnchor="middle">{direction.short}</text>
                  <text x={textX} y={textY + 18} fill="#FFFFFF" fontSize="11"                  textAnchor="middle">{direction.element}</text>
                </g>
              )
            })}
          </g>
          <circle cx="200" cy="200" r="44" fill="#FFFFFF" />
          <text x="200" y="208" textAnchor="middle" fill="#1A1A2E" fontSize="20" fontWeight="800">VASTU</text>
        </svg>
      </div>

      <div className="glass-card rounded-[28px] p-6">
        <span className="badge-pill">Interactive Vastu Compass</span>
        <h3 className="mt-5 text-3xl font-bold text-[var(--dark)]">{hovered.direction}</h3>
        <p className="mt-3 text-sm font-semibold" style={{ color: hovered.color }}>{hovered.element}</p>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{hovered.rule}</p>
        <div className="mt-5 rounded-[24px] bg-white/80 p-5 text-sm leading-7 text-[var(--dark)]">{hovered.detail}</div>
      </div>
    </div>
  )
}

export default function VastuPage() {
  const [activeTab,      setActiveTab]      = useState('analyze')
  const [activeGuideTab, setActiveGuideTab] = useState('Bed Direction')
  const [isSubmitting,   setIsSubmitting]   = useState(false)

  const [values, setValues] = useState({
    roomType:       'Bedroom',
    facingDirection:'NE',
    floor:          'Ground Floor',
    elements:       ['Bed', 'Wardrobe', 'Plants'],
    floorPlanImage: null,
  })

  // ── FIX 1: Start with null — no results shown until user clicks Analyze ──
  const [result, setResult] = useState(null)

  const directionRules = useMemo(
    () => guideDirections.map((d) => ({ direction: d.direction, rules: d.rule })),
    [],
  )

  const handleAnalyze = async () => {
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await analyzeVastu({
        roomType:       values.roomType,
        facingDirection:values.facingDirection,
        floor:          values.floor,
        elements:       values.elements,
        floorPlanImage: values.floorPlanImage?.dataUrl ?? '',
      })

      // ── FIX 2: Pass full response — normalizeResult reads payload.result ──
      const normalized = normalizeResult(response, values)
      setResult(normalized)
      toast.success(`Vastu analysis complete — Score: ${normalized.score}/100 (${normalized.label || ''})`)
    } catch (error) {
      console.error('Vastu error:', error)
      setResult(buildFallbackResult(values))
      toast.error(error.response?.data?.message ?? 'Backend unavailable — showing general guidelines.')
    } finally {
      setIsSubmitting(false)
    }
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
          <span className="badge-pill">Vastu Shastra</span>
          <h1 className="mt-6 text-4xl font-bold text-[var(--dark)] sm:text-5xl">
            Decode your home&apos;s energy with DecorVista Vastu intelligence
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
            Analyze room direction, understand ideal placements, and book a certified Vastu expert from one premium workspace.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
                activeTab === tab.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--dark)]'
              }`}
            >
              {tab.label}
              <span
                className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--primary)] transition duration-300 ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'analyze' && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
            >
              <VastuForm
                values={values}
                onSelectRoomType={(roomType)           => setValues((c) => ({ ...c, roomType }))}
                onSelectDirection={(facingDirection)   => setValues((c) => ({ ...c, facingDirection }))}
                onFloorChange={(floor)                 => setValues((c) => ({ ...c, floor }))}
                onToggleElement={(element) =>
                  setValues((c) => ({
                    ...c,
                    elements: c.elements.includes(element)
                      ? c.elements.filter((i) => i !== element)
                      : [...c.elements, element],
                  }))
                }
                onFloorPlanChange={(floorPlanImage)    => setValues((c) => ({ ...c, floorPlanImage }))}
                onSubmit={handleAnalyze}
                isSubmitting={isSubmitting}
              />

              {/* ── FIX 3: Show placeholder until user analyzes ── */}
              {result || isSubmitting ? (
                <VastuScore result={result} isLoading={isSubmitting} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-[28px] p-10 flex flex-col items-center justify-center text-center min-h-[420px]"
                >
                  <div className="text-7xl mb-5">🧭</div>
                  <h3 className="text-xl font-bold text-[var(--dark)]">Ready to Analyze</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] max-w-xs">
                    Select your room type and facing direction on the left, then click <strong>Analyze</strong> to get your personalized Vastu score.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs text-xs text-[var(--text-secondary)]">
                    {[['🏠','Room Type'],['🧭','Direction'],['✨','Vastu Score']].map(([icon, label]) => (
                      <div key={label} className="rounded-[16px] bg-white/60 p-3 text-center">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="font-semibold">{label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="mt-8 space-y-6"
            >
              <GuideCompass />

              <div className="glass-card overflow-hidden rounded-[28px] p-6">
                <h3 className="text-2xl font-bold text-[var(--dark)]">Direction Rules Table</h3>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[var(--text-secondary)]">
                        <th className="pb-3 font-semibold">Direction</th>
                        <th className="pb-3 font-semibold">Rules</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directionRules.map((row) => (
                        <tr key={row.direction} className="border-b border-slate-100 align-top last:border-0">
                          <td className="py-4 font-semibold text-[var(--dark)]">{row.direction}</td>
                          <td className="py-4 text-[var(--text-secondary)]">{row.rules}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card rounded-[28px] p-6">
                <h3 className="text-2xl font-bold text-[var(--dark)]">Specific Placement Rules</h3>
                <div className="mt-6 flex flex-wrap gap-3">
                  {Object.keys(placementTabs).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveGuideTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-300 ${
                        activeGuideTab === tab
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-white/85 text-[var(--text-secondary)] hover:text-[var(--dark)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {placementTabs[activeGuideTab].map((rule) => (
                    <div key={rule} className="rounded-[22px] border border-slate-200 bg-white/80 p-5 text-sm leading-7 text-[var(--dark)]">
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="mt-8"
            >
              <ConsultancyBooking />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
      <Footer />
    </div>
  )
}
