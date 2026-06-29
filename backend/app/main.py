import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles

from .auth import router as auth_router
from .chat import router as chat_router
from .db import init_db
from .documents import router as documents_router

STATIC_DIR = Path(__file__).parent.parent / "static"
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"
CATALOG_PATH = Path(__file__).parent.parent.parent / "catalog.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(documents_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/catalog")
def catalog():
    if not CATALOG_PATH.exists():
        raise HTTPException(status_code=404, detail="Catalog not found")
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


@app.get("/api/templates/{filename}")
def template(filename: str):
    # Prevent directory traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = TEMPLATES_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail=f"Template not found: {filename}")
    return PlainTextResponse(path.read_text(encoding="utf-8"))


# Serve Next.js static export — must come after API routes
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")
