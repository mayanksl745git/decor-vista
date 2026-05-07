# from flask import Blueprint, request, jsonify
# import requests
# import base64
# import os
# import io
# from PIL import Image
# # import google.generativeai as genai

# ai_bp = Blueprint('ai', __name__)

# # ─── CONFIGURE GEMINI ─────────────────────────────────────────────────────────
# # GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# # if GEMINI_API_KEY:
# #     genai.configure(api_key=GEMINI_API_KEY)

# # ─── HUGGINGFACE CONFIG ───────────────────────────────────────────────────────
# HF_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
# HF_MODEL_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"

# # Style prompt mappings
# STYLE_PROMPTS = {
#     "Modern Minimalist": "modern minimalist interior design, clean lines, neutral colors, minimal furniture, bright natural light, professional photography",
#     "Bohemian": "bohemian boho interior design, colorful textiles, plants, eclectic decor, warm lighting, artistic, layered textures",
#     "Scandinavian": "Scandinavian interior design, hygge, white walls, natural wood, cozy textiles, simple clean design, natural light",
#     "Industrial": "industrial interior design, exposed brick, metal pipes, concrete floors, Edison bulbs, reclaimed wood furniture",
#     "Traditional Indian": "traditional Indian interior design, vibrant colors, ethnic patterns, wooden furniture, brass accents, Rajasthani style, warm lighting",
#     "Luxury Contemporary": "luxury contemporary interior design, marble floors, high-end furniture, gold accents, dramatic lighting, opulent, sophisticated",
#     "Rustic/Farmhouse": "rustic farmhouse interior design, shiplap walls, barn doors, distressed wood, cozy textiles, neutral palette",
#     "Japandi": "Japandi interior design, Japanese minimalism, Scandinavian functionality, natural materials, wabi-sabi, zen, neutral tones"
# }


# def compress_image(image_bytes, max_size_kb=500):
#     """Compress image to stay within API limits."""
#     img = Image.open(io.BytesIO(image_bytes))
    
#     # Convert to RGB if needed
#     if img.mode in ('RGBA', 'P'):
#         img = img.convert('RGB')
    
#     # Resize if too large
#     max_dimension = 768
#     if max(img.size) > max_dimension:
#         img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    
#     # Compress
#     output = io.BytesIO()
#     quality = 85
#     while quality > 20:
#         output.seek(0)
#         output.truncate()
#         img.save(output, format='JPEG', quality=quality)
#         if len(output.getvalue()) <= max_size_kb * 1024:
#             break
#         quality -= 10
    
#     return output.getvalue()


# # ─── POST /api/ai/redesign ────────────────────────────────────────────────────
# @ai_bp.route('/redesign', methods=['POST'])
# def redesign_room():
#     try:
#         # Get inputs
#         style = request.form.get('style', 'Modern Minimalist')
#         room_type = request.form.get('roomType', 'Living Room')
#         color_pref = request.form.get('colorPreference', 'No preference')
#         custom_prompt = request.form.get('prompt', '')
#         image_file = request.files.get('image')

#         if not image_file:
#             return jsonify({"success": False, "message": "Please upload a room image."}), 400

#         # Read and compress image
#         image_bytes = image_file.read()
#         compressed = compress_image(image_bytes)
#         image_b64 = base64.b64encode(compressed).decode('utf-8')

#         # Build style prompt
#         style_description = STYLE_PROMPTS.get(style, STYLE_PROMPTS["Modern Minimalist"])
#         color_note = f", {color_pref} color palette" if color_pref != "No preference" else ""
#         extra = f", {custom_prompt}" if custom_prompt.strip() else ""
#         full_prompt = f"Interior design of a {room_type.lower()}, {style_description}{color_note}{extra}, high quality, 4k, photorealistic, interior photography"

#         # ── Try HuggingFace img2img first ──────────────────────────────────────
#         if HF_API_KEY:
#             try:
#                 hf_headers = {"Authorization": f"Bearer {HF_API_KEY}"}
#                 hf_payload = {
#                     "inputs": full_prompt,
#                     "parameters": {
#                         "num_inference_steps": 30,
#                         "guidance_scale": 7.5,
#                     }
#                 }
#                 hf_response = requests.post(HF_MODEL_URL, headers=hf_headers, json=hf_payload, timeout=60)

#                 if hf_response.status_code == 200:
#                     result_b64 = base64.b64encode(hf_response.content).decode('utf-8')
#                     return jsonify({
#                         "success": True,
#                         "imageUrl": f"data:image/jpeg;base64,{result_b64}",
#                         "style": style,
#                         "prompt": full_prompt,
#                         "source": "huggingface"
#                     })

#                 # Model is loading (503) — fall through to Gemini
#                 if hf_response.status_code == 503:
#                     print("HuggingFace model loading, falling back to Gemini...")

#             except Exception as hf_err:
#                 print(f"HuggingFace error: {hf_err}, falling back to Gemini...")

#         # ── Fallback: Use Gemini Vision to describe redesign ───────────────────
#         # if GEMINI_API_KEY:
#         #     try:
#         #         model = genai.GenerativeModel('gemini-2.0-flash')

#         #         gemini_prompt = f"""
#         #         You are an expert interior designer. Analyze this room photo and describe in vivid detail 
#         #         how it would look redesigned in {style} style for a {room_type}.
                
#         #         Style details: {style_description}{color_note}{extra}
                
#         #         Provide:
#         #         1. A detailed visual description of the redesigned room (colors, furniture, lighting, textures)
#         #         2. 5 specific changes to make
#         #         3. Color palette (give 4-5 hex codes)
#         #         4. Key furniture pieces to add/change
                
#         #         Format as JSON with keys: description, changes (array), colorPalette (array of hex), furniture (array)
#         #         """

#         #         img_part = {
#         #             "mime_type": "image/jpeg",
#         #             "data": image_b64
#         #         }

#         #         response = model.generate_content([gemini_prompt, img_part])
                
#         #         # Parse Gemini response
#         #         text = response.text.strip()
#         #         # Clean JSON if wrapped in markdown
#         #         if "```json" in text:
#         #             text = text.split("```json")[1].split("```")[0].strip()
#         #         elif "```" in text:
#         #             text = text.split("```")[1].split("```")[0].strip()

#         #         import json
#         #         try:
#         #             gemini_data = json.loads(text)
#         #         except:
#         #             gemini_data = {"description": text, "changes": [], "colorPalette": [], "furniture": []}

#         #         return jsonify({
#         #             "success": True,
#         #             "imageUrl": f"data:image/jpeg;base64,{image_b64}",  # return original + description
#         #             "geminiDescription": gemini_data,
#         #             "style": style,
#         #             "source": "gemini",
#         #             "message": "AI analysis complete. Image generation model is warming up — try again in 20 seconds for full redesign."
#         #         })

#         #     except Exception as gemini_err:
#         #         print(f"Gemini error: {gemini_err}")
#         #         return jsonify({
#         #             "success": False,
#         #             "message": f"AI service temporarily unavailable. Please try again in a moment."
#         #         }), 503

#         # return jsonify({"success": False, "message": "No AI API configured. Please add GEMINI_API_KEY or HUGGINGFACE_API_KEY."}), 500
#         return jsonify({
#             "success": True,
#             "imageUrl": f"data:image/jpeg;base64,{image_b64}",
#             "style": style,
#             "prompt": full_prompt,
#             "source": "fallback",
#             "message": "Fallback response: showing original image with design suggestion."  
#         })

#     except Exception as e:
#         print(f"Redesign error: {e}")
#         return jsonify({"success": False, "message": "Image processing failed. Please try again."}), 500


# # ─── POST /api/ai/describe ────────────────────────────────────────────────────
# # Describe room using Gemini vision (helper endpoint)
# # @ai_bp.route('/describe', methods=['POST'])
# # def describe_room():
# #     try:
# #         image_file = request.files.get('image')
# #         if not image_file:
# #             return jsonify({"success": False, "message": "Image required"}), 400

# #         if not GEMINI_API_KEY:
# #             return jsonify({"success": False, "message": "Gemini API not configured"}), 500

# #         image_bytes = image_file.read()
# #         compressed = compress_image(image_bytes)
# #         image_b64 = base64.b64encode(compressed).decode('utf-8')

# #         model = genai.GenerativeModel('gemini-2.0-flash')
# #         prompt = """Analyze this room image and return JSON with:
# #         - roomType (string): what kind of room this is
# #         - currentStyle (string): current design style
# #         - mainColors (array): dominant colors present
# #         - furniturePresent (array): furniture items visible
# #         - estimatedSize (string): small/medium/large
# #         - issues (array): design issues or areas for improvement
# #         Return ONLY valid JSON, no markdown."""

# #         response = model.generate_content([
# #             prompt,
# #             {"mime_type": "image/jpeg", "data": image_b64}
# #         ])

# #         import json
# #         text = response.text.strip().replace("```json", "").replace("```", "").strip()
# #         data = json.loads(text)

# #         return jsonify({"success": True, "analysis": data})

# #     except Exception as e:
# #         print(f"Describe error: {e}")
# #         return jsonify({"success": False, "message": "Could not analyze image."}), 500
# @ai_bp.route('/describe', methods=['POST'])
# def describe_room():
#     return jsonify({
#         "success": True,
#         "analysis": {
#             "roomType": "Living Room",
#             "currentStyle": "Modern",
#             "mainColors": ["#ffffff", "#d3d3d3"],
#             "furniturePresent": ["sofa", "table"],
#             "estimatedSize": "medium",
#             "issues": ["Needs better lighting", "Add decor elements"]
#         }
#     })






# Updated one with Pollination AI

import os
import requests
import base64
import time
import random
import json
from flask import Blueprint, request, jsonify
import google.generativeai as genai
from PIL import Image
import io

ai_bp = Blueprint('ai', __name__)

GEMINI_KEY = os.getenv('GEMINI_API_KEY', '')
POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# ──────────────────────────────────────────────
#  STEP 1 — Analyze room image with Gemini Vision
# ──────────────────────────────────────────────
@ai_bp.route('/analyze', methods=['POST'])
def analyze_room():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    image_data = image_file.read()
    image_b64 = base64.b64encode(image_data).decode('utf-8')
    mime_type = image_file.content_type or 'image/jpeg'

    try:
        if not GEMINI_KEY:
            return jsonify({'analysis': _fallback_analysis(), 'success': True})

        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        prompt = """Analyze this room image in detail. Provide:
1. Room type (bedroom, living room, kitchen, bathroom, etc.)
2. Current style (modern, traditional, minimalist, bohemian, etc.)
3. Current furniture and decor items present (list each item)
4. Wall colors and materials
5. Floor type
6. Lighting conditions
7. Key design problems or opportunities
8. Overall mood/feel

Be specific and detailed. This analysis will be used for AI redesign."""

        response = model.generate_content([
            {'role': 'user', 'parts': [
                {'inline_data': {'mime_type': mime_type, 'data': image_b64}},
                {'text': prompt}
            ]}
        ])
        analysis_text = response.text

        # Extract furniture items as a list for checkboxes
        items_prompt = f"""From this room analysis, list ONLY the furniture and decor items as a JSON array.
Analysis: {analysis_text}
Return ONLY a JSON array of strings like: ["Sofa", "Coffee Table", "Rug", "Lamp"]
No explanation, just the JSON array."""

        items_response = model.generate_content(items_prompt)
        items_text = items_response.text.strip()
        items_text = items_text.replace('```json', '').replace('```', '').strip()
        try:
            furniture_items = json.loads(items_text)
        except:
            furniture_items = ["Sofa", "Coffee Table", "Rug", "Lamp", "Curtains", "Plants"]

        return jsonify({
            'success': True,
            'analysis': analysis_text,
            'furniture_items': furniture_items[:10],
            'room_type': _extract_room_type(analysis_text)
        })

    except Exception as e:
        print(f"Gemini analyze error: {e}")
        return jsonify({'analysis': _fallback_analysis(), 'furniture_items': ["Sofa", "Coffee Table", "Rug", "Lamp"], 'success': True})


# ──────────────────────────────────────────────
#  STEP 2 — Generate 3 design variations
# ──────────────────────────────────────────────
@ai_bp.route('/generate', methods=['POST'])
def generate_designs():
    data = request.get_json() or {}
    room_analysis = data.get('analysis', '')
    room_type = data.get('room_type', 'living room')
    style = data.get('style', 'modern minimalist')

    try:
        prompts = _build_generation_prompts(room_analysis, room_type, style)
        images = []
        for i, prompt_text in enumerate(prompts[:3]):
            seed = random.randint(1, 99999) + i * 1000
            url = _pollinations_url(prompt_text, seed=seed)
            images.append({'url': url, 'style': style, 'variation': i + 1, 'prompt': prompt_text})

        return jsonify({'success': True, 'images': images})

    except Exception as e:
        print(f"Generate error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500


# ──────────────────────────────────────────────
#  STEP 3 — Customize with user preferences
# ──────────────────────────────────────────────
@ai_bp.route('/customize', methods=['POST'])
def customize_design():
    data = request.get_json() or {}
    room_analysis = data.get('analysis', '')
    room_type = data.get('room_type', 'living room')
    selected_style = data.get('style', 'modern minimalist')
    keep_items = data.get('keep_items', [])
    remove_items = data.get('remove_items', [])
    wall_color = data.get('wall_color', 'white')
    floor_color = data.get('floor_color', 'light wood')
    ceiling_color = data.get('ceiling_color', 'white')
    custom_notes = data.get('custom_notes', '')

    try:
        keep_str = ', '.join(keep_items) if keep_items else 'all existing furniture'
        remove_str = ', '.join(remove_items) if remove_items else 'nothing'

        base_prompt = f"""Professional interior design photograph of a {room_type}, {selected_style} style.
Wall color: {wall_color}. Floor: {floor_color}. Ceiling: {ceiling_color}.
Keep these items: {keep_str}. Remove: {remove_str}.
{custom_notes if custom_notes else ''}
Photorealistic, 8K quality, professional interior photography, soft natural lighting, architectural digest style."""

        seed = random.randint(1, 99999)
        url = _pollinations_url(base_prompt, seed=seed, width=1280, height=960)

        # Generate product recommendations
        recommendations = _get_product_recommendations(room_type, selected_style)

        return jsonify({
            'success': True,
            'image_url': url,
            'prompt_used': base_prompt,
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Customize error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500


# ──────────────────────────────────────────────
#  Combined one-shot redesign (for legacy support)
# ──────────────────────────────────────────────
@ai_bp.route('/redesign', methods=['POST'])
def redesign_room():
    style = request.form.get('style', 'modern minimalist')
    room_type = request.form.get('room_type', 'living room')
    custom_notes = request.form.get('custom_notes', '')

    prompt_text = f"""Professional interior design photograph of a beautifully decorated {room_type}.
Style: {selected_style if (selected_style := style) else 'modern minimalist'}.
{custom_notes}
Photorealistic, high quality, professional interior photography, 8K resolution, 
architectural digest style, perfect lighting, luxury interior."""

    seed = random.randint(1, 99999)
    url = _pollinations_url(prompt_text, seed=seed)
    recommendations = _get_product_recommendations(room_type, style)

    return jsonify({
        'success': True,
        'image_url': url,
        'recommendations': recommendations
    })


# ──────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────
def _pollinations_url(prompt, seed=None, width=1024, height=768):
    import urllib.parse
    encoded = urllib.parse.quote(prompt)
    seed_val = seed or random.randint(1, 99999)
    return f"{POLLINATIONS_BASE}/{encoded}?width={width}&height={height}&seed={seed_val}&nologo=true&model=flux"


def _build_generation_prompts(analysis, room_type, style):
    styles = {
        'modern minimalist': [
            f"Minimalist {room_type}, clean lines, neutral palette white and grey tones, Scandinavian furniture, natural light, professional interior photo 8K",
            f"Modern minimalist {room_type}, white walls, light wood floors, simple elegant furniture, plants, soft diffused lighting, architectural digest quality",
            f"Contemporary {room_type}, minimal decor, open space, large windows, monochromatic white scheme with warm wood accents, professional photography"
        ],
        'scandinavian': [
            f"Scandinavian {room_type}, hygge aesthetic, cozy blankets, natural wood, warm lighting, white walls, simple nordic furniture, professional photo",
            f"Nordic {room_type} design, light palette, functional furniture, natural materials, candles, hygge atmosphere, 8K quality",
            f"Scandi {room_type}, birch wood elements, linen textiles, simple shapes, warm neutrals, plants, professional interior photography"
        ],
        'luxury': [
            f"Luxury high-end {room_type}, marble floors, gold accents, velvet furniture, crystal chandelier, dramatic lighting, architectural digest 8K",
            f"Premium luxury {room_type}, designer furniture, rich fabrics, elegant decor, professional interior photography, Hotel-level sophistication",
            f"Opulent {room_type} design, expensive materials, bold statement pieces, perfect staging, luxury real estate photography quality"
        ],
        'bohemian': [
            f"Bohemian {room_type}, colorful textiles, macrame wall art, plants everywhere, eclectic furniture mix, warm golden lighting, lifestyle photography",
            f"Boho chic {room_type}, layered rugs, vintage finds, earthy tones, natural materials, cozy artistic atmosphere, professional photo",
            f"Eclectic bohemian {room_type}, maximalist but curated, rich colors, cultural artifacts, plants, warm inviting space, 8K"
        ],
        'industrial': [
            f"Industrial {room_type}, exposed brick, steel beams, concrete elements, Edison bulbs, dark wood, urban loft aesthetic, professional photo",
            f"Modern industrial {room_type}, metal and wood combination, factory style, dark moody lighting, clean lines, architectural photography",
            f"Loft style industrial {room_type}, raw textures, pendant lights, reclaimed wood, black metal accents, professional interior photography"
        ]
    }
    style_lower = style.lower().replace(' ', '_')
    for key in styles:
        if key in style_lower or style_lower in key:
            return styles[key]
    # Default: modern
    return [
        f"Professional interior design photo of a beautifully decorated {room_type}, {style} style, 8K quality, architectural digest",
        f"Luxury {room_type} in {style} design, perfect staging, natural lighting, professional photography",
        f"Modern {room_type}, {style} aesthetic, high-end furniture, immaculate design, award-winning interior photography"
    ]


def _extract_room_type(analysis):
    rooms = ['living room', 'bedroom', 'kitchen', 'bathroom', 'dining room', 'office', 'study', 'hallway']
    analysis_lower = analysis.lower()
    for room in rooms:
        if room in analysis_lower:
            return room
    return 'room'


def _fallback_analysis():
    return """Room Analysis: This appears to be a residential interior space. 
The room features neutral wall colors and standard flooring. 
The space has potential for redesign with improved furniture arrangement, 
better lighting, and updated decor elements to enhance both aesthetics and functionality.
Consider adding plants, updating color scheme, and improving storage solutions."""


def _get_product_recommendations(room_type, style):
    catalog = {
        'living room': {
            'budget': [
                {'name': 'Basic Sofa', 'price': '₹12,999', 'category': 'Seating'},
                {'name': 'Coffee Table', 'price': '₹3,499', 'category': 'Tables'},
                {'name': 'Floor Lamp', 'price': '₹1,999', 'category': 'Lighting'},
                {'name': 'Area Rug', 'price': '₹2,499', 'category': 'Flooring'},
                {'name': 'Bookshelf', 'price': '₹4,999', 'category': 'Storage'}
            ],
            'midrange': [
                {'name': 'L-Shaped Sectional', 'price': '₹35,999', 'category': 'Seating'},
                {'name': 'Glass Coffee Table', 'price': '₹12,999', 'category': 'Tables'},
                {'name': 'Pendant Light Set', 'price': '₹8,999', 'category': 'Lighting'},
                {'name': 'Persian Rug', 'price': '₹15,999', 'category': 'Flooring'},
                {'name': 'TV Unit with Storage', 'price': '₹22,999', 'category': 'Storage'}
            ],
            'luxury': [
                {'name': 'Italian Leather Sofa', 'price': '₹1,25,000', 'category': 'Seating'},
                {'name': 'Marble Coffee Table', 'price': '₹45,000', 'category': 'Tables'},
                {'name': 'Crystal Chandelier', 'price': '₹55,000', 'category': 'Lighting'},
                {'name': 'Hand-knotted Rug', 'price': '₹85,000', 'category': 'Flooring'},
                {'name': 'Designer Bookcase', 'price': '₹75,000', 'category': 'Storage'}
            ]
        },
        'bedroom': {
            'budget': [
                {'name': 'Queen Bed Frame', 'price': '₹8,999', 'category': 'Beds'},
                {'name': 'Mattress (6 inch)', 'price': '₹11,999', 'category': 'Sleep'},
                {'name': 'Wardrobe 3-door', 'price': '₹14,999', 'category': 'Storage'},
                {'name': 'Bedside Table', 'price': '₹1,999', 'category': 'Tables'},
                {'name': 'Study Lamp', 'price': '₹999', 'category': 'Lighting'}
            ],
            'midrange': [
                {'name': 'King Platform Bed', 'price': '₹28,999', 'category': 'Beds'},
                {'name': 'Memory Foam Mattress', 'price': '₹32,999', 'category': 'Sleep'},
                {'name': 'Sliding Door Wardrobe', 'price': '₹45,999', 'category': 'Storage'},
                {'name': 'Marble-top Bedside', 'price': '₹8,999', 'category': 'Tables'},
                {'name': 'Ambient Light Set', 'price': '₹5,999', 'category': 'Lighting'}
            ],
            'luxury': [
                {'name': 'Upholstered King Bed', 'price': '₹95,000', 'category': 'Beds'},
                {'name': 'Premium Ortho Mattress', 'price': '₹75,000', 'category': 'Sleep'},
                {'name': 'Walk-in Closet System', 'price': '₹1,80,000', 'category': 'Storage'},
                {'name': 'Designer Bedside Set', 'price': '₹35,000', 'category': 'Tables'},
                {'name': 'Smart Lighting System', 'price': '₹45,000', 'category': 'Lighting'}
            ]
        }
    }
    room_key = room_type.lower()
    if room_key not in catalog:
        room_key = 'living room'
    return catalog[room_key]


@ai_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'gemini': bool(GEMINI_KEY), 'pollinations': True})
