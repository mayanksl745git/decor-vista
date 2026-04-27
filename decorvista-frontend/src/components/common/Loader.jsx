export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--light-bg)] px-4">
      <div className="glass-card flex flex-col items-center gap-6 px-10 py-12 text-center">
        <div className="loader-ring h-16 w-16 rounded-full border-4 border-[rgba(26,26,46,0.12)] border-t-[var(--primary)]" />
        <div>
          <p className="font-display text-3xl font-bold tracking-tight text-[var(--dark)]">
            <span className="text-[var(--primary)]">Decor</span>
            Vista
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Preparing your design workspace...</p>
        </div>
      </div>
    </div>
  )
}
