const mongoose = require('mongoose')

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'My Design'
  },
  type: {
    type: String,
    enum: ['ai-redesign', '3d-layout'],
    required: true
  },
  originalImage: {
    type: String, // URL
    default: null
  },
  generatedImage: {
    type: String, // URL (Cloudinary or base64)
    required: true
  },
  style: {
    type: String,
    default: null
  },
  roomType: {
    type: String,
    default: null
  },
  layoutData: {
    type: mongoose.Schema.Types.Mixed, // for 3D layout JSON
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Design', designSchema)
