# DecorVista — Complete Step-by-Step Setup Guide
# Read this fully before starting. Follow in exact order.

==============================================================
PHASE 1 — GET YOUR FREE API KEYS (Do this first, takes 15 min)
==============================================================

─────────────────────────────────────────────
STEP 1: MongoDB Atlas (your database)
─────────────────────────────────────────────
1. Open browser → go to: https://mongodb.com/atlas
2. Click "Try Free" → Sign up with Google or email
3. Choose FREE plan (M0 Sandbox) — DO NOT select paid
4. Select region: Mumbai (ap-south-1) — closest to India
5. Click "Create Cluster" → wait 2-3 minutes

6. Left sidebar → "Database Access" → "Add New Database User"
   - Username: decorvista_user
   - Password: click "Autogenerate" → COPY AND SAVE THIS PASSWORD
   - Role: "Read and write to any database"
   - Click "Add User"

7. Left sidebar → "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"

8. Left sidebar → "Database" → Click "Connect" on your cluster
   - Choose "Drivers"
   - Select: Node.js, Version 5.5 or later
   - Copy the connection string — looks like:
     mongodb+srv://decorvista_user:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   - Replace <password> with the password you saved in step 6
   - Add database name after .net/ → change to:
     mongodb+srv://decorvista_user:YOURPASSWORD@cluster0.abc123.mongodb.net/decorvista?retryWrites=true&w=majority
   - SAVE THIS — you need it for Node.js .env file

─────────────────────────────────────────────
STEP 2: Gemini API Key (AI features)
─────────────────────────────────────────────
1. Go to: https://aistudio.google.com
2. Sign in with your Google account
3. Click "Get API Key" (top left or center button)
4. Click "Create API Key in new project"
5. Copy the key — looks like: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
6. SAVE THIS — you need it for Flask .env file
   Free tier: 15 requests/minute, 1500 requests/day — enough for development

─────────────────────────────────────────────
STEP 3: HuggingFace API Key (AI image generation)
─────────────────────────────────────────────
WHICH MODEL TO USE: stabilityai/stable-diffusion-2-1
This is the best free model for interior design image generation.
It is already hardcoded in the Flask backend — you just need the API key.

HOW TO GET THE KEY:
1. Go to: https://huggingface.co
2. Click "Sign Up" → create account with email
3. Verify your email
4. After login → click your profile picture (top right)
5. Click "Settings"
6. Left sidebar → click "Access Tokens"
7. Click "New token"
   - Name: decorvista
   - Role: "Read" (not write)
8. Click "Generate a token"
9. Copy the token — looks like: hf_aBcDeFgHiJkLmNoPqRsTuVwXyZ
10. SAVE THIS — you need it for Flask .env file

WHY THIS MODEL:
- stabilityai/stable-diffusion-2-1 is free on HuggingFace inference API
- Good quality for room/interior images
- If it's loading (first request takes 20-30s), the backend auto-falls back to Gemini
- No credit card required

==============================================================
PHASE 2 — CREATE FOLDER STRUCTURE ON YOUR COMPUTER
==============================================================

─────────────────────────────────────────────
STEP 4: Create project folders
─────────────────────────────────────────────
Open File Explorer. Create this structure:

  decorvista/                    ← main project folder
  ├── decorvista-frontend/       ← React app (TRAE will create this)
  ├── decorvista-node/           ← Node.js backend (from download)
  └── decorvista-flask/          ← Flask backend (from download)

HOW TO CREATE:
1. Right-click Desktop or Documents → New Folder → name it "decorvista"
2. Open that folder
3. Inside, create "decorvista-node" folder
4. Inside, create "decorvista-flask" folder
5. TRAE will create "decorvista-frontend" when it builds

─────────────────────────────────────────────
STEP 5: Copy backend files into folders
─────────────────────────────────────────────
From the downloaded files (from this chat):

INTO decorvista-node/ copy these files:
  ✓ server.js
  ✓ package.json
  ✓ README.md
  ✓ .gitignore
  ✓ .env.example    ← you will rename this to .env and fill values

  INTO decorvista-node/models/ (create this subfolder):
    ✓ User.js
    ✓ Design.js
    ✓ VastuBooking.js

  INTO decorvista-node/routes/ (create this subfolder):
    ✓ auth.js
    ✓ designs.js
    ✓ vastu.js

  INTO decorvista-node/middleware/ (create this subfolder):
    ✓ auth.js

INTO decorvista-flask/ copy these files:
  ✓ app.py
  ✓ requirements.txt
  ✓ .gitignore
  ✓ .env.example    ← rename to .env and fill values

  INTO decorvista-flask/routes/ (create this subfolder):
    ✓ __init__.py
    ✓ ai_routes.py
    ✓ vastu_routes.py

─────────────────────────────────────────────
STEP 6: Create .env files (CRITICAL STEP)
─────────────────────────────────────────────

A) In decorvista-node/ folder:
   - Find .env.example
   - Make a copy and rename it to just: .env   (no .example)
   - Open .env with Notepad or VS Code
   - Fill in the values:

   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://decorvista_user:YOURPASSWORD@cluster0.XXXXX.mongodb.net/decorvista?retryWrites=true&w=majority
   JWT_SECRET=decorvista_any_long_random_string_here_123
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000

   Replace YOURPASSWORD and cluster0.XXXXX with your actual MongoDB values from Step 1.

B) In decorvista-flask/ folder:
   - Find .env.example
   - Copy and rename to: .env
   - Open and fill:

   FLASK_PORT=5001
   FLASK_ENV=development
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXX   ← from Step 2
   HUGGINGFACE_API_KEY=hf_XXXXXXXXXX    ← from Step 3
   FRONTEND_URL=http://localhost:3000

   IMPORTANT: Never share or upload .env files to GitHub.

==============================================================
PHASE 3 — INSTALL DEPENDENCIES AND RUN BACKENDS
==============================================================

─────────────────────────────────────────────
STEP 7: Install Node.js backend
─────────────────────────────────────────────
1. Open VS Code
2. File → Open Folder → select decorvista-node
3. Open terminal in VS Code: Ctrl + ` (backtick)
4. You should see path ending in decorvista-node
5. Run:
   npm install

   Wait for it to finish — installs express, mongoose, bcryptjs, etc.
   You will see a node_modules folder appear — that's correct.

6. Test run:
   npm run dev

   You should see:
   ✅ MongoDB connected
   🚀 Node server running on port 5000

   If you see an error about MongoDB — double check your MONGODB_URI in .env
   Keep this terminal open and running.

─────────────────────────────────────────────
STEP 8: Install Flask backend
─────────────────────────────────────────────
1. Open a NEW VS Code window (don't close the Node one)
2. File → Open Folder → select decorvista-flask
3. Open terminal: Ctrl + `
4. Create virtual environment:

   python -m venv venv

   This creates a venv folder — that's correct.

5. Activate virtual environment:

   Windows:
   venv\Scripts\activate

   Mac/Linux:
   source venv/bin/activate

   You'll see (venv) at start of terminal line — that means it's active.

6. Install dependencies:
   pip install -r requirements.txt

   Wait for all packages to install.

7. Test run:
   python app.py

   You should see:
   🚀 Flask server running on port 5001

   Keep this terminal open too.

─────────────────────────────────────────────
STEP 9: Test that both backends are working
─────────────────────────────────────────────
Open your browser and go to:

  http://localhost:5000/api/health
  → Should show: {"success":true,"message":"DecorVista Node API is running"}

  http://localhost:5001/api/health
  → Should show: {"success":true,"message":"DecorVista Flask API is running"}

If both show those messages — BOTH BACKENDS ARE WORKING ✅

==============================================================
PHASE 4 — CONNECT FRONTEND TO BACKENDS
==============================================================

─────────────────────────────────────────────
STEP 10: Set frontend .env
─────────────────────────────────────────────
After TRAE builds your frontend (decorvista-frontend folder):

1. Open decorvista-frontend folder
2. Find the .env file (TRAE should have created it)
   If not — create a new file named exactly: .env
3. Make sure it contains:

   VITE_NODE_API_URL=http://localhost:5000
   VITE_FLASK_API_URL=http://localhost:5001

4. Save the file
5. If React dev server is running, restart it:
   Ctrl+C → then: npm run dev

─────────────────────────────────────────────
STEP 11: Verify frontend-backend connection
─────────────────────────────────────────────
1. Open your React app in browser: http://localhost:3000
2. Go to Register page
3. Fill in name, email, password and submit
4. If it redirects to Dashboard — CONNECTION IS WORKING ✅
5. If you get a CORS error in browser console:
   - Make sure FRONTEND_URL in Node .env = http://localhost:3000
   - Restart Node server: Ctrl+C → npm run dev

==============================================================
PHASE 5 — DEPLOYMENT (DO THIS LAST AFTER EVERYTHING WORKS)
==============================================================

─────────────────────────────────────────────
STEP 12: Deploy Node backend to Render
─────────────────────────────────────────────
1. Push decorvista-node to GitHub (create new repo)
2. Go to: https://render.com → Sign up free
3. New → Web Service → Connect GitHub → select decorvista-node repo
4. Settings:
   - Name: decorvista-node
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.js
5. Add Environment Variables (same as your .env):
   - PORT = 10000  (Render uses 10000 by default — it auto-handles this)
   - MONGODB_URI = your full mongodb URI
   - JWT_SECRET = your secret
   - JWT_EXPIRE = 7d
   - FRONTEND_URL = https://your-app.vercel.app  (fill after Vercel deploy)
6. Click Deploy
7. Copy your Render URL: https://decorvista-node.onrender.com

─────────────────────────────────────────────
STEP 13: Deploy Flask backend to Render
─────────────────────────────────────────────
1. Push decorvista-flask to GitHub (new repo)
2. Render → New Web Service → Connect repo
3. Settings:
   - Name: decorvista-flask
   - Runtime: Python
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app
4. Environment Variables:
   - GEMINI_API_KEY = your key
   - HUGGINGFACE_API_KEY = your key
   - FRONTEND_URL = https://your-app.vercel.app
5. Deploy → copy URL: https://decorvista-flask.onrender.com

─────────────────────────────────────────────
STEP 14: Deploy Frontend to Vercel
─────────────────────────────────────────────
1. Push decorvista-frontend to GitHub
2. Go to: https://vercel.com → Sign up free
3. New Project → Import GitHub repo → select decorvista-frontend
4. Before deploying — add Environment Variables in Vercel dashboard:
   - VITE_NODE_API_URL = https://decorvista-node.onrender.com
   - VITE_FLASK_API_URL = https://decorvista-flask.onrender.com
5. Deploy
6. Copy your Vercel URL: https://decorvista.vercel.app

─────────────────────────────────────────────
STEP 15: Update CORS after deployment
─────────────────────────────────────────────
1. Go to Render dashboard
2. Open decorvista-node service → Environment → update:
   FRONTEND_URL = https://decorvista.vercel.app
3. Open decorvista-flask service → Environment → update:
   FRONTEND_URL = https://decorvista.vercel.app
4. Both services will auto-redeploy

YOUR APP IS NOW LIVE ✅

==============================================================
QUICK REFERENCE — ALL PORTS AND URLS
==============================================================

LOCAL DEVELOPMENT:
  React frontend:    http://localhost:3000
  Node backend:      http://localhost:5000
  Flask backend:     http://localhost:5001

PRODUCTION (after deploy):
  Frontend:          https://your-app.vercel.app
  Node backend:      https://decorvista-node.onrender.com
  Flask backend:     https://decorvista-flask.onrender.com

==============================================================
TROUBLESHOOTING
==============================================================

❌ "Cannot connect to MongoDB"
→ Check MONGODB_URI in .env — make sure password has no special chars
→ Check Network Access in Atlas — must allow 0.0.0.0/0

❌ "CORS error" in browser
→ Make sure FRONTEND_URL in Node .env matches exactly: http://localhost:3000
→ Restart Node server after changing .env

❌ "Module not found" in Node
→ Run: npm install again

❌ "ModuleNotFoundError" in Flask
→ Make sure venv is activated (see venv\Scripts\activate)
→ Run: pip install -r requirements.txt again

❌ HuggingFace returns 503
→ Normal! Model is warming up. Wait 30 seconds and try again.
→ Backend automatically falls back to Gemini description mode

❌ Flask .env not loading
→ Make sure .env file is in decorvista-flask/ root folder (same level as app.py)
→ Make sure python-dotenv is installed

❌ Render deployment fails
→ Check build logs on Render dashboard
→ Make sure all env variables are added in Render settings
→ For Flask: make sure gunicorn is in requirements.txt
