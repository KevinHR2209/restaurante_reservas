from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.routers import mesas, mozos, platos, clientes, horarios, reservas
from app.seed import run_seed

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# Cargar datos semilla
db = SessionLocal()
try:
    run_seed(db)
finally:
    db.close()

app = FastAPI(
    title="Restaurante Reservas API",
    description="API REST para gestión de reservas, mozos, mesas y platos de restaurante",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(mesas.router,    prefix="/api/mesas",    tags=["Mesas"])
app.include_router(mozos.router,    prefix="/api/mozos",    tags=["Mozos"])
app.include_router(horarios.router, prefix="/api/horarios", tags=["Horarios"])
app.include_router(platos.router,   prefix="/api/platos",   tags=["Platos"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(reservas.router, prefix="/api/reservas", tags=["Reservas"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Restaurante Reservas API"}
