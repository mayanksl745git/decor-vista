import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function VisualizerPage() {
  const { isAuthenticated, loading } = useAuth()
  const [iframeLoaded, setIframeLoaded] = useState(false)

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div>
          <h1 className="text-lg font-bold text-yellow-400">🏗️ 3D Room Visualizer</h1>
          <p className="text-xs text-gray-400">Drag furniture • Rotate • Resize • Customize your perfect room</p>
        </div>
        <div className="flex gap-3">
          <a href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition">
            ← Dashboard
          </a>
          <a href="/ai-redesign" className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition">
            AI Redesign
          </a>
        </div>
      </div>
      
      {/* iframe wrapper — fills remaining height */}
      <div className="flex-1 relative">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Loading 3D Visualizer...</p>
            </div>
          </div>
        )}
        <iframe 
          src="/visualizer/index.html"
          className="w-full h-full border-0"
          title="3D Room Visualizer"
          onLoad={() => setIframeLoaded(true)}
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
