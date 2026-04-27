const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── HELPER: Generate JWT ────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })
}

// ─── HELPER: Send token response ────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)
  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    vastuAnalysisCount: user.vastuAnalysisCount,
    visualizerSessionCount: user.visualizerSessionCount,
    createdAt: user.createdAt
  }
  res.status(statusCode).json({ success: true, token, user: userObj })
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' })
    }

    // Create user
    const user = await User.create({ name, email, password })
    sendTokenResponse(user, 201, res)
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' })
  }
})

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    const { email, password } = req.body

    // Find user with password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' })
  }
})

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        vastuAnalysisCount: user.vastuAnalysisCount,
        visualizerSessionCount: user.visualizerSessionCount,
        createdAt: user.createdAt
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch user.' })
  }
})

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg })
    }

    const { name, email, currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')

    // Update name
    if (name) user.name = name

    // Update email (check not taken)
    if (email && email !== user.email) {
      const exists = await User.findOne({ email })
      if (exists) return res.status(400).json({ success: false, message: 'Email already in use.' })
      user.email = email
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password.' })
      }
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' })
      }
      user.password = newPassword
    }

    await user.save()
    res.json({ success: true, message: 'Profile updated successfully.' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed.' })
  }
})

// ─── DELETE /api/auth/account ─────────────────────────────────────────────────
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ success: true, message: 'Account deleted successfully.' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Account deletion failed.' })
  }
})

module.exports = router
