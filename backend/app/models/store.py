from datetime import datetime, timedelta

claims_db: list[dict] = [
    {
        "id": "c001", "text": "Onion prices will rise 400% due to a new export ban. Share before midnight!",
        "language": "Hindi", "category": "Economic", "district": "Thane",
        "verdict": "FALSE", "confidence": 91,
        "explanation": "No government notification about an onion export ban exists. Price-panic forwards like this are common before elections and festivals.",
        "claim": "Onion prices to rise 400% due to export ban",
        "safe_to_share": False, "forwards": 34,
        "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
        "status": "verified", "risk": "high", "sources": [],
    },
    {
        "id": "c002", "text": "New government scheme gives ₹10,000 to every BPL family. Register on this WhatsApp link.",
        "language": "Hindi+Marathi", "category": "Government Scheme", "district": "Mumbai",
        "verdict": "FALSE", "confidence": 96,
        "explanation": "This is a phishing scam. No such scheme exists. The link collects Aadhaar and bank details fraudulently.",
        "claim": "Govt scheme gives ₹10,000 to BPL families via WhatsApp link",
        "safe_to_share": False, "forwards": 51,
        "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
        "status": "verified", "risk": "high", "sources": [],
    },
    {
        "id": "c003", "text": "Scientists confirmed turmeric water cures COVID-19 completely.",
        "language": "English", "category": "Health", "district": "Pune",
        "verdict": "MISLEADING", "confidence": 88,
        "explanation": "Turmeric has anti-inflammatory properties but no clinical trial has shown it cures COVID-19. This claim overstates limited lab research.",
        "claim": "Turmeric water cures COVID-19 completely",
        "safe_to_share": False, "forwards": 19,
        "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
        "status": "verified", "risk": "medium", "sources": [],
    },
    {
        "id": "c004", "text": "Old video of 2019 communal violence in Karnataka circulated as a recent incident.",
        "language": "Hindi", "category": "Communal", "district": "Nashik",
        "verdict": "FALSE", "confidence": 94,
        "explanation": "Reverse image search confirms this video is from a 2019 incident. Circulating it as recent can incite unnecessary panic.",
        "claim": "Video presented as recent communal violence is actually from 2019",
        "safe_to_share": False, "forwards": 29,
        "timestamp": (datetime.now() - timedelta(hours=8)).isoformat(),
        "status": "verified", "risk": "high", "sources": [],
    },
]

review_queue: list[dict] = [
    {
        "id": "q001", "text": "Local hospital in Thane running out of blood supply — urgent donors needed.",
        "language": "Hindi", "category": "Health", "district": "Thane",
        "forwards": 7, "received_mins_ago": 35, "ai_confidence": 52,
        "ai_note": "Could not find corroborating source. Local hospital contact recommended before flagging.",
        "risk": "high", "status": "pending",
    },
    {
        "id": "q002", "text": "Roads in Kurla blocked due to protest, avoid the route.",
        "language": "Marathi", "category": "Local", "district": "Mumbai",
        "forwards": 4, "received_mins_ago": 62, "ai_confidence": 45,
        "ai_note": "Could be a real-time local event. Cannot verify from known sources.",
        "risk": "medium", "status": "pending",
    },
    {
        "id": "q003", "text": "Election results in Nashik constituency being rigged — voter list manipulation reported.",
        "language": "Hindi", "category": "Election", "district": "Nashik",
        "forwards": 19, "received_mins_ago": 120, "ai_confidence": 38,
        "ai_note": "Election-sensitive claim. Escalated for senior reviewer. Potential panic risk.",
        "risk": "high", "status": "pending",
    },
]
