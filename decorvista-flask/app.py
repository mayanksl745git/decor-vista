from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS(app, resources={
    r"/api/*": {
        "origins": [
            os.getenv("FRONTEND_URL", "http://localhost:3000"),
            "https://*.vercel.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ─── ROUTES ───────────────────────────────────────────────────────────────────
from routes.ai_routes import ai_bp
from routes.vastu_routes import vastu_bp

app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(vastu_bp, url_prefix='/api/vastu')

# ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return {"success": True, "message": "DecorVista Flask API is running"}

# ─── ERROR HANDLERS ───────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return {"success": False, "message": "Route not found"}, 404

@app.errorhandler(500)
def server_error(e):
    return {"success": False, "message": "Internal server error"}, 500

# ─── RUN SERVER (RENDER FIX) ──────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))  # ✅ REQUIRED FIX
    print(f"🚀 Flask server running on port {port}")
    app.run(host='0.0.0.0', port=port)