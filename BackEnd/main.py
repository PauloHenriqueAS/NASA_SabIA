from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import (
    dataInfo_router,
    health_router,
)

app = FastAPI(
    title="SabIA - Api",
    description="SabIA Api - Trem de AI Project",
    version="1.0.0",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataInfo_router, prefix="/infos", tags=["Infos"])
app.include_router(health_router, tags=["HealthCheck"])