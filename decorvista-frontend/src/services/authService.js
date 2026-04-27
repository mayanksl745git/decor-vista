import { nodeAPI } from './api'

export async function login(email, password) {
  const { data } = await nodeAPI.post('/api/auth/login', { email, password })
  return data
}

export async function register(name, email, password) {
  const { data } = await nodeAPI.post('/api/auth/register', { name, email, password })
  return data
}

export async function getMe() {
  const { data } = await nodeAPI.get('/api/auth/me')
  return data
}

export async function updateProfile(payload) {
  const { data } = await nodeAPI.put('/api/auth/profile', payload)
  return data
}

export async function deleteAccount() {
  const { data } = await nodeAPI.delete('/api/auth/account')
  return data
}
