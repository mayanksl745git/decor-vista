import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, PhoneCall } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { bookConsultation } from '../../services/vastuService'

const consultationTypes = [
  { value: 'Online Video Call 📹', title: 'Online Video Call 📹' },
  { value: 'In-Person Visit 🏠', title: 'In-Person Visit 🏠' },
]

const timeSlots = ['Morning 9AM–12PM', 'Afternoon 12PM–4PM', 'Evening 4PM–7PM']

export default function ConsultancyBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      consultationType: consultationTypes[0].value,
      preferredTimeSlot: timeSlots[0],
    },
  })

  const selectedType = watch('consultationType')
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  const onSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      // Map frontend field names to backend expected field names
      const payload = {
        name: values.fullName,
        email: values.email,
        phone: values.phoneNumber,
        city: values.city,
        consultationType: values.consultationType.includes('Online') ? 'online' : 'in-person',
        preferredDate: values.preferredDate,
        preferredTimeSlot: values.preferredTimeSlot.toLowerCase().split(' ')[0], // 'morning', 'afternoon', or 'evening'
        issue: values.issue
      }

      const response = await bookConsultation(payload)
      setConfirmation({
        phone: payload.phone,
        referenceId: response.referenceId,
      })
      toast.success('Consultation booked successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to book consultation right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
      className="overflow-hidden rounded-[28px] border border-white/60 bg-white/75 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-[20px]"
    >
      <div className="bg-[image:var(--gradient-vastu)] px-6 py-7 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">📞 Book a Vastu Expert Consultation</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/85">
              Our certified Vastu consultants will analyze your home and provide personalized solutions
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {confirmation ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="mt-6 text-3xl font-bold text-[var(--dark)]">Booking Confirmed!</h4>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Our Vastu expert will contact you within 24 hours on <span className="font-semibold text-[var(--secondary)]">{confirmation.phone}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--dark)]">Reference ID: {confirmation.referenceId}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                Full Name
              </label>
              <input id="fullName" className="input-field" {...register('fullName', { required: 'Full name is required' })} />
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
              <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                className="input-field"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid Indian phone number',
                  },
                })}
              />
              {errors.phoneNumber ? <p className="mt-2 text-sm text-red-500">{errors.phoneNumber.message}</p> : null}
            </div>

            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                City
              </label>
              <input id="city" className="input-field" {...register('city', { required: 'City is required' })} />
              {errors.city ? <p className="mt-2 text-sm text-red-500">{errors.city.message}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <p className="mb-2 text-sm font-semibold text-[var(--dark)]">Consultation Type</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {consultationTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`cursor-pointer rounded-[22px] border px-4 py-4 transition duration-300 ${
                      selectedType === type.value
                        ? 'border-[var(--secondary)] bg-[rgba(45,106,79,0.08)]'
                        : 'border-slate-200 bg-white/85 hover:border-[var(--secondary)]'
                    }`}
                  >
                    <input type="radio" value={type.value} {...register('consultationType')} className="sr-only" />
                    <p className="text-sm font-semibold text-[var(--dark)]">{type.title}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="preferredDate" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                Preferred Date
              </label>
              <input
                id="preferredDate"
                type="date"
                min={minDate}
                className="input-field"
                {...register('preferredDate', { required: 'Preferred date is required' })}
              />
              {errors.preferredDate ? <p className="mt-2 text-sm text-red-500">{errors.preferredDate.message}</p> : null}
            </div>

            <div>
              <label htmlFor="preferredTimeSlot" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                Preferred Time Slot
              </label>
              <select id="preferredTimeSlot" className="input-field" {...register('preferredTimeSlot', { required: 'Time slot is required' })}>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="issue" className="mb-2 block text-sm font-semibold text-[var(--dark)]">
                Describe Your Issue
              </label>
              <textarea
                id="issue"
                className="input-field min-h-32 resize-none"
                {...register('issue', {
                  required: 'Please describe your issue',
                  minLength: {
                    value: 20,
                    message: 'Please provide at least 20 characters',
                  },
                })}
              />
              {errors.issue ? <p className="mt-2 text-sm text-red-500">{errors.issue.message}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-full bg-[var(--secondary)] px-6 py-4 text-base font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--secondary-light)] disabled:cursor-not-allowed disabled:bg-slate-300">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="loader-ring h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
                    Booking consultation...
                  </span>
                ) : (
                  <>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Book Consultation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  )
}
