from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router
from app.api.health import router as health_router
from app.api.products import router as products_router
from app.config import settings

app = FastAPI(
    title="Profit Action API",
    description="Conversational product analytics · synthetic catalog · read-only",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(products_router)
app.include_router(conversations_router)
app.include_router(chat_router)
