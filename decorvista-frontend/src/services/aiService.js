import { flaskAPI } from './api'

export async function redesignRoom(formData) {
  const { data } = await flaskAPI.post('/api/ai/redesign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function describeRoom(formData) {
  const { data } = await flaskAPI.post('/api/ai/describe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function analyzeRoom(formData) {
  const { data } = await flaskAPI.post('/api/ai/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function generateDesigns(payload) {
  const { data } = await flaskAPI.post('/api/ai/generate', payload)
  return data
}

export async function customizeDesign(payload) {
  const { data } = await flaskAPI.post('/api/ai/customize', payload)
  return data
}
