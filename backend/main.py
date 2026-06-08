from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime, timezone
import google.generativeai as genai
import os
import json
import re
import time

load_dotenv()

app = FastAPI(title="RecetasIA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción reemplazar con tu dominio de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    generation_config=genai.GenerationConfig(max_output_tokens=3000),
)

# In-memory community store — resets on server restart
_comunidad: list[dict] = []
MAX_COMUNIDAD = 100


# ── Modelos ───────────────────────────────────────────────────────────────────

class Filtros(BaseModel):
    dieta: str = "ninguna"
    porciones: int = 2
    complejidad: str = "cualquiera"
    tiempo_max: int = 60


class RecetaRequest(BaseModel):
    ingredientes: list[str]
    filtros: Filtros


class Receta(BaseModel):
    nombre: str
    emoji: str
    descripcion: str
    tiempo_minutos: int
    porciones: int
    dificultad: str
    calorias_aprox: int
    ingredientes_usados: list[str]
    ingredientes_extra: list[str]
    pasos: list[str]
    tip_chef: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def build_prompt(ingredientes: list[str], filtros: Filtros) -> str:
    dieta_str = filtros.dieta if filtros.dieta != "ninguna" else "sin restricciones dietarias"
    complejidad_str = filtros.complejidad if filtros.complejidad != "cualquiera" else "cualquier complejidad"

    return f"""Eres un chef profesional con conocimiento de cocina internacional y argentina.

El usuario tiene estos ingredientes disponibles: {", ".join(ingredientes)}.

Genera exactamente 3 recetas creativas que usen la mayor cantidad posible de esos ingredientes.

Restricciones a respetar:
- Dieta: {dieta_str}
- Porciones: {filtros.porciones} personas
- Complejidad: {complejidad_str}
- Tiempo máximo de preparación: {filtros.tiempo_max} minutos

Reglas:
1. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.
2. No uses bloques de código markdown (sin ```json).
3. Los pasos deben ser claros, concisos y en español.
4. "ingredientes_extra" son ingredientes básicos de cocina que el usuario probablemente tenga (sal, aceite, etc.) pero no listó.
5. Si no se pueden generar 3 recetas respetando las restricciones, genera las que puedas.

Formato de respuesta:
{{
  "recetas": [
    {{
      "nombre": "Nombre del plato",
      "emoji": "🍝",
      "descripcion": "Una frase tentadora que describa el plato",
      "tiempo_minutos": 25,
      "porciones": {filtros.porciones},
      "dificultad": "fácil",
      "calorias_aprox": 350,
      "ingredientes_usados": ["ingrediente1", "ingrediente2"],
      "ingredientes_extra": ["sal", "aceite de oliva"],
      "pasos": [
        "Paso 1: descripción detallada",
        "Paso 2: descripción detallada"
      ],
      "tip_chef": "Un consejo profesional para que quede perfecto"
    }}
  ]
}}"""


def clean_json_response(text: str) -> str:
    cleaned = re.sub(r"```json\s*|\s*```", "", text).strip()
    return cleaned


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "ok", "message": "RecetasIA API funcionando 🍳", "model": "gemini-2.0-flash"}


@app.post("/api/recetas")
def generar_recetas(req: RecetaRequest):
    if not req.ingredientes:
        raise HTTPException(status_code=400, detail="Ingresá al menos un ingrediente.")
    if len(req.ingredientes) > 20:
        raise HTTPException(status_code=400, detail="Máximo 20 ingredientes por consulta.")

    prompt = build_prompt(req.ingredientes, req.filtros)

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            raw_text = response.text
            clean_text = clean_json_response(raw_text)
            data = json.loads(clean_text)
            return data

        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Error al procesar la respuesta de la IA. Intentá de nuevo.")
        except Exception as e:
            err_str = str(e)
            # limit: 0 → free tier no disponible para esta key, no tiene sentido reintentar
            if "limit: 0" in err_str:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "La API key de Gemini no tiene acceso al free tier (limit: 0). "
                        "Creá una nueva key en https://aistudio.google.com/apikey "
                        "y actualizá GEMINI_API_KEY en el .env del backend."
                    ),
                )
            # 429 con cuota real → esperar y reintentar
            if "429" in err_str and attempt < 2:
                time.sleep(2 ** attempt * 5)  # 5s, 10s
                last_error = e
                continue
            raise HTTPException(status_code=502, detail=f"Error de la API de IA: {err_str}")

    raise HTTPException(status_code=429, detail=f"Límite de la API de Gemini alcanzado. Reintentá en unos segundos. ({last_error})")


@app.get("/api/comunidad")
def listar_comunidad():
    return {"recetas": _comunidad}


@app.post("/api/comunidad", status_code=201)
def compartir_receta(receta: Receta):
    entrada = {
        "receta": receta.model_dump(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _comunidad.insert(0, entrada)
    if len(_comunidad) > MAX_COMUNIDAD:
        _comunidad.pop()
    return {"ok": True}
