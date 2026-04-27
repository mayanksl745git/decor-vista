from flask import Blueprint, request, jsonify
import requests
import base64
import os
import io
from PIL import Image
import google.generativeai as genai

ai_bp = Blueprint('ai', __name__)

# ─── CONFIGURE GEMINI ─────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ─── HUGGINGFACE CONFIG ───────────────────────────────────────────────────────
HF_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
HF_MODEL_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"

# Style prompt mappings
STYLE_PROMPTS = {
    "Modern Minimalist": "modern minimalist interior design, clean lines, neutral colors, minimal furniture, bright natural light, professional photography",
    "Bohemian": "bohemian boho interior design, colorful textiles, plants, eclectic decor, warm lighting, artistic, layered textures",
    "Scandinavian": "Scandinavian interior design, hygge, white walls, natural wood, cozy textiles, simple clean design, natural light",
    "Industrial": "industrial interior design, exposed brick, metal pipes, concrete floors, Edison bulbs, reclaimed wood furniture",
    "Traditional Indian": "traditional Indian interior design, vibrant colors, ethnic patterns, wooden furniture, brass accents, Rajasthani style, warm lighting",
    "Luxury Contemporary": "luxury contemporary interior design, marble floors, high-end furniture, gold accents, dramatic lighting, opulent, sophisticated",
    "Rustic/Farmhouse": "rustic farmhouse interior design, shiplap walls, barn doors, distressed wood, cozy textiles, neutral palette",
    "Japandi": "Japandi interior design, Japanese minimalism, Scandinavian functionality, natural materials, wabi-sabi, zen, neutral tones"
}


def compress_image(image_bytes, max_size_kb=500):
    """Compress image to stay within API limits."""
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    
    # Resize if too large
    max_dimension = 768
    if max(img.size) > max_dimension:
        img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    
    # Compress
    output = io.BytesIO()
    quality = 85
    while quality > 20:
        output.seek(0)
        output.truncate()
        img.save(output, format='JPEG', quality=quality)
        if len(output.getvalue()) <= max_size_kb * 1024:
            break
        quality -= 10
    
    return output.getvalue()


# ─── POST /api/ai/redesign ────────────────────────────────────────────────────
@ai_bp.route('/redesign', methods=['POST'])
def redesign_room():
    try:
        # Get inputs
        style = request.form.get('style', 'Modern Minimalist')
        room_type = request.form.get('roomType', 'Living Room')
        color_pref = request.form.get('colorPreference', 'No preference')
        custom_prompt = request.form.get('prompt', '')
        image_file = request.files.get('image')

        if not image_file:
            return jsonify({"success": False, "message": "Please upload a room image."}), 400

        # Read and compress image
        image_bytes = image_file.read()
        compressed = compress_image(image_bytes)
        image_b64 = base64.b64encode(compressed).decode('utf-8')

        # Build style prompt
        style_description = STYLE_PROMPTS.get(style, STYLE_PROMPTS["Modern Minimalist"])
        color_note = f", {color_pref} color palette" if color_pref != "No preference" else ""
        extra = f", {custom_prompt}" if custom_prompt.strip() else ""
        full_prompt = f"Interior design of a {room_type.lower()}, {style_description}{color_note}{extra}, high quality, 4k, photorealistic, interior photography"

        # ── Try HuggingFace img2img first ──────────────────────────────────────
        if HF_API_KEY:
            try:
                hf_headers = {"Authorization": f"Bearer {HF_API_KEY}"}
                hf_payload = {
                    "inputs": full_prompt,
                    "parameters": {
                        "num_inference_steps": 30,
                        "guidance_scale": 7.5,
                    }
                }
                hf_response = requests.post(HF_MODEL_URL, headers=hf_headers, json=hf_payload, timeout=60)

                if hf_response.status_code == 200:
                    result_b64 = base64.b64encode(hf_response.content).decode('utf-8')
                    return jsonify({
                        "success": True,
                        "imageUrl": f"data:image/jpeg;base64,{result_b64}",
                        "style": style,
                        "prompt": full_prompt,
                        "source": "huggingface"
                    })

                # Model is loading (503) — fall through to Gemini
                if hf_response.status_code == 503:
                    print("HuggingFace model loading, falling back to Gemini...")

            except Exception as hf_err:
                print(f"HuggingFace error: {hf_err}, falling back to Gemini...")

        # ── Fallback: Use Gemini Vision to describe redesign ───────────────────
        if GEMINI_API_KEY:
            try:
                model = genai.GenerativeModel('gemini-2.0-flash')

                gemini_prompt = f"""
                You are an expert interior designer. Analyze this room photo and describe in vivid detail 
                how it would look redesigned in {style} style for a {room_type}.
                
                Style details: {style_description}{color_note}{extra}
                
                Provide:
                1. A detailed visual description of the redesigned room (colors, furniture, lighting, textures)
                2. 5 specific changes to make
                3. Color palette (give 4-5 hex codes)
                4. Key furniture pieces to add/change
                
                Format as JSON with keys: description, changes (array), colorPalette (array of hex), furniture (array)
                """

                img_part = {
                    "mime_type": "image/jpeg",
                    "data": image_b64
                }

                response = model.generate_content([gemini_prompt, img_part])
                
                # Parse Gemini response
                text = response.text.strip()
                # Clean JSON if wrapped in markdown
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()

                import json
                try:
                    gemini_data = json.loads(text)
                except:
                    gemini_data = {"description": text, "changes": [], "colorPalette": [], "furniture": []}

                return jsonify({
                    "success": True,
                    "imageUrl": f"data:image/jpeg;base64,{image_b64}",  # return original + description
                    "geminiDescription": gemini_data,
                    "style": style,
                    "source": "gemini",
                    "message": "AI analysis complete. Image generation model is warming up — try again in 20 seconds for full redesign."
                })

            except Exception as gemini_err:
                print(f"Gemini error: {gemini_err}")
                return jsonify({
                    "success": False,
                    "message": f"AI service temporarily unavailable. Please try again in a moment."
                }), 503

        return jsonify({"success": False, "message": "No AI API configured. Please add GEMINI_API_KEY or HUGGINGFACE_API_KEY."}), 500

    except Exception as e:
        print(f"Redesign error: {e}")
        return jsonify({"success": False, "message": "Image processing failed. Please try again."}), 500


# ─── POST /api/ai/describe ────────────────────────────────────────────────────
# Describe room using Gemini vision (helper endpoint)
@ai_bp.route('/describe', methods=['POST'])
def describe_room():
    try:
        image_file = request.files.get('image')
        if not image_file:
            return jsonify({"success": False, "message": "Image required"}), 400

        if not GEMINI_API_KEY:
            return jsonify({"success": False, "message": "Gemini API not configured"}), 500

        image_bytes = image_file.read()
        compressed = compress_image(image_bytes)
        image_b64 = base64.b64encode(compressed).decode('utf-8')

        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = """Analyze this room image and return JSON with:
        - roomType (string): what kind of room this is
        - currentStyle (string): current design style
        - mainColors (array): dominant colors present
        - furniturePresent (array): furniture items visible
        - estimatedSize (string): small/medium/large
        - issues (array): design issues or areas for improvement
        Return ONLY valid JSON, no markdown."""

        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_b64}
        ])

        import json
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(text)

        return jsonify({"success": True, "analysis": data})

    except Exception as e:
        print(f"Describe error: {e}")
        return jsonify({"success": False, "message": "Could not analyze image."}), 500
