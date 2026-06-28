from fastapi import APIRouter, Request
router = APIRouter()

@router.get("/whatsapp")
async def whatsapp_verify(request: Request):
    params = dict(request.query_params)
    if params.get("hub.verify_token") == "sachbot_verify_token":
        return int(params.get("hub.challenge", 0))
    return {"status": "invalid token"}

@router.post("/whatsapp")
async def whatsapp_receive(request: Request):
    body = await request.json()
    return {"status": "received", "note": "Wire to /api/verify/check in production"}
