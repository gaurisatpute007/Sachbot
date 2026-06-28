from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.store import review_queue, claims_db

router = APIRouter()

class ReviewAction(BaseModel):
    verdict: str
    reviewer_note: str = ""

@router.get("/")
def get_queue():
    return {"queue": review_queue, "count": len(review_queue)}

@router.post("/{item_id}/resolve")
def resolve_item(item_id: str, action: ReviewAction):
    item = next((q for q in review_queue if q["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    review_queue.remove(item)
    resolved = {**item, "verdict": action.verdict, "status": "verified",
                "reviewer_note": action.reviewer_note,
                "resolved_at": datetime.now().isoformat()}
    claims_db.insert(0, resolved)
    return {"success": True, "resolved": resolved}
