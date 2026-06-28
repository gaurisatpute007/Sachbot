from collections import Counter
from fastapi import APIRouter
from app.models.store import claims_db, review_queue

router = APIRouter()

@router.get("/stats")
def get_stats():
    return {
        "total_today":   len(claims_db),
        "high_risk":     sum(1 for c in claims_db if c.get("risk") == "high"),
        "pending_review": len(review_queue),
        "false_claims":  sum(1 for c in claims_db if c.get("verdict") == "FALSE"),
    }

@router.get("/alerts")
def get_alerts():
    alerts = []
    districts = Counter(c["district"] for c in claims_db if c.get("risk") == "high")
    for district, count in districts.most_common(3):
        if count >= 2:
            alerts.append({"type":"spike","severity":"high",
                "title": f"Spike: {count} high-risk claims — {district}",
                "body":  f"{count} claims flagged in {district} recently. Outreach recommended."})
    if any(c.get("category") == "Communal" for c in claims_db):
        communal = sum(1 for c in claims_db if c.get("category") == "Communal")
        alerts.append({"type":"category","severity":"high",
            "title": f"Communal narrative cluster — {communal} claims",
            "body": "Forwarded claims with communal angle detected. Monitor for escalation."})
    scheme = [c for c in claims_db if c.get("category") == "Government Scheme" and c.get("verdict") == "FALSE"]
    if scheme:
        alerts.append({"type":"repeated","severity":"medium",
            "title": f"Repeated fake scheme claim — {len(scheme)} instances",
            "body": "Phishing scheme being recirculated. Outreach template ready."})
    return {"alerts": alerts}

@router.get("/trends")
def get_trends():
    districts  = Counter(c["district"] for c in claims_db)
    categories = Counter(c["category"] for c in claims_db)
    verdicts   = Counter(c["verdict"]   for c in claims_db)
    return {
        "by_district": [{"name": k, "count": v} for k, v in districts.most_common(6)],
        "by_category": [{"name": k, "count": v} for k, v in categories.most_common(6)],
        "by_verdict":  [{"name": k, "count": v} for k, v in verdicts.items()],
        "recent_claims": claims_db[:8],
    }
