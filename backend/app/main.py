from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import Base, engine
from .models import HostedZone, Session
from .routers import auth, hosted_zones, records
from .seed import create_mock_user


app = FastAPI(
    title="Route53 Clone API",
    description="Mocked Route53 console backend with zone, record, and session management.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for err in exc.errors():
        details.append({
            "loc": list(err.get("loc", [])),
            "msg": err.get("msg", "Validation error"),
            "type": err.get("type", "value_error"),
        })
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "validation_error", "message": "Request validation failed", "details": details}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "An unexpected error occurred", "details": []}},
    )


Base.metadata.create_all(bind=engine)
if settings.seed_on_start:
    create_mock_user()

app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(records.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Route53 Clone API"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}
