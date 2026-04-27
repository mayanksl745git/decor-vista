from flask import Blueprint, request, jsonify
import os
import json
import google.generativeai as genai

vastu_bp = Blueprint('vastu', __name__)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# ─── VASTU RULES ENGINE ───────────────────────────────────────────────────────
# Pure Python logic — works without any API

DIRECTION_ELEMENTS = {
    "North": {"element": "Water", "governs": "Career, finances", "color": "Blue/Green", "good_for": ["Water fountain", "Aquarium", "Study room", "Locker/Safe"]},
    "NE": {"element": "Water+Earth", "governs": "Knowledge, spirituality", "color": "Yellow/White", "good_for": ["Pooja room", "Meditation corner", "Study area"], "avoid": ["Toilet", "Kitchen", "Heavy storage"]},
    "East": {"element": "Wood/Air", "governs": "Health, new beginnings", "color": "Green/Orange", "good_for": ["Main entrance", "Living room", "Bathroom"], "avoid": ["Toilet in extreme east"]},
    "SE": {"element": "Fire", "governs": "Wealth, energy", "color": "Orange/Red", "good_for": ["Kitchen", "Generator", "Electrical appliances"], "avoid": ["Bedroom", "Pooja room"]},
    "South": {"element": "Fire", "governs": "Fame, stability", "color": "Red/Pink", "good_for": ["Master bedroom", "Guest room"], "avoid": ["Main entrance", "Water elements"]},
    "SW": {"element": "Earth", "governs": "Relationships, stability", "color": "Brown/Yellow", "good_for": ["Master bedroom (owner)", "Heavy storage", "Staircase"], "avoid": ["Kitchen", "Pooja room", "Toilet"]},
    "West": {"element": "Metal", "governs": "Creativity, children", "color": "White/Grey", "good_for": ["Children's room", "Dining room", "Study"], "avoid": []},
    "NW": {"element": "Air", "governs": "Support, guests", "color": "White/Light Blue", "good_for": ["Guest room", "Bathroom", "Garage"], "avoid": ["Main bedroom for owner"]}
}

BED_DIRECTION_RULES = {
    "South": {"score": 10, "label": "Excellent", "reason": "Promotes deep sleep, aligns with Earth's magnetic field"},
    "East": {"score": 8, "label": "Good", "reason": "Promotes energy and health, good for students"},
    "West": {"score": 5, "label": "Acceptable", "reason": "Neutral direction, acceptable for adults"},
    "North": {"score": 0, "label": "Avoid", "reason": "Head pointing North creates magnetic interference, causes health issues and disturbed sleep"}
}

ROOM_VASTU_RULES = {
    "Bedroom": {
        "best_directions": ["SW", "South", "West"],
        "avoid_directions": ["NE", "SE"],
        "rules": [
            "Master bedroom should be in SW for the house owner",
            "Bed head should point South or East, never North",
            "Mirror should not face the bed",
            "Avoid placing TV in bedroom if possible",
            "Keep NE corner light and clutter-free",
            "No water elements (aquarium, fountain) in bedroom"
        ]
    },
    "Kitchen": {
        "best_directions": ["SE"],
        "avoid_directions": ["NE", "SW", "North"],
        "rules": [
            "Kitchen is best in South-East (fire zone)",
            "Cook while facing East for prosperity",
            "Gas stove should be in SE corner of kitchen",
            "Sink (water) should be in NE or North of kitchen",
            "Never place kitchen directly below or above pooja room or toilet",
            "Refrigerator is best in SW corner of kitchen"
        ]
    },
    "Living Room": {
        "best_directions": ["North", "NE", "East"],
        "avoid_directions": [],
        "rules": [
            "Living room best in North, NE or East",
            "Main sofa set should face East or North",
            "TV can be placed on South or East wall",
            "Keep center of room (Brahmasthan) open and clutter-free",
            "Heavy furniture like sofa in South or West",
            "Indoor plants are good in East or North"
        ]
    },
    "Bathroom": {
        "best_directions": ["NW", "SE", "West"],
        "avoid_directions": ["NE", "SW"],
        "rules": [
            "Bathroom best in NW or West",
            "Toilet seat should face North or South, not East or West",
            "Never place bathroom in NE (most sacred zone) — very inauspicious",
            "SW bathroom weakens the owner",
            "Bathroom door should not face kitchen or pooja room"
        ]
    },
    "Pooja Room": {
        "best_directions": ["NE"],
        "avoid_directions": ["South", "SW", "SE"],
        "rules": [
            "Pooja room must be in NE — the most sacred direction",
            "Face East or North while praying",
            "Keep pooja room at ground floor if possible",
            "Never place pooja room in bedroom or near toilet",
            "Use white, yellow or light colors",
            "Keep this area always clean and well-lit"
        ]
    },
    "Office": {
        "best_directions": ["North", "East", "NE"],
        "avoid_directions": [],
        "rules": [
            "Home office best in North (career zone)",
            "Sit facing East or North while working",
            "Keep clutter away from workstation",
            "Place computer on SE side of desk",
            "Keep a small plant on East or North of desk"
        ]
    }
}


def calculate_vastu_score(room_type, facing_direction, elements):
    """Calculate Vastu score based on room type, direction, and elements."""
    score = 50  # baseline
    issues = []
    positives = []
    recommendations = []

    room_rules = ROOM_VASTU_RULES.get(room_type, ROOM_VASTU_RULES["Living Room"])
    direction_info = DIRECTION_ELEMENTS.get(facing_direction, {})

    # Direction scoring
    if facing_direction in room_rules.get("best_directions", []):
        score += 25
        positives.append(f"✅ {room_type} in {facing_direction} direction is ideal — {direction_info.get('governs', '')}")
    elif facing_direction in room_rules.get("avoid_directions", []):
        score -= 25
        issues.append({
            "issue": f"{room_type} in {facing_direction} direction is problematic",
            "severity": "Critical",
            "reason": f"{facing_direction} governs {direction_info.get('governs', '')} — not suitable for {room_type}"
        })
        recommendations.append(f"Consider shifting {room_type} to {', '.join(room_rules['best_directions'])} direction if possible")
    else:
        score += 5
        positives.append(f"Room direction is acceptable")

    # Element-specific scoring
    if room_type == "Bedroom":
        if "Mirror" in elements:
            issues.append({"issue": "Mirror may be facing bed", "severity": "Moderate", "reason": "Mirror facing bed disturbs sleep and health"})
            score -= 10
            recommendations.append("Ensure mirror does not directly face the bed. Cover at night if repositioning isn't possible.")
        else:
            positives.append("✅ No mirror placement issue detected")

        if "Water Element" in elements and facing_direction not in ["North", "NE"]:
            issues.append({"issue": "Water element in bedroom", "severity": "Minor", "reason": "Water elements in bedroom can cause restlessness"})
            score -= 5
            recommendations.append("Remove aquarium or water fountain from bedroom")

    if room_type == "Kitchen":
        if "Water Element" in elements:
            positives.append("✅ Water element in kitchen — ensure it's in North or NE of kitchen")
        if facing_direction == "NE":
            issues.append({"issue": "Kitchen in NE is very inauspicious", "severity": "Critical", "reason": "NE is sacred zone — fire element here destroys prosperity"})
            score -= 30
            recommendations.append("Kitchen must not be in NE. Shift to SE if possible, or at least East.")

    if room_type == "Bathroom" and facing_direction == "NE":
        issues.append({"issue": "Toilet/Bathroom in NE is extremely inauspicious", "severity": "Critical", "reason": "NE is the most sacred direction — toilet here causes severe negativity"})
        score -= 35
        recommendations.append("Toilet in NE must be closed/relocated. This is the most critical Vastu defect.")

    # Clamp score
    score = max(0, min(100, score))

    # Add general recommendations from room rules
    recommendations.extend(room_rules["rules"][:3])

    # Placement guide based on direction
    placement_guide = []
    if room_type == "Bedroom":
        placement_guide = [
            {"item": "Bed head direction", "ideal": "South or East", "avoid": "North"},
            {"item": "Wardrobe", "ideal": "South or West wall", "avoid": "NE corner"},
            {"item": "Study table", "ideal": "East or North wall", "avoid": "South wall"},
            {"item": "TV", "ideal": "South wall (face North while watching)", "avoid": "East wall facing west"},
            {"item": "Mirror", "ideal": "North or East wall", "avoid": "Facing bed or South wall"},
        ]
    elif room_type == "Kitchen":
        placement_guide = [
            {"item": "Gas stove", "ideal": "SE corner, cook facing East", "avoid": "NE corner"},
            {"item": "Refrigerator", "ideal": "SW corner of kitchen", "avoid": "NE corner"},
            {"item": "Sink", "ideal": "North or NE of kitchen", "avoid": "SE (opposite to stove)"},
            {"item": "Storage", "ideal": "South and West walls", "avoid": "NE corner"},
        ]
    elif room_type == "Living Room":
        placement_guide = [
            {"item": "Main sofa", "ideal": "South or West wall, face East/North", "avoid": "Center of room"},
            {"item": "TV unit", "ideal": "South or East wall", "avoid": "North wall"},
            {"item": "Indoor plants", "ideal": "East or North corner", "avoid": "South corner"},
            {"item": "Center table", "ideal": "Keep it light, easy to move", "avoid": "Heavy furniture at center"},
        ]

    return {
        "score": score,
        "label": "Excellent" if score >= 71 else ("Good" if score >= 51 else ("Average" if score >= 31 else "Poor")),
        "positives": positives,
        "issues": issues,
        "recommendations": recommendations[:6],
        "placementGuide": placement_guide,
        "directionInfo": direction_info
    }


# ─── POST /api/vastu/analyze ──────────────────────────────────────────────────
@vastu_bp.route('/analyze', methods=['POST'])
def analyze_vastu():
    try:
        data = request.get_json()
        if not data:
            data = request.form.to_dict()

        room_type = data.get('roomType', 'Living Room')
        facing_direction = data.get('facingDirection', 'North')
        floor = data.get('floor', 'Ground')
        elements = data.get('elements', [])

        # Validate
        valid_rooms = list(ROOM_VASTU_RULES.keys())
        valid_directions = list(DIRECTION_ELEMENTS.keys())

        if room_type not in valid_rooms:
            room_type = "Living Room"
        if facing_direction not in valid_directions:
            facing_direction = "North"

        # Calculate base score with rule engine
        result = calculate_vastu_score(room_type, facing_direction, elements)

        # If Gemini available, enhance recommendations
        if GEMINI_API_KEY:
            try:
                model = genai.GenerativeModel('gemini-2.0-flash')
                gemini_prompt = f"""
                You are a Vastu Shastra expert. A user has a {room_type} facing {facing_direction} direction on {floor} floor.
                Elements present: {', '.join(elements) if elements else 'standard furniture'}.
                
                Provide 3 specific, practical Vastu recommendations for this room in Indian context.
                Be specific about directions (North, South, etc.) and practical changes.
                Return as a JSON array of strings. Example: ["Move bed to...", "Place a..."]
                Return ONLY the JSON array, nothing else.
                """
                response = model.generate_content(gemini_prompt)
                text = response.text.strip().replace("```json", "").replace("```", "").strip()
                ai_recommendations = json.loads(text)
                result["aiRecommendations"] = ai_recommendations
            except Exception as e:
                print(f"Gemini enhancement error: {e}")
                result["aiRecommendations"] = []
        else:
            result["aiRecommendations"] = []

        return jsonify({"success": True, "result": result})

    except Exception as e:
        print(f"Vastu analyze error: {e}")
        return jsonify({"success": False, "message": "Analysis failed. Please try again."}), 500


# ─── GET /api/vastu/directions ────────────────────────────────────────────────
# Return full direction rules for Room Guide tab
@vastu_bp.route('/directions', methods=['GET'])
def get_directions():
    return jsonify({"success": True, "directions": DIRECTION_ELEMENTS})


# ─── GET /api/vastu/rules/:room_type ─────────────────────────────────────────
@vastu_bp.route('/rules/<room_type>', methods=['GET'])
def get_room_rules(room_type):
    rules = ROOM_VASTU_RULES.get(room_type)
    if not rules:
        return jsonify({"success": False, "message": "Room type not found"}), 404
    return jsonify({"success": True, "roomType": room_type, "rules": rules})
