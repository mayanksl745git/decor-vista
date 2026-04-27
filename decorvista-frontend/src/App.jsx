import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'
import AIRedesignPage from './pages/AIRedesignPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import VastuPage from './pages/VastuPage'
import VisualizerPage from './pages/VisualizerPage'
import DesignGalleryPage from './pages/DesignGalleryPage'
import { useAuth } from './context/AuthContext'
import Loader from './components/common/Loader'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-redesign"
          element={
            <ProtectedRoute>
              <AIRedesignPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vastu"
          element={
            <ProtectedRoute>
              <VastuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visualizer"
          element={
            <ProtectedRoute>
              <VisualizerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <DesignGalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
