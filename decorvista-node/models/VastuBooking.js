const mongoose = require('mongoose')

const vastuBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // can book without account
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  consultationType: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  issue: {
    type: String,
    required: [true, 'Please describe your issue'],
    minlength: [20, 'Please describe your issue in at least 20 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  referenceId: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
})

// Auto-generate reference ID before saving
vastuBookingSchema.pre('save', function (next) {
  if (!this.referenceId) {
    this.referenceId = 'DV-' + Math.floor(100000 + Math.random() * 900000)
  }
  next()
})

module.exports = mongoose.model('VastuBooking', vastuBookingSchema)
