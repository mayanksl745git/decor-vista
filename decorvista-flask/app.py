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
            "https://*.vercel.app",  # allow all Vercel deployments
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

# ─── 404 HANDLER ──────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return {"success": False, "message": "Route not found"}, 404

@app.errorhandler(500)
def server_error(e):
    return {"success": False, "message": "Internal server error"}, 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"🚀 Flask server running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
