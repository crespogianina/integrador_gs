# 📝 Informe Técnico — RecetasIA

## Arsenal de herramientas IA

| Herramienta | Uso |
|---|---|
| Claude (claude.ai) | Desarrollo asistido, arquitectura, debugging, generación de código |
| Claude API — claude-sonnet-4-20250514 | Generación de recetas en runtime vía FastAPI |

## Arquitectura de la integración

El frontend React se comunica con un backend FastAPI que actúa como proxy seguro hacia la API de Anthropic. La API key nunca llega al browser.

```
React (Vercel) → POST /api/recetas → FastAPI (Render) → Claude API (Anthropic)
```

El backend construye un prompt estructurado con los ingredientes y filtros del usuario, llama a Claude, parsea el JSON de respuesta y lo reenvía al frontend.

## Prompt engineering

El prompt más efectivo incluyó tres elementos clave:

**1. Restricción de formato estricta**
```
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.
No uses bloques de código markdown (sin ```json).
```
Sin esta instrucción, Claude a veces envuelve la respuesta en backticks, rompiendo el `json.loads()`.

**2. Estructura de datos explícita**
Incluir el esquema JSON completo con tipos y ejemplos en el prompt redujo drásticamente los errores de formato y los campos faltantes.

**3. Reglas de negocio en lenguaje natural**
```
Genera recetas que maximicen el uso de los ingredientes disponibles.
"ingredientes_extra" son solo básicos de cocina que el usuario probablemente tenga.
```

## Desafíos encontrados

### CORS en desarrollo
El frontend en `localhost:5173` llamando al backend en `localhost:8000` requiere configurar `CORSMiddleware` en FastAPI. En producción, lo ideal es restringir `allow_origins` al dominio de Vercel.

### Respuestas inconsistentes del modelo
En algunas consultas con pocos ingredientes muy restrictivos (ej: solo "lechuga", dieta vegana, 10 minutos), Claude devolvía 1 o 2 recetas en vez de 3. Se agregó manejo graceful en el frontend para mostrar las que vengan.

### Variables de entorno en Vite
Vite expone al browser solo las variables que empiezan con `VITE_`. La URL del backend se pasa como `VITE_API_URL`, no como `API_URL`.

## Lecciones aprendidas

1. **Separar frontend y backend vale la pena**: la seguridad de la API key y la flexibilidad para cambiar el modelo sin tocar el frontend justifican los ~30 min extra de setup.
2. **El modelo maneja bien la cocina**: Claude tiene conocimiento culinario sólido y sus recetas son coherentes y realizables.
3. **Siempre tener fallback**: parsear la respuesta del LLM sin try/catch rompe la app en producción. Siempre validar el output.
4. **El prompt es iterativo**: el primer prompt generaba recetas que ignoraban los filtros. Agregar "Restricciones a respetar:" como sección separada mejoró notablemente el cumplimiento.
