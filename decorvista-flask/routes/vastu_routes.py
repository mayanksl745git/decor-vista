from flask import Blueprint, request, jsonify
import os
import json

vastu_bp = Blueprint('vastu', __name__)

# ── Groq Setup ─────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq connected for Vastu AI")
    except Exception as e:
        print(f"⚠️ Groq init failed: {e}")


# ─── DIRECTION DATA ────────────────────────────────────────────────────────────
DIRECTION_ELEMENTS = {
    "North":  {"element": "Water",        "governs": "Career, finances",        "color": "Blue/Green",       "good_for": ["Water fountain", "Aquarium", "Study room", "Locker/Safe"]},
    "NE":     {"element": "Water+Earth",  "governs": "Knowledge, spirituality", "color": "Yellow/White",     "good_for": ["Pooja room", "Meditation corner", "Study area"],          "avoid": ["Toilet", "Kitchen", "Heavy storage"]},
    "East":   {"element": "Wood/Air",     "governs": "Health, new beginnings",  "color": "Green/Orange",     "good_for": ["Main entrance", "Living room", "Bathroom"]},
    "SE":     {"element": "Fire",         "governs": "Wealth, energy",          "color": "Orange/Red",       "good_for": ["Kitchen", "Generator", "Electrical appliances"],          "avoid": ["Bedroom", "Pooja room"]},
    "South":  {"element": "Fire",         "governs": "Fame, stability",         "color": "Red/Pink",         "good_for": ["Master bedroom", "Guest room"],                           "avoid": ["Main entrance", "Water elements"]},
    "SW":     {"element": "Earth",        "governs": "Relationships, stability","color": "Brown/Yellow",     "good_for": ["Master bedroom (owner)", "Heavy storage", "Staircase"],   "avoid": ["Kitchen", "Pooja room", "Toilet"]},
    "West":   {"element": "Metal",        "governs": "Creativity, children",    "color": "White/Grey",       "good_for": ["Children's room", "Dining room", "Study"]},
    "NW":     {"element": "Air",          "governs": "Support, guests",         "color": "White/Light Blue", "good_for": ["Guest room", "Bathroom", "Garage"],                       "avoid": ["Main bedroom for owner"]}
}

# ─── SCORING MATRIX ────────────────────────────────────────────────────────────
# Each (room, direction) pair has a precise base score
# Designed to span full 0-100 range meaningfully
SCORING_MATRIX = {
    "Bedroom": {
        "SW":    92,   # Best — stability, relationships
        "South": 85,   # Good — fame, rest
        "West":  75,   # Acceptable
        "NW":    62,   # Below average
        "East":  55,   # Neutral
        "North": 40,   # Poor — magnetic interference
        "SE":    28,   # Bad — fire zone, restlessness
        "NE":    15,   # Worst — sacred zone, not for sleep
    },
    "Kitchen": {
        "SE":    95,   # Perfect — fire element zone
        "South": 72,   # Acceptable
        "East":  65,   # Okay
        "West":  50,   # Neutral
        "SW":    35,   # Poor
        "NW":    30,   # Bad
        "North": 22,   # Very bad — water vs fire
        "NE":    8,    # Worst — destroys prosperity
    },
    "Living Room": {
        "NE":    92,   # Best — knowledge, positivity
        "North": 88,   # Excellent — career, finances
        "East":  82,   # Very good — health, new beginnings
        "West":  65,   # Acceptable
        "NW":    58,   # Below average
        "SE":    48,   # Poor
        "SW":    42,   # Poor
        "South": 38,   # Bad
    },
    "Bathroom": {
        "NW":    85,   # Best for bathroom
        "West":  78,   # Good
        "SE":    60,   # Acceptable (fire+water conflict)
        "South": 50,   # Neutral
        "East":  42,   # Below average
        "North": 35,   # Poor
        "SW":    20,   # Very bad — weakens owner
        "NE":    5,    # Worst possible — extreme defect
    },
    "Pooja Room": {
        "NE":    98,   # Divine — only correct place
        "North": 80,   # Acceptable
        "East":  75,   # Good
        "West":  45,   # Poor
        "NW":    38,   # Bad
        "SW":    22,   # Very bad
        "SE":    18,   # Very bad — fire in sacred zone
        "South": 12,   # Worst — inauspicious
    },
    "Office": {
        "North": 92,   # Best — career zone
        "NE":    88,   # Excellent — knowledge
        "East":  82,   # Very good
        "West":  60,   # Neutral
        "NW":    55,   # Below average
        "SE":    45,   # Poor
        "South": 38,   # Bad
        "SW":    32,   # Bad
    },
}

SCORE_LABEL = {
    (85, 100): "Excellent",
    (70, 84):  "Good",
    (50, 69):  "Average",
    (30, 49):  "Poor",
    (0,  29):  "Critical Defect",
}

def get_label(score):
    for (low, high), label in SCORE_LABEL.items():
        if low <= score <= high:
            return label
    return "Poor"

# ─── ISSUES DATABASE ───────────────────────────────────────────────────────────
CRITICAL_ISSUES = {
    ("Bathroom", "NE"):    "Bathroom in North-East is the worst Vastu defect. NE is the divine zone — a toilet here creates severe negative energy affecting health, finances, and spirituality of all occupants.",
    ("Kitchen",  "NE"):    "Kitchen in North-East destroys household prosperity. Fire element (kitchen) in the sacred water+earth zone (NE) creates violent elemental conflict.",
    ("Bedroom",  "NE"):    "Bedroom in North-East zone disturbs mental peace and spiritual energy. This sacred zone should never be used for sleeping.",
    ("Bedroom",  "SE"):    "Bedroom in South-East (fire zone) causes arguments, restlessness, and anger among occupants. Sleep is heavily disturbed.",
    ("Pooja Room","South"):"Prayer room in South direction is considered very inauspicious. Prayers may not yield results and negative energy accumulates.",
    ("Pooja Room","SE"):   "Pooja room in South-East (fire zone) is inappropriate. Sacred rituals need calm water/earth energy, not fire.",
    ("Bathroom", "SW"):    "Bathroom in South-West weakens the owner of the house significantly, causing relationship and financial instability.",
    ("Kitchen",  "NW"):    "Kitchen in North-West leads to financial instability and the owner may face losses in business.",
    ("Kitchen",  "North"): "Kitchen in North creates water-fire elemental clash causing health issues and financial problems for the family.",
}

ROOM_RULES = {
    "Bedroom": {
        "best_directions": ["SW", "South", "West"],
        "avoid_directions": ["NE", "SE"],
        "rules": [
            "Master bedroom should always be in South-West for the house owner",
            "Bed head must point South or East — never North (magnetic interference)",
            "Mirror should never directly face the sleeping person",
            "Keep NE corner of bedroom completely light and clutter-free",
            "No water elements (aquarium/fountain) in bedroom",
            "Avoid placing bed under a beam — causes subconscious pressure"
        ],
        "placement": [
            {"item": "Bed head direction", "ideal": "South or East",             "avoid": "North"},
            {"item": "Wardrobe",           "ideal": "South or West wall",        "avoid": "NE corner"},
            {"item": "Study table",        "ideal": "East or North wall",        "avoid": "South wall"},
            {"item": "TV",                 "ideal": "South wall",                "avoid": "East wall"},
            {"item": "Mirror",             "ideal": "North or East wall",        "avoid": "Facing bed or South"},
        ]
    },
    "Kitchen": {
        "best_directions": ["SE"],
        "avoid_directions": ["NE", "SW", "North"],
        "rules": [
            "Kitchen is best in South-East — fire element zone",
            "Cook while facing East for health and prosperity",
            "Gas stove must be in SE corner of kitchen",
            "Sink (water) should be in NE or North of kitchen — never next to stove",
            "Refrigerator is best in SW corner of kitchen",
            "Never place kitchen directly below or above pooja room"
        ],
        "placement": [
            {"item": "Gas stove",      "ideal": "SE corner, cook facing East", "avoid": "NE corner"},
            {"item": "Refrigerator",   "ideal": "SW corner of kitchen",        "avoid": "NE corner"},
            {"item": "Sink",           "ideal": "North or NE of kitchen",      "avoid": "SE (opposite stove)"},
            {"item": "Storage/Pantry", "ideal": "South and West walls",        "avoid": "NE corner"},
        ]
    },
    "Living Room": {
        "best_directions": ["North", "NE", "East"],
        "avoid_directions": [],
        "rules": [
            "Living room is best in North, NE or East zone of the house",
            "Main sofa set should face East or North",
            "Keep center of room (Brahmasthan) completely open",
            "Heavy furniture like sofa against South or West wall",
            "TV can be placed on South or East wall",
            "Indoor plants are good in East or North corner"
        ],
        "placement": [
            {"item": "Main sofa",    "ideal": "South or West wall, face East/North", "avoid": "Center of room"},
            {"item": "TV unit",      "ideal": "South or East wall",                  "avoid": "North wall"},
            {"item": "Indoor plants","ideal": "East or North corner",                "avoid": "South corner"},
            {"item": "Center table", "ideal": "Light, easy to move",                 "avoid": "Heavy furniture at center"},
        ]
    },
    "Bathroom": {
        "best_directions": ["NW", "West"],
        "avoid_directions": ["NE", "SW"],
        "rules": [
            "Bathroom is best in North-West or West zone",
            "Toilet seat should face North or South — not East or West",
            "Never place bathroom in NE — most sacred and inauspicious",
            "SW bathroom weakens the master of the house",
            "Bathroom door should not directly face kitchen or pooja room",
            "Keep bathroom well ventilated and dry"
        ],
        "placement": [
            {"item": "Toilet seat",  "ideal": "Face North or South",        "avoid": "Face East or West"},
            {"item": "Shower/Tap",   "ideal": "North or East wall",         "avoid": "South wall"},
            {"item": "Mirror",       "ideal": "North or East wall",         "avoid": "South wall"},
            {"item": "Storage",      "ideal": "West or South wall",         "avoid": "NE corner"},
        ]
    },
    "Pooja Room": {
        "best_directions": ["NE"],
        "avoid_directions": ["South", "SW", "SE"],
        "rules": [
            "Pooja room must be in NE — the most divine direction",
            "Face East or North while praying",
            "Keep pooja room at ground floor if possible",
            "Never place pooja room in bedroom or adjacent to toilet",
            "Use white, yellow or light cream colors",
            "Keep area always clean, well-lit, and free of clutter"
        ],
        "placement": [
            {"item": "Idol/Image",   "ideal": "East or West wall, face West/East", "avoid": "South wall"},
            {"item": "Lamp/Diya",    "ideal": "SE corner of pooja room",           "avoid": "NE corner"},
            {"item": "Storage",      "ideal": "South or West of pooja room",       "avoid": "NE corner"},
        ]
    },
    "Office": {
        "best_directions": ["North", "East", "NE"],
        "avoid_directions": [],
        "rules": [
            "Home office is best in North zone — career and finances zone",
            "Always sit facing East or North while working",
            "Keep clutter away from workstation at all times",
            "Place computer on SE side of desk",
            "Keep a small plant on East or North side of desk",
            "Use bright lighting — avoid dim or yellowish lights"
        ],
        "placement": [
            {"item": "Work desk",    "ideal": "Face East or North",           "avoid": "Face South"},
            {"item": "Computer",     "ideal": "SE side of desk",              "avoid": "NW corner"},
            {"item": "Bookshelf",    "ideal": "West or South wall",           "avoid": "NE corner"},
            {"item": "Plant",        "ideal": "East or North side of desk",   "avoid": "South corner"},
        ]
    },
}


# ─── SCORING FUNCTION ──────────────────────────────────────────────────────────
def calculate_vastu_score(room_type, facing_direction, elements):
    room_data   = ROOM_RULES.get(room_type, ROOM_RULES["Living Room"])
    dir_info    = DIRECTION_ELEMENTS.get(facing_direction, {})

    # Get base score from matrix
    room_matrix = SCORING_MATRIX.get(room_type, SCORING_MATRIX["Living Room"])
    base_score  = room_matrix.get(facing_direction, 50)

    score  = base_score
    issues = []
    positives = []
    recommendations = list(room_data["rules"][:4])

    # ── Direction-specific feedback ────────────────────────────────────────────
    if facing_direction in room_data["best_directions"]:
        positives.append(f"✅ {room_type} in {facing_direction} is an ideal Vastu placement")
        positives.append(f"✅ {facing_direction} governs {dir_info.get('governs', '')} — perfectly aligned with room purpose")
        positives.append(f"✅ Elemental energy ({dir_info.get('element', '')}) supports this room type")
    elif facing_direction in room_data["avoid_directions"]:
        key = (room_type, facing_direction)
        desc = CRITICAL_ISSUES.get(key, f"{room_type} in {facing_direction} creates elemental conflict and negative energy flow")
        issues.append({"issue": f"Critical: {room_type} in {facing_direction} direction", "severity": "Critical", "reason": desc})
        recommendations.insert(0, f"⚠️ Priority fix: Shift {room_type} away from {facing_direction} to {', '.join(room_data['best_directions'])}")
        positives.append(f"✅ Analysis completed successfully for {room_type} in {facing_direction} direction")
        positives.append(f"✅ Specific remedies available to reduce negative impact")
    else:
        positives.append(f"✅ {room_type} in {facing_direction} direction is an acceptable Vastu placement")
        positives.append(f"✅ {facing_direction} governs {dir_info.get('governs', '')} — compatible with room function")
        positives.append(f"✅ Minor optimizations can improve energy flow in this space")

    # ── Element-specific scoring ───────────────────────────────────────────────
    if room_type == "Bedroom":
        if "Mirror" in elements:
            issues.append({"issue": "Mirror facing bed", "severity": "Moderate", "reason": "Disturbs sleep quality and health of occupants"})
            score = max(0, score - 8)
            recommendations.append("Move mirror so it does not face sleeping area")
        if "Water Element" in elements:
            issues.append({"issue": "Water element in bedroom", "severity": "Minor", "reason": "Aquarium or fountain in bedroom causes emotional restlessness"})
            score = max(0, score - 5)
            recommendations.append("Remove water feature from bedroom")
        if "TV in bedroom" in elements:
            issues.append({"issue": "TV in bedroom", "severity": "Minor", "reason": "Electronic devices disturb the restful energy of bedroom"})
            score = max(0, score - 4)

    if room_type == "Kitchen":
        if "Water Element" in elements and facing_direction in ["SE", "South"]:
            issues.append({"issue": "Water near stove", "severity": "Moderate", "reason": "Water and fire sources too close — elemental conflict"})
            score = max(0, score - 10)
            recommendations.append("Ensure sink and stove are on opposite sides of kitchen")

    if room_type == "Bathroom" and facing_direction == "NE":
        score = max(0, score - 10)  # extra penalty on top of matrix

    if room_type == "Pooja Room" and facing_direction in ["South", "SW", "SE"]:
        score = max(0, score - 5)

    # ── Clutter penalty ────────────────────────────────────────────────────────
    if "Clutter" in elements:
        score = max(0, score - 8)
        issues.append({"issue": "Clutter present", "severity": "Minor", "reason": "Clutter blocks positive energy flow in any room"})
        recommendations.append("Declutter immediately — especially NE corner")

    # ── Final clamp ───────────────────────────────────────────────────────────
    score = max(0, min(100, score))

    return {
        "score":          score,
        "label":          get_label(score),
        "positives":      positives,
        "issues":         issues,
        "recommendations": recommendations[:6],
        "placementGuide": room_data.get("placement", []),
        "directionInfo":  dir_info,
        "colorSuggestion": dir_info.get("color", "White/Beige"),
        "element":         dir_info.get("element", "Space"),
    }


# ─── GROQ ENHANCEMENT ─────────────────────────────────────────────────────────
def get_groq_recommendations(room_type, facing_direction, score, issues):
    if not groq_client:
        return []
    try:
        issue_text = '; '.join([i['issue'] for i in issues]) if issues else 'no major issues'
        prompt = f"""You are a certified Vastu Shastra expert. Give 3 specific practical recommendations for:
Room: {room_type}
Facing Direction: {facing_direction}
Vastu Score: {score}/100
Issues: {issue_text}

Rules:
- Be specific about directions (North, South-East etc.)
- Give actionable changes (move X to Y, place Z at W)
- Indian home context
- Each recommendation max 1 sentence

Return ONLY a JSON array of 3 strings. No explanation, no markdown.
Example: ["Move the bed head to South wall", "Place a water fountain in North corner", "Paint walls light yellow"]"""

        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.6
        )
        text = response.choices[0].message.content.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        print(f"Groq error: {e}")
        return []


def get_groq_analysis(room_type, direction, score):
    """Get a natural language summary from Groq"""
    if not groq_client:
        return _fallback_analysis(room_type, direction, score)
    try:
        label = get_label(score)
        prompt = f"""Vastu Shastra expert analysis in 2-3 sentences:
Room: {room_type}, Direction: {direction}, Score: {score}/100 ({label})
Write a natural, professional assessment. Mention the elemental energy and practical impact on occupants.
No bullet points. Direct paragraph only."""

        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq analysis error: {e}")
        return _fallback_analysis(room_type, direction, score)


def _fallback_analysis(room_type, direction, score):
    label = get_label(score)
    if score >= 85:
        return f"Your {room_type} facing {direction} scores {score}/100 — {label}. This is an auspicious placement that promotes positive energy flow, well-being, and prosperity for the occupants."
    elif score >= 70:
        return f"Your {room_type} facing {direction} scores {score}/100 — {label}. This is a reasonable placement with minor improvements possible to optimize energy flow."
    elif score >= 50:
        return f"Your {room_type} facing {direction} scores {score}/100 — {label}. Several Vastu corrections are recommended to improve the energy balance and well-being in this space."
    elif score >= 30:
        return f"Your {room_type} facing {direction} scores {score}/100 — {label}. This placement creates significant elemental conflicts. Immediate Vastu corrections are strongly advised."
    else:
        return f"Your {room_type} facing {direction} scores {score}/100 — Critical Defect. This is one of the most inauspicious Vastu placements. Urgent remedial measures or relocation of the room is highly recommended."


# ─── ROUTES ───────────────────────────────────────────────────────────────────
@vastu_bp.route('/analyze', methods=['POST'])
def analyze_vastu():
    try:
        data = request.get_json()
        if not data:
            data = request.form.to_dict()

        room_type        = data.get('roomType', 'Living Room')
        facing_direction = data.get('facingDirection', 'North')
        floor            = data.get('floor', 'Ground')
        elements         = data.get('elements', [])

        # Validate inputs
        if room_type not in ROOM_RULES:
            room_type = "Living Room"
        if facing_direction not in DIRECTION_ELEMENTS:
            facing_direction = "North"

        # Rule engine score
        result = calculate_vastu_score(room_type, facing_direction, elements)

        # Groq AI enhancements
        ai_recs  = get_groq_recommendations(room_type, facing_direction, result["score"], result["issues"])
        analysis = get_groq_analysis(room_type, facing_direction, result["score"])

        result["aiRecommendations"] = ai_recs if ai_recs else [
            "Place heavy furniture in South-West direction for stability",
            "Keep North-East area clean and clutter-free for positive energy",
            "Use appropriate colors for this direction to enhance energy flow"
        ]
        result["analysis"]   = analysis
        result["floor"]      = floor
        result["aiPowered"]  = bool(groq_client)

        return jsonify({"success": True, "result": result})

    except Exception as e:
        print(f"Vastu analyze error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@vastu_bp.route('/directions', methods=['GET'])
def get_directions():
    return jsonify({"success": True, "directions": DIRECTION_ELEMENTS})


@vastu_bp.route('/rules/<room_type>', methods=['GET'])
def get_room_rules(room_type):
    rules = ROOM_RULES.get(room_type)
    if not rules:
        return jsonify({"success": False, "message": "Room type not found"}), 404
    return jsonify({"success": True, "roomType": room_type, "rules": rules})


@vastu_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status":  "ok",
        "groq":    bool(groq_client),
        "model":   "llama3-8b-8192" if groq_client else "rule-engine-only",
        "rooms":   list(ROOM_RULES.keys()),
        "directions": list(DIRECTION_ELEMENTS.keys())
    })