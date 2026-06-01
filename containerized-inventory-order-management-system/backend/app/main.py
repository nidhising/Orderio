import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.database import engine, Base
from app.routers import products, customers, orders, dashboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def wait_for_db(retries: int = 10, delay: int = 3):
    """Wait until the database is ready to accept connections."""
    for attempt in range(1, retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection established.")
            return
        except OperationalError as e:
            logger.warning(f"⏳ DB not ready (attempt {attempt}/{retries}): {e}")
            if attempt < retries:
                time.sleep(delay)
    raise RuntimeError("❌ Could not connect to the database after multiple retries.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup: wait for DB, then create tables."""
    logger.info("🚀 Starting up — waiting for database…")
    wait_for_db()
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created / verified.")
    yield
    logger.info("🛑 Shutting down.")


app = FastAPI(
    title="Inventory & Order Management API",
    description="A production-ready API for managing products, customers, and orders.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Inventory & Order Management API is running. Visit /docs for the API reference."}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
