import { flaskAPI, nodeAPI } from './api'

export async function analyzeVastu(payload) {
  const { data } = await flaskAPI.post('/api/vastu/analyze', payload)
  return data
}

export async function getDirections() {
  const { data } = await flaskAPI.get('/api/vastu/directions')
  return data
}

export async function bookConsultation(payload) {
  const { data } = await nodeAPI.post('/api/vastu/book-consultation', payload)
  return data
}

export async function getMyBookings() {
  const { data } = await nodeAPI.get('/api/vastu/my-bookings')
  return data
}
