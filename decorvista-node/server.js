const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')

dotenv.config()

const app = express()
let serverStarted = false

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}))

// ─── BODY PARSER ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/designs', require('./routes/designs'))
app.use('/api/vastu', require('./routes/vastu'))

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DecorVista Node API is running', timestamp: new Date() })
})

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// ─── DATABASE + START ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

const startServer = () => {
  if (serverStarted) return
  serverStarted = true
  app.listen(PORT, () => console.log(`🚀 Node server running on port ${PORT}`))
}

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    console.log('↻ Retrying MongoDB connection in 10 seconds...')
    setTimeout(connectToMongo, 10000)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message)
})

startServer()
connectToMongo()
