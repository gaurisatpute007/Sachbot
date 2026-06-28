from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import verify, dashboard, queue, webhook

app = FastAPI(title="SachBot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify.router,    prefix="/api/verify",    tags=["verify"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(queue.router,     prefix="/api/queue",     tags=["queue"])
app.include_router(webhook.router,   prefix="/api/webhook",   tags=["webhook"])

@app.get("/")
def root():
    return {"status": "SachBot API running"}
