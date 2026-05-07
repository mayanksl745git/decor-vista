# DecorVista Website Structure & Architecture

## Overview
DecorVista is an AI-powered interior design platform with React + Vite frontend and dual backend architecture (Node.js + Flask).

---

## Project Structure
```
decorvista/
├── decorvista-frontend/          # React + Vite Frontend
│   ├── public/
│   │   ├── visualizer/           # Standalone 3D Visualizer
│   │   │   ├── index.html        # Three.js 3D Scene
│   │   │   ├── models/           # GLB furniture models + thumbnails
│   │   │   └── README.md         # Models documentation
│   │   └── Images/               # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Shared components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── ...
│   │   │   ├── home/             # Homepage sections
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Landing page (restored original)
│   │   │   ├── DashboardPage.jsx # User dashboard with enhancements
│   │   │   ├── AIRedesignPage.jsx # 4-step AI redesign wizard
│   │   │   ├── VastuPage.jsx     # Vastu analysis & consultation
│   │   │   ├── VisualizerPage.jsx # 3D Room Visualizer (iframe wrapper)
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── aiService.js       # Updated with Flask AI endpoints
│   │   │   ├── vastuService.js
│   │   │   └── designService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication state management
│   │   └── App.jsx
│   └── package.json
│
├── decorvista-flask/              # Flask Backend (AI & Vastu APIs)
│   ├── routes/
│   │   ├── ai_routes.py           # AI redesign endpoints
│   │   └── vastu_routes.py        # Vastu analysis endpoints
│   └── requirements.txt
│
└── decorvista-node/               # Node.js Backend (Auth & Data)
    └── (Existing structure)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React + Vite SPA                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │   Navbar     │  │   Routes     │  │   Components     │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Iframe: 3D Visualizer HTML                  │  │
│  │  ┌───────────────────────────────────────────────────────┐│  │
│  │  │          Three.js Scene + OrbitControls               ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                    ┌───────────────────┐
│  Node.js Backend  │                    │  Flask Backend    │
│  (localhost:5000) │                    │  (localhost:5001) │
├───────────────────┤                    ├───────────────────┤
│ • Authentication  │                    │ • AI Room Analyze │
│ • User Profiles   │                    │ • AI Design Gen   │
│ • Design Storage  │                    │ • AI Customize    │
│ • Consultations   │                    │ • Vastu Analysis  │
└───────────────────┘                    └───────────────────┘
```

---

## Key Features & Functionality

### 1. Homepage (`/`)
- **File**: `src/pages/HomePage.jsx`
- **Status**: Restored to original design
- **Sections**: Hero, Features, Gallery, Testimonials, Team, Contact

### 2. Dashboard (`/dashboard`)
- **File**: `src/pages/DashboardPage.jsx`
- **Enhancements**:
  - Live date/time display
  - Stats cards (Designs, Vastu, Consultations, Profile Completion)
  - 3 large main feature cards with animations
  - Recent designs section
  - Quick tips

### 3. AI Redesign (`/ai-redesign`)
- **File**: `src/pages/AIRedesignPage.jsx`
- **Features**: 4-step wizard
  - Step 1: Upload room photo + style selection
  - Step 2: AI Analysis
  - Step 3: 3 generated design variations
  - Step 4: Customize + shop recommendations
- **APIs**: Flask `/api/ai/analyze`, `/api/ai/generate`, `/api/ai/customize`

### 4. Vastu Analysis (`/vastu`)
- **File**: `src/pages/VastuPage.jsx`
- **Tabs**:
  - Room Analyzer
  - Vastu Guide
  - Book Consultation (auth-protected)

### 5. 3D Visualizer (`/visualizer`)
- **Files**:
  - `src/pages/VisualizerPage.jsx`: React wrapper (auth check + iframe)
  - `public/visualizer/index.html`: Standalone Three.js scene
- **Features**:
  - Drag & drop furniture placement
  - Orbit camera controls
  - Rotate/resize objects
  - POV presets (Top, Iso, Front, Side, 3D)
  - Floor color/texture customization
  - Room background upload
  - Save/Load/Export layouts
- **Models**: Place GLB files in `public/visualizer/models/`

---

## Authentication Flow

```
User visits protected route (/dashboard, /ai-redesign, etc.)
    ↓
Checks AuthContext
    ↓
If NOT authenticated: Redirect to /login with toast
    ↓
If authenticated: Render page
```

**Protected Routes**: `/dashboard`, `/ai-redesign`, `/vastu`, `/visualizer`, `/profile`

---

## API Integration

### Environment Variables
```env
VITE_NODE_API_URL=http://localhost:5000
VITE_FLASK_API_URL=http://localhost:5001
```

### Key Service Files

| File | Purpose |
|------|---------|
| `authService.js` | Login, register, logout, get user profile |
| `aiService.js` | AI room analysis, design generation, customization |
| `vastuService.js` | Vastu analysis, consultation booking |
| `designService.js` | Save/load designs, fetch counts |

---

## Technologies Used

**Frontend**:
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router
- React Hot Toast

**3D Visualizer**:
- Three.js r164 (via esm.sh CDN)
- OrbitControls
- GLTFLoader

**Backends**:
- Node.js (Express)
- Flask (Python)

---

## How to Run

1. **Frontend**:
   ```bash
   cd decorvista-frontend
   npm install
   npm run dev
   ```

2. **Node.js Backend**:
   ```bash
   cd decorvista-node
   npm install
   npm run start
   ```

3. **Flask Backend**:
   ```bash
   cd decorvista-flask
   pip install -r requirements.txt
   python app.py
   ```

---

## Notes

- **3D Models**: Add your furniture GLB files to `public/visualizer/models/`
- **Homepage**: Restored to original design - no changes from user's previous version
- **Build**: `npm run build` creates production-ready files in `dist/`
