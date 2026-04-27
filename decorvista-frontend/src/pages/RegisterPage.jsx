import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register as registerUser } from '../services/authService'

function getPasswordStrength(password = '') {
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  if (password.length >= 10 && hasUpper && hasNumber && hasSymbol) {
    return { width: 'w-full', color: 'bg-emerald-500', label: 'Strong password' }
  }

  if (password.length >= 8 && (hasUpper || hasNumber)) {
    return { width: 'w-2/3', color: 'bg-orange-400', label: 'Medium password' }
  }

  return { width: 'w-1/3', color: 'bg-red-500', label: 'Weak password' }
}

export default function RegisterPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password', '')
  const strength = useMemo(() => getPasswordStrength(password), [password])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async ({ fullName, email, password: nextPassword }) => {
    setIsSubmitting(true)

    try {
      const response = await registerUser(fullName, email, nextPassword)      

      const token = response.token
      const user = response.user

      if (!token) {
        throw new Error('Token missing in response')
      }

      login(token, user)
      toast.success('Your DecorVista account is ready!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to create your account right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-shell min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-[image:var(--gradient-ai)] lg:flex">
          <div className="floating-orb left-16 top-24 h-56 w-56 bg-white/20" />
          <div className="floating-orb bottom-16 right-12 h-80 w-80 bg-[rgba(255,255,255,0.16)] [animation-delay:2s]" />
          <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
            <Link to="/" className="font-display text-4xl font-bold">
              <span className="text-[var(--accent)]">Decor</span>
              Vista
            </Link>

            <div className="max-w-xl">
              <span className="badge-pill border-white/20 bg-white/10 text-white">Beautiful homes, guided by intelligence</span>
              <h1 className="mt-8 text-5xl font-bold leading-tight">Start creating personalized spaces with AI from day one.</h1>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Join DecorVista to redesign rooms, measure Vastu balance, and make confident design decisions faster.
              </p>
            </div>

            <div className="glass-card max-w-md rounded-[28px] bg-white/10 p-6 text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-[var(--accent)]" />
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">Premium onboarding</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Secure access, intuitive workflows, and a design-ready dashboard built for homeowners and pros alike.
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
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Create account</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--dark)]">Join DecorVista</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Save redesigns, compare layouts, and keep your design journey in one place.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="input-field"
                  placeholder="Your full name"
                  {...register('fullName', { required: 'Full name is required' })}
                />
                {errors.fullName ? <p className="mt-2 text-sm text-red-500">{errors.fullName.message}</p> : null}
              </div>

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
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Create a password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
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
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.width} ${strength.color}`} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">{strength.label}</p>
                </div>
                {errors.password ? <p className="mt-2 text-sm text-red-500">{errors.password.message}</p> : null}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword ? <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p> : null}
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                  {...register('agree', { required: 'You must agree to the terms' })}
                />
                <span className="text-sm leading-6 text-[var(--text-secondary)]">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
              {errors.agree ? <p className="text-sm text-red-500">{errors.agree.message}</p> : null}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="loader-ring h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[rgba(45,106,79,0.08)] px-4 py-3 text-sm text-[var(--secondary)]">
              <CheckCircle2 className="h-5 w-5" />
              Build your first design journey in minutes.
            </div>

            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--primary)]">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
