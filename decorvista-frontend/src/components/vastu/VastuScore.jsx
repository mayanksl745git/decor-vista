import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, MapPinned, Wrench } from 'lucide-react'

function getScoreMeta(score) {
  if (score <= 40) {
    return { color: '#EF4444', label: 'Poor' }
  }

  if (score <= 70) {
    return { color: '#F59E0B', label: 'Average' }
  }

  if (score <= 85) {
    return { color: '#22C55E', label: 'Good' }
  }

  return { color: '#16A34A', label: 'Excellent' }
}

function SeverityBadge({ severity }) {
  const styles = {
    Minor: 'bg-yellow-100 text-yellow-700',
    Moderate: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700',
  }

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[severity] ?? styles.Moderate}`}>{severity}</span>
}

export default function VastuScore({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card flex min-h-[340px] items-center justify-center rounded-[28px] p-6">
        <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text-secondary)]">
          <span className="loader-ring h-5 w-5 rounded-full border-2 border-slate-300 border-t-[var(--secondary)]" />
          Preparing your Vastu insights...
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="glass-card flex min-h-[340px] items-center justify-center rounded-[28px] p-6 text-center">
        <div>
          <h3 className="text-2xl font-bold text-[var(--dark)]">Run an analysis to unlock your Vastu score</h3>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
            Submit the room details on the left to get a score, issues, recommendations, and ideal furniture placement guidance.
          </p>
        </div>
      </div>
    )
  }

  const score = Number(result.score ?? 0)
  const { color, label } = getScoreMeta(score)
  const circumference = 2 * Math.PI * 70
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      className="glass-card rounded-[28px] p-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[var(--dark)]">Vastu Score Gauge</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{result.summary}</p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="relative h-48 w-48">
          <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
            <circle cx="90" cy="90" r="70" stroke="rgba(148,163,184,0.2)" strokeWidth="12" fill="none" />
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeDasharray={circumference}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-black text-[var(--dark)]">{score}</p>
            <p className="mt-2 text-sm font-semibold" style={{ color }}>
              {label}
            </p>
          </div>
        </div>
      </div>

      <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
        initial="hidden"
        animate="visible"
        className="mt-10 grid gap-5 xl:grid-cols-2"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h4 className="text-lg font-bold text-[var(--dark)]">What&apos;s Working</h4>
          </div>
          <div className="mt-4 space-y-3">
            {result.working?.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm leading-7 text-emerald-900">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="rounded-[24px] border border-orange-200 bg-orange-50/70 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="text-lg font-bold text-[var(--dark)]">Issues Found</h4>
          </div>
          <div className="mt-4 space-y-4">
            {result.issues?.map((issue) => (
              <div key={issue.title} className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--dark)]">{issue.title}</p>
                  <SeverityBadge severity={issue.severity} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{issue.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="rounded-[24px] border border-sky-200 bg-sky-50/70 p-5">
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-sky-600" />
            <h4 className="text-lg font-bold text-[var(--dark)]">Recommendations</h4>
          </div>
          <div className="mt-4 space-y-4">
            {result.recommendations?.map((item, index) => (
              <div key={item} className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-[var(--dark)]">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="rounded-[24px] border border-purple-200 bg-purple-50/70 p-5">
          <div className="flex items-center gap-3">
            <MapPinned className="h-5 w-5 text-[var(--accent-purple)]" />
            <h4 className="text-lg font-bold text-[var(--dark)]">Placement Guide</h4>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[var(--text-secondary)]">
                  <th className="pb-3 font-semibold">Furniture</th>
                  <th className="pb-3 font-semibold">Current Position</th>
                  <th className="pb-3 font-semibold">Ideal Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {result.placements?.map((placement) => (
                  <tr key={placement.furniture}>
                    <td className="py-3 font-semibold text-[var(--dark)]">{placement.furniture}</td>
                    <td className="py-3 text-[var(--text-secondary)]">{placement.current}</td>
                    <td className="py-3 text-[var(--accent-purple)]">{placement.ideal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
