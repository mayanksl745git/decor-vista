# DecorVista — Backend Setup Guide

Two backends:
- **Node.js (port 5000)** — Auth, Designs, Vastu Bookings → MongoDB Atlas
- **Flask (port 5001)** — AI Redesign, Vastu Analysis → Gemini + HuggingFace

---

## FREE API KEYS YOU NEED

### 1. MongoDB Atlas (free forever)
1. Go to https://mongodb.com/atlas
2. Create free account → Create free cluster (M0)
3. Database Access → Add user (username + password)
4. Network Access → Add IP → "Allow from anywhere" (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` with your DB password in .env

### 2. Gemini API (free tier — 15 req/min)
1. Go to https://aistudio.google.com
2. Click "Get API Key" → Create API key
3. Copy key to GEMINI_API_KEY in Flask .env

### 3. HuggingFace (free tier)
1. Go to https://huggingface.co → Sign up
2. Settings → Access Tokens → New Token (read access)
3. Copy to HUGGINGFACE_API_KEY in Flask .env

### 4. Cloudinary (free tier — optional, for image hosting)
1. Go to https://cloudinary.com → Sign up free
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Add to Node .env (if not set, images saved as base64)

---

## NODE.JS BACKEND SETUP

```bash
cd decorvista-node
npm install

# Create .env file (copy from .env.example and fill values)
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret

npm run dev   # development (nodemon)
npm start     # production
```

Runs on: http://localhost:5000

### API Endpoints:
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user (protected)
PUT    /api/auth/profile           Update profile (protected)
DELETE /api/auth/account           Delete account (protected)

GET    /api/designs                Get user's designs (protected)
POST   /api/designs/save           Save AI design (protected)
POST   /api/designs/save-layout    Save 3D layout (protected)
DELETE /api/designs/:id            Delete design (protected)
GET    /api/designs/count          Get design counts (protected)

POST   /api/vastu/book-consultation  Book Vastu consultation
GET    /api/vastu/my-bookings        Get user's bookings (protected)
POST   /api/vastu/save-analysis      Save Vastu analysis (protected)

GET    /api/health                  Health check
```

---

## FLASK BACKEND SETUP

```bash
cd decorvista-flask
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Gemini and HuggingFace keys

python app.py   # development
```

Runs on: http://localhost:5001

### API Endpoints:
```
POST   /api/ai/redesign       AI room redesign (image upload)
POST   /api/ai/describe       Describe room with Gemini vision

POST   /api/vastu/analyze     Vastu analysis
GET    /api/vastu/directions  Get all direction rules
GET    /api/vastu/rules/:type Get rules for room type

GET    /api/health            Health check
```

---

## DEPLOYMENT (FREE TIER)

### Frontend → Vercel
```bash
cd decorvista-frontend
# Update .env for production:
VITE_NODE_API_URL=https://your-node-app.onrender.com
VITE_FLASK_API_URL=https://your-flask-app.onrender.com

npm run build
# Deploy dist/ folder to Vercel
```

### Node.js → Render
1. Push decorvista-node to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables (same as .env)
7. Set FRONTEND_URL to your Vercel URL

### Flask → Render
1. Push decorvista-flask to GitHub
2. Render → New Web Service
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Add environment variables
6. Set FRONTEND_URL to your Vercel URL

### CORS UPDATE FOR PRODUCTION
After deploying, update FRONTEND_URL in both backends to your actual Vercel domain.

---

## PROJECT STRUCTURE

```
decorvista-node/
├── models/
│   ├── User.js
│   ├── Design.js
│   └── VastuBooking.js
├── routes/
│   ├── auth.js
│   ├── designs.js
│   └── vastu.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── .env

decorvista-flask/
├── routes/
│   ├── __init__.py
│   ├── ai_routes.py
│   └── vastu_routes.py
├── app.py
├── requirements.txt
└── .env
```

---

## NOTES

- Vastu analysis works 100% WITHOUT any API keys (pure Python rule engine)
- AI Redesign tries HuggingFace first, falls back to Gemini description if model is loading
- HuggingFace free tier models can take 20-30s to warm up after inactivity
- All image processing done server-side, images compressed before API calls
- JWT tokens expire in 7 days
