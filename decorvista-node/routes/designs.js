const express = require('express')
const router = express.Router()
const Design = require('../models/Design')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── GET /api/designs ─────────────────────────────────────────────────────────
// Get all designs for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const designs = await Design.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, count: designs.length, designs })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch designs.' })
  }
})

// ─── POST /api/designs/save ───────────────────────────────────────────────────
// Save an AI-generated design
router.post('/save', protect, async (req, res) => {
  try {
    const { name, imageUrl, originalImageUrl, style, roomType } = req.body

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required.' })
    }

    const design = await Design.create({
      user: req.user._id,
      name: name || `Design ${Date.now()}`,
      type: 'ai-redesign',
      originalImage: originalImageUrl || null,
      generatedImage: imageUrl,
      style: style || null,
      roomType: roomType || null,
    })

    // Add to user's savedDesigns
    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedDesigns: design._id }
    })

    res.status(201).json({ success: true, message: 'Design saved!', design })
  } catch (err) {
    console.error('Save design error:', err)
    res.status(500).json({ success: false, message: 'Could not save design.' })
  }
})

// ─── POST /api/designs/save-layout ───────────────────────────────────────────
// Save a 3D visualizer layout
router.post('/save-layout', protect, async (req, res) => {
  try {
    const { name, layoutData, screenshotUrl } = req.body

    if (!layoutData) {
      return res.status(400).json({ success: false, message: 'Layout data is required.' })
    }

    const design = await Design.create({
      user: req.user._id,
      name: name || `3D Layout ${Date.now()}`,
      type: '3d-layout',
      generatedImage: screenshotUrl || 'https://placehold.co/400x300?text=3D+Layout',
      layoutData,
    })

    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedDesigns: design._id }
    })

    // Increment session count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { visualizerSessionCount: 1 }
    })

    res.status(201).json({ success: true, message: '3D Layout saved!', design })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not save layout.' })
  }
})

// ─── DELETE /api/designs/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found.' })
    }

    // Make sure user owns this design
    if (design.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this design.' })
    }

    await Design.findByIdAndDelete(req.params.id)

    // Remove from user's savedDesigns
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedDesigns: req.params.id }
    })

    res.json({ success: true, message: 'Design deleted.' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete design.' })
  }
})

// ─── GET /api/designs/count ───────────────────────────────────────────────────
router.get('/count', protect, async (req, res) => {
  try {
    const count = await Design.countDocuments({ user: req.user._id })
    const aiCount = await Design.countDocuments({ user: req.user._id, type: 'ai-redesign' })
    const layoutCount = await Design.countDocuments({ user: req.user._id, type: '3d-layout' })
    res.json({ success: true, total: count, aiDesigns: aiCount, layouts: layoutCount })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch counts.' })
  }
})

module.exports = router
