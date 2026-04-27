import axios from 'axios'

export const NODE_API = import.meta.env.VITE_NODE_API_URL
export const FLASK_API = import.meta.env.VITE_FLASK_API_URL

const nodeAPI = axios.create({
  baseURL: NODE_API,
})

const flaskAPI = axios.create({
  baseURL: FLASK_API,
})

nodeAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('decorvista_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export { nodeAPI, flaskAPI }
