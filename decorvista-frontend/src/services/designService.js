import { nodeAPI } from './api'

export async function getDesigns() {
  const { data } = await nodeAPI.get('/api/designs')
  return data
}

export async function saveDesign(payload) {
  const { data } = await nodeAPI.post('/api/designs/save', payload)
  return data
}

export async function saveLayout(payload) {
  const { data } = await nodeAPI.post('/api/designs/save-layout', payload)
  return data
}

export async function deleteDesign(id) {
  const { data } = await nodeAPI.delete(`/api/designs/${id}`)
  return data
}

export async function getCount() {
  const { data } = await nodeAPI.get('/api/designs/count')
  return data
}
