import { motion } from 'framer-motion'
import { Camera, Layout, Maximize2, RotateCcw, Save, Search, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import RoomVisualizer from '../components/visualizer/RoomVisualizer'
import { saveLayout } from '../services/designService'

const furnitureCategories = {
  Seating: [
    { name: 'Sofa', icon: '🛋️' },
    { name: 'Armchair', icon: '🪑' },
    { name: 'Chair', icon: '🪑' },
  ],
  Sleeping: [
    { name: 'Single Bed', icon: '🛌' },
    { name: 'Double Bed', icon: '🛌' },
  ],
  Storage: [
    { name: 'Wardrobe', icon: '🚪' },
    { name: 'Bookshelf', icon: '📚' },
    { name: 'Cabinet', icon: '🗄️' },
  ],
  Tables: [
    { name: 'Dining Table', icon: '🍽️' },
    { name: 'Coffee Table', icon: '☕' },
    { name: 'Study Table', icon: '📖' },
    { name: 'Side Table', icon: '📦' },
  ],
  Decor: [
    { name: 'Indoor Plant', icon: '🌿' },
    { name: 'Floor Lamp', icon: '💡' },
    { name: 'TV Unit', icon: '📺' },
  ],
}

const floorTypes = ['Wood', 'Marble', 'Tiles', 'Carpet']

export default function VisualizerPage() {
  const visualizerRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roomWidth, setRoomWidth] = useState(15)
  const [roomLength, setRoomLength] = useState(15)
  const [wallColor, setWallColor] = useState('#ffffff')
  const [floorType, setFloorType] = useState('Wood')
  const [viewMode, setViewMode] = useState('3d')
  const [isSaving, setIsSaving] = useState(false)

  const handleAddFurniture = (type) => {
    visualizerRef.current?.addFurniture(type)
    toast.success(`Added ${type} to scene`)
  }

  const handleReset = () => {
    visualizerRef.current?.resetScene()
    toast.success('Scene reset')
  }

  const handleSaveLayout = async () => {
    setIsSaving(true)
    try {
      const layoutData = visualizerRef.current?.getLayoutData()
      const screenshot = visualizerRef.current?.takeScreenshot()
      
      await saveLayout({
        imageUrl: screenshot,
        style: '3D Layout',
        roomType: 'Custom',
        name: `Layout ${Date.now()}`,
        layoutData: JSON.stringify(layoutData)
      })
      
      toast.success('Layout saved to profile!')
    } catch (error) {
      toast.error('Failed to save layout')
    } finally {
      setIsSaving(false)
    }
  }

  const handleScreenshot = () => {
    const dataUrl = visualizerRef.current?.takeScreenshot()
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `decorvista-layout-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--dark)]">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Furniture Panel */}
        <aside className="w-[280px] border-r border-white/10 bg-[var(--dark)] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Furniture</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {Object.entries(furnitureCategories).map(([category, items]) => {
              const filteredItems = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              
              if (filteredItems.length === 0) return null
              
              return (
                <div key={category} className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleAddFurniture(item.name)}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-left"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative flex flex-col">
          {/* Top Toolbar */}
          <div className="absolute top-4 inset-x-4 z-10 flex flex-wrap items-center gap-4 bg-[var(--dark)]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <label className="text-xs font-semibold text-slate-400 uppercase">Size</label>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">W: {roomWidth}ft</span>
                  <input 
                    type="range" min="8" max="30" value={roomWidth} 
                    onChange={(e) => setRoomWidth(Number(e.target.value))}
                    className="w-24 accent-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">L: {roomLength}ft</span>
                  <input 
                    type="range" min="8" max="30" value={roomLength} 
                    onChange={(e) => setRoomLength(Number(e.target.value))}
                    className="w-24 accent-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <label className="text-xs font-semibold text-slate-400 uppercase">Wall</label>
              <input 
                type="color" value={wallColor} 
                onChange={(e) => setWallColor(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <label className="text-xs font-semibold text-slate-400 uppercase">Floor</label>
              <select 
                value={floorType} 
                onChange={(e) => setFloorType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
              >
                {floorTypes.map(t => <option key={t} value={t} className="bg-[var(--dark)]">{t}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('top')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'top' ? 'bg-[var(--primary)] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Top View
              </button>
              <button 
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === '3d' ? 'bg-[var(--primary)] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                3D View
              </button>
            </div>
            
            <button 
              onClick={handleReset}
              className="ml-auto flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {/* 3D Canvas Container */}
          <div className="flex-1 bg-slate-900">
            <RoomVisualizer 
              ref={visualizerRef}
              roomWidth={roomWidth}
              roomLength={roomLength}
              wallColor={wallColor}
              floorType={floorType}
              viewMode={viewMode}
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-[var(--dark)]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
            <button 
              onClick={handleSaveLayout}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-light)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </button>
            <button 
              onClick={handleScreenshot}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <Camera className="h-4 w-4" />
              Screenshot
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={handleReset}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
              title="Reset Scene"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
