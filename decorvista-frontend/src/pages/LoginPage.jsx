import { motion } from 'framer-motion'
import { ArrowRight, Chrome, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/authService'

export default function LoginPage() {
  const { login: authLogin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const response = await login(values.email, values.password)
      const token = response.token
      const user = response.user

      if (!token) {
        throw new Error('Token missing in response')
      }

      authLogin(token, user)
      toast.success('Welcome back to DecorVista!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to log in right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-shell min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-[image:var(--gradient-hero)] lg:flex">
          <div className="floating-orb left-12 top-16 h-52 w-52 bg-white/20" />
          <div className="floating-orb bottom-14 right-16 h-72 w-72 bg-[rgba(255,255,255,0.18)] [animation-delay:2s]" />
          <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
            <Link to="/" className="font-display text-4xl font-bold">
              <span className="text-[var(--accent)]">Decor</span>
              Vista
            </Link>

            <div className="max-w-xl">
              <span className="badge-pill border-white/20 bg-white/10 text-white">AI Interiors • Vastu • 3D Planning</span>
              <h1 className="mt-8 text-5xl font-bold leading-tight">Bring every design vision together in one elegant workspace.</h1>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Sign in to access saved concepts, run Vastu checks, and continue building rooms with intelligent design guidance.
              </p>
            </div>

            <div className="glass-card max-w-md rounded-[28px] bg-white/10 p-6 text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[var(--accent)]" />
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">Design smarter</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Continue where you left off and keep your favorite redesigns, layouts, and consultant notes synced in one place.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-10"
        >
          <div className="glass-card w-full max-w-xl rounded-[32px] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Welcome back</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--dark)]">Login to your account</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Access your AI redesigns, saved inspirations, and Vastu recommendations.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email ? <p className="mt-2 text-sm text-red-500">{errors.email.message}</p> : null}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-[var(--dark)]">
                    Password
                  </label>
                  <button type="button" className="text-sm font-medium text-[var(--primary)]">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Enter your password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password ? <p className="mt-2 text-sm text-red-500">{errors.password.message}</p> : null}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="loader-ring h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[var(--dark)] shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-[var(--primary)]">
                Register
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
