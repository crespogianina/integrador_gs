import json
import re
import time

import google.generativeai as genai
from fastapi import HTTPException

from core.config import settings
from schemas.recipe import Filtros

DIETAS_VALIDAS = frozenset({"vegetariano", "vegano", "sin_gluten", "sin_lactosa"})

DIETA_LABELS = {
    "ninguna": "sin restricciones dietarias",
    "vegetariano": "vegetariano — OBLIGATORIO: sin carne, pescado ni mariscos",
    "vegano": "vegano — OBLIGATORIO: sin ningún producto de origen animal",
    "sin_gluten": "sin gluten — OBLIGATORIO",
    "sin_lactosa": "sin lactosa — OBLIGATORIO",
}

MOMENTO_LABELS = {
    "cualquiera": "cualquier momento del día",
    "desayuno": "desayuno — OBLIGATORIO: platos ligeros o sustanciosos para la mañana",
    "almuerzo": "almuerzo — OBLIGATORIO: platos principales para el mediodía",
    "cena": "cena — OBLIGATORIO: platos apropiados para la noche",
}

SABOR_LABELS = {
    "cualquiera": "dulce o salado indistinto",
    "salado": "salado — OBLIGATORIO: platos salados, no postres ni preparaciones dulces",
    "dulce": "dulce — OBLIGATORIO: postres, dulces o preparaciones dulces, no platos salados",
}


def apply_dieta_preferida(filtros: Filtros, dieta_preferida: str | None) -> Filtros:
    """Si el usuario no eligió dieta en el request, aplica la de su perfil."""
    if filtros.dieta != "ninguna" or not dieta_preferida or dieta_preferida not in DIETAS_VALIDAS:
        return filtros
    return filtros.model_copy(update={"dieta": dieta_preferida})


def clean_json_response(text: str) -> str:
    return re.sub(r"```json\s*|\s*```", "", text).strip()


def ensure_image_query(receta: dict) -> None:
    query = str(receta.get("busqueda_imagen") or "").strip()
    if not query:
        ingredientes = receta.get("ingredientes_usados") or []
        if ingredientes:
            query = " ".join(str(i) for i in ingredientes[:2])
        else:
            query = " ".join(str(receta.get("nombre", "")).split()[:3])
    receta["busqueda_imagen"] = query


def build_prompt(ingredientes: list[str], filtros: Filtros) -> str:
    dieta = DIETA_LABELS.get(filtros.dieta, filtros.dieta)
    momento = MOMENTO_LABELS.get(filtros.momento, filtros.momento)
    sabor = SABOR_LABELS.get(filtros.sabor, filtros.sabor)
    complejidad = filtros.complejidad if filtros.complejidad != "cualquiera" else "cualquier complejidad"

    return f"""Eres un chef profesional con conocimiento de cocina internacional y argentina.

El usuario tiene estos ingredientes disponibles: {", ".join(ingredientes)}.

Genera exactamente 3 recetas creativas que usen la mayor cantidad posible de esos ingredientes.

Restricciones a respetar OBLIGATORIAMENTE:
- Dieta: {dieta}
- Momento del día: {momento}
- Tipo de plato: {sabor}
- Porciones: {filtros.porciones} personas
- Complejidad: {complejidad}
- Tiempo máximo de preparación: {filtros.tiempo_max} minutos

Reglas:
1. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.
2. No uses bloques de código markdown (sin ```json).
3. Los pasos deben ser claros, concisos y en español.
4. "ingredientes_extra" son ingredientes básicos de cocina que el usuario probablemente tenga (sal, aceite, etc.) pero no listó.
5. Si no se pueden generar 3 recetas respetando las restricciones, genera las que puedas.
6. Ninguna receta puede violar la restricción de dieta, momento del día ni tipo de plato indicados arriba.
7. "busqueda_imagen" debe ser una query corta (2-4 palabras) EN INGLÉS para buscar una foto del plato terminado en Unsplash.
   - Describí el plato principal visible, no salsas, guarniciones ni ingredientes secundarios.
   - Evitá adjetivos y palabras genéricas (delicious, food, recipe).
   - Ejemplos: "stuffed tomatoes", "chicken stir fry", "vegetable lasagna".

Formato de respuesta:
{{
  "recetas": [
    {{
      "nombre": "Nombre del plato",
      "busqueda_imagen": "stuffed tomatoes",
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


class GeminiService:
    def __init__(self) -> None:
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                generation_config=genai.GenerationConfig(max_output_tokens=3000),
            )
        else:
            self._model = None

    def generate(self, ingredientes: list[str], filtros: Filtros) -> dict:
        if not self._model:
            raise HTTPException(status_code=503, detail="GEMINI_API_KEY no configurada.")

        prompt = build_prompt(ingredientes, filtros)
        last_error: Exception | None = None

        for attempt in range(3):
            try:
                response = self._model.generate_content(prompt)
                clean_text = clean_json_response(response.text)
                data = json.loads(clean_text)
                for receta in data.get("recetas", []):
                    ensure_image_query(receta)
                return data
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=500,
                    detail="Error al procesar la respuesta de la IA. Intentá de nuevo.",
                )
            except Exception as e:
                err_str = str(e)
                if "limit: 0" in err_str:
                    raise HTTPException(
                        status_code=502,
                        detail=(
                            "La API key de Gemini no tiene acceso al free tier (limit: 0). "
                            "Creá una nueva key en https://aistudio.google.com/apikey "
                            "y actualizá GEMINI_API_KEY en el .env del backend."
                        ),
                    )
                if "429" in err_str and attempt < 2:
                    time.sleep(2**attempt * 5)
                    last_error = e
                    continue
                raise HTTPException(status_code=502, detail=f"Error de la API de IA: {err_str}")

        raise HTTPException(
            status_code=429,
            detail=f"Límite de la API de Gemini alcanzado. Reintentá en unos segundos. ({last_error})",
        )


_gemini_service = GeminiService()


def generate_recipes(ingredientes: list[str], filtros: Filtros, dieta_preferida: str | None = None) -> dict:
    filtros_efectivos = apply_dieta_preferida(filtros, dieta_preferida)
    return _gemini_service.generate(ingredientes, filtros_efectivos)
