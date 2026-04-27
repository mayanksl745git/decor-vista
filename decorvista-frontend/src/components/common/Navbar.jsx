import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Vastu', href: '/vastu' },
  { label: 'AI Redesign', href: '/ai-redesign' },
  { label: '3D Visualizer', href: '/visualizer' },
  { label: 'Gallery', href: '/gallery' },
]

function Brand() {
  return (
    <Link to="/" className="font-display text-3xl font-bold tracking-tight text-[var(--dark)]">
      <span className="text-[var(--primary)]">Decor</span>
      Vista
    </Link>
  )
}

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    if (!user?.name) {
      return 'DV'
    }

    return user.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }, [user?.name])

  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const handleNavAction = (href) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '')

      if (location.pathname !== '/') {
        navigate(`/${href.substring(1)}`)
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } else {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      return
    }

    navigate(href)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/85 backdrop-blur-[20px]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Brand />

        <div className="hidden items-center gap-8 lg:flex">
          {navigationLinks.map((link) => {
            const isActive = link.href === '/'
              ? location.pathname === '/'
              : location.pathname === link.href

            return (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavAction(link.href)}
                className="group relative text-sm font-medium text-[var(--dark)]"
              >
                {link.label}
                <span
                  className={`absolute -bottom-2 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            )
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((current) => !current)}
                className="flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-[0_10px_25px_rgba(26,26,46,0.08)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden text-left xl:block">
                  <span className="block text-sm font-semibold text-[var(--dark)]">{user?.name ?? 'DecorVista User'}</span>
                  <span className="block text-xs text-[var(--text-secondary)]">My account</span>
                </span>
                <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>

              <AnimatePresence>
                {dropdownOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card absolute right-0 mt-3 flex w-60 flex-col overflow-hidden p-2"
                  >
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--dark)] hover:bg-[rgba(255,107,53,0.08)]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[var(--primary)]" />
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--dark)] hover:bg-[rgba(255,107,53,0.08)]"
                    >
                      <User className="h-4 w-4 text-[var(--primary)]" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--dark)] hover:bg-[rgba(255,107,53,0.08)]"
                    >
                      <LogOut className="h-4 w-4 text-[var(--primary)]" />
                      Logout
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[var(--dark)] shadow-[0_10px_25px_rgba(26,26,46,0.08)] lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/50 bg-white/90 px-4 py-4 backdrop-blur-[20px] lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navigationLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavAction(link.href)}
                  className="glass-card px-4 py-3 text-left text-sm font-semibold text-[var(--dark)]"
                >
                  {link.label}
                </button>
              ))}
              {!isAuthenticated ? (
                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                  <Link to="/login" className="btn-secondary w-full">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary w-full">
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary w-full">
                    Dashboard
                  </button>
                  <button type="button" onClick={() => navigate('/profile')} className="btn-secondary w-full">
                    Profile
                  </button>
                  <button type="button" onClick={handleLogout} className="btn-primary w-full">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
