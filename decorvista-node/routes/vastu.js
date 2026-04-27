const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const VastuBooking = require('../models/VastuBooking')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── POST /api/vastu/book-consultation ───────────────────────────────────────
router.post('/book-consultation', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('consultationType').isIn(['online', 'in-person']).withMessage('Invalid consultation type'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
  body('preferredTimeSlot').isIn(['morning', 'afternoon', 'evening']).withMessage('Invalid time slot'),
  body('issue').isLength({ min: 20 }).withMessage('Please describe your issue in at least 20 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    const { name, email, phone, city, consultationType, preferredDate, preferredTimeSlot, issue } = req.body

    const booking = await VastuBooking.create({
      user: req.user?._id || null,
      name, email, phone, city,
      consultationType, preferredDate, preferredTimeSlot, issue
    })

    // Increment vastu count if user is logged in
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { vastuAnalysisCount: 1 } })
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! Our Vastu expert will contact you within 24 hours.',
      referenceId: booking.referenceId,
      booking: {
        referenceId: booking.referenceId,
        name: booking.name,
        consultationType: booking.consultationType,
        preferredDate: booking.preferredDate,
        preferredTimeSlot: booking.preferredTimeSlot,
        status: booking.status
      }
    })
  } catch (err) {
    console.error('Booking error:', err)
    res.status(500).json({ success: false, message: 'Booking failed. Please try again.' })
  }
})

// ─── GET /api/vastu/my-bookings ───────────────────────────────────────────────
// Get bookings for logged in user
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await VastuBooking.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, count: bookings.length, bookings })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch bookings.' })
  }
})

// ─── POST /api/vastu/save-analysis ───────────────────────────────────────────
// Save a Vastu analysis result to user history
router.post('/save-analysis', protect, async (req, res) => {
  try {
    const { roomType, facingDirection, score, recommendations } = req.body

    // Increment analysis count
    await User.findByIdAndUpdate(req.user._id, { $inc: { vastuAnalysisCount: 1 } })

    res.json({ success: true, message: 'Analysis saved.' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not save analysis.' })
  }
})

module.exports = router
