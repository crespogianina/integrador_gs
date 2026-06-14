# Informe Técnico — FoodAlchemy

Documentación técnica del proyecto: arquitectura, integraciones de IA, decisiones de diseño, desafíos y lecciones aprendidas.

---

## Tabla de contenidos

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Arsenal de herramientas IA](#arsenal-de-herramientas-ia)
3. [Sinergia con la IA](#sinergia-con-la-ia)
4. [Arquitectura general](#arquitectura-general)
5. [Flujo de generación de recetas](#flujo-de-generación-de-recetas)
6. [Autenticación y persistencia](#autenticación-y-persistencia)
7. [Modelo de datos](#modelo-de-datos)
8. [Prompt engineering](#prompt-engineering)
9. [Imágenes con Unsplash](#imágenes-con-unsplash)
10. [Frontend: decisiones clave](#frontend-decisiones-clave)
11. [Desafíos encontrados](#desafíos-encontrados)
12. [Lecciones aprendidas](#lecciones-aprendidas)
13. [CI/CD y deploy](#cicd-y-deploy)

---

## Resumen del proyecto

**FoodAlchemy** es una aplicación full-stack que permite a los usuarios ingresar ingredientes disponibles y recibir recetas generadas por IA, con filtros dietéticos y de contexto (momento del día, dulce/salado), favoritos persistentes, comunidad y una interfaz responsive con dark mode.

Evolucionó desde un prototipo frontend-only (favoritos en `localStorage`, Claude/Anthropic) hacia una arquitectura con **FastAPI + PostgreSQL + JWT + Google Gemini**.

---

## Arsenal de herramientas IA

| Herramienta | Uso |
|-------------|-----|
| **Google Gemini** (`gemini-2.5-flash-lite`) | Generación de recetas en runtime vía FastAPI |
| **Unsplash API** | Fotos ilustrativas en las cards (query optimizada por la IA) |
| **Cursor / asistentes IA** | Desarrollo asistido, arquitectura, debugging y refactor |

---

## Sinergia con la IA

Esta sección describe **cómo las herramientas de IA participaron en el ciclo de desarrollo**, no solo en runtime.

### Programar y diseñar

| Tarea | Cómo ayudó la IA |
|-------|------------------|
| **Arquitectura full-stack** | Con Cursor se definió la migración de un frontend aislado (localStorage) a monorepo con FastAPI, PostgreSQL y JWT, manteniendo el frontend en React. |
| **Estructura de carpetas** | Se generaron convenciones (`core/`, `models/`, `schemas/`, `services/`) alineadas con FastAPI y SQLAlchemy. |
| **Integración Gemini** | El servicio `gemini_service.py`, el schema de filtros y el endpoint `/api/recetas` se armaron iterando prompts y respuestas esperadas con asistencia IA. |
| **UI/UX** | Componentes como `FilterPanel`, `RecipeCard`, dark mode y navegación móvil se desarrollaron con sugerencias de layout, iconos (lucide-react) y estados vacíos. |
| **Campo `busqueda_imagen`** | La IA identificó que Unsplash fallaba con títulos largos de Gemini; se diseñó el campo en el prompt y el fallback en backend/frontend. |

### Depurar

| Problema | Rol de la IA |
|----------|--------------|
| **`Failed to fetch` en local** | Se diagnosticó que `VITE_API_URL` apuntaba a Render en vez de usar el proxy de Vite; solución documentada en README e `api.ts`. |
| **CORS** | Se configuró proxy en `vite.config.ts` para dev y `CORSMiddleware` con orígenes explícitos en prod. |
| **Imágenes incorrectas** | Análisis de que la query usaba el título completo; refactor de `useRecipeImage` + prompt de Gemini. |
| **Gemini `limit: 0` / 429** | Mensajes de error orientados al usuario y reintentos con backoff en `gemini_service.py`. |
| **Botones negros en filtros** | Corrección de clases Tailwind para alinear colores con el resto del panel. |

### Documentar y testear

| Actividad | Contribución IA |
|-----------|-----------------|
| **README e INFORME** | Redacción estructurada paso a paso, alineada al TP integrador (deploy, checklist, arsenal). |
| **DEPLOY.md** | Guía de Render + Vercel + secrets de GitHub generada a partir del estado real del repo. |
| **Validación manual** | Checklists de flujos (registro → generar → favoritos → comunidad) para verificar antes de entregar. |

### Prompts que funcionaron mejor

1. **Restricciones en lista con `OBLIGATORIO`** — mejor cumplimiento de dieta, momento y sabor que instrucciones vagas.
2. **Esquema JSON completo en el prompt** — menos campos faltantes y menos errores de parseo.
3. **`busqueda_imagen` en inglés, 2–4 palabras** — fotos de Unsplash mucho más coherentes.
4. **`clean_json_response()` + regla “sin markdown”** — essential para respuestas estables de Gemini.

### Dónde falló o hubo que corregir la IA

- **Recetas incoherentes** (ej. vegetariano con salchichas): el modelo no es 100% determinista; se mitigó con etiquetas estrictas pero no desaparece del todo.
- **Títulos demasiado creativos** para búsqueda de imágenes: resuelto con campo dedicado, no reutilizando el copy del plato.
- **Código generado a veces inconsistente** con el estilo del repo: revisión manual y refactors focalizados.
- **Sugerencias de over-engineering** (helpers innecesarios, abstracciones prematuras): se descartaron siguiendo el principio de diff mínimo.

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────────┐
│  React + Vite (Vercel)                                          │
│  AuthContext · ThemeContext · ToastContext                      │
│  Proxy dev: /auth, /api, /recipes → localhost:8000             │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ JWT Bearer                   │ Client-ID (browser)
                ▼                              ▼
┌───────────────────────────┐      ┌─────────────────────────────┐
│  FastAPI (Render)         │      │  Unsplash Search API        │
│  · /auth/*                │      │  query = busqueda_imagen    │
│  · /api/recetas → Gemini  │      └─────────────────────────────┘
│  · /recipes (favoritos)   │
│  · /api/comunidad         │
└───────────────┬───────────┘
                │
                ▼
┌───────────────────────────┐      ┌─────────────────────────────┐
│  PostgreSQL               │      │  Google Gemini API          │
│  users · recipes          │      │  prompt + JSON de recetas   │
│  community_recipes        │      └─────────────────────────────┘
└───────────────────────────┘
```

Principios de seguridad:

- **`GEMINI_API_KEY` y `JWT_SECRET_KEY` solo en el backend** — nunca en el browser.
- **`VITE_UNSPLASH_ACCESS_KEY` en el frontend** — key pública de solo lectura; aceptable para búsqueda de fotos.
- **Endpoints protegidos** con `Depends(get_current_user)` para generar, favoritos y compartir.

---

## Flujo de generación de recetas

### Paso a paso (runtime)

1. El usuario autenticado envía `POST /api/recetas` con `{ ingredientes, filtros }`.
2. El backend aplica `apply_dieta_preferida()`: si `filtros.dieta === "ninguna"` y el usuario tiene dieta en perfil, la usa automáticamente.
3. `GeminiService.build_prompt()` arma el prompt con todas las restricciones.
4. Gemini responde JSON; el backend limpia markdown (`clean_json_response`), parsea y ejecuta `ensure_image_query()` en cada receta.
5. El frontend recibe `{ recetas: [...] }` y renderiza `RecipeCard` por cada una.
6. `useRecipeImage` busca en Unsplash usando `busqueda_imagen` (fallback: ingredientes principales o primeras palabras del nombre).

### Reintentos y errores

- Hasta **3 intentos** si Gemini devuelve 429 (rate limit), con backoff exponencial.
- Error explícito si la API key no tiene free tier (`limit: 0`).
- `JSONDecodeError` → HTTP 500 con mensaje claro al usuario.

---

## Autenticación y persistencia

### JWT

| Paso | Acción |
|------|--------|
| 1 | `POST /auth/register` crea usuario con contraseña hasheada (bcrypt via passlib) |
| 2 | `POST /auth/login` devuelve `{ access_token }` |
| 3 | Frontend guarda token en `localStorage` (`foodalchemy_token`) |
| 4 | `apiFetch()` adjunta `Authorization: Bearer <token>` en cada request |
| 5 | `GET/PATCH /auth/me` para perfil y dieta preferida |

Token por defecto: **7 días** (`ACCESS_TOKEN_EXPIRE_MINUTES=10080`).

### Qué se guarda en PostgreSQL

| Entidad | Tabla | Contenido |
|---------|-------|-----------|
| Usuario | `users` | email, nombre, dieta_preferida |
| Favorito | `recipes` | `title` + `content` (JSONB con receta completa) |
| Comunidad | `community_recipes` | receta + autor + timestamp; máx. 100 entradas (FIFO) |

Las tablas se crean con `Base.metadata.create_all()` al arrancar la API. Alembic está configurado para migraciones futuras.

---

## Modelo de datos

```
User (1) ──< (N) Recipe
User (1) ──< (N) CommunityRecipe
```

**Recipe.content** y **CommunityRecipe.content** almacenan el objeto receta completo:

```json
{
  "nombre": "...",
  "busqueda_imagen": "stuffed tomatoes",
  "emoji": "🍝",
  "descripcion": "...",
  "tiempo_minutos": 25,
  "porciones": 2,
  "dificultad": "fácil",
  "calorias_aprox": 350,
  "ingredientes_usados": ["..."],
  "ingredientes_extra": ["..."],
  "pasos": ["..."],
  "tip_chef": "..."
}
```

---

## Prompt engineering

El prompt en `gemini_service.py` se iteró varias veces. Los elementos más efectivos:

### 1. Restricción de formato estricta

```
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.
No uses bloques de código markdown (sin ```json).
```

Sin esto, el modelo a veces envuelve la respuesta en backticks y rompe `json.loads()`. Se añadió además `clean_json_response()` como red de seguridad.

### 2. Sección "Restricciones a respetar OBLIGATORIAMENTE"

Separar dieta, momento, sabor, porciones, complejidad y tiempo en una lista explícita mejoró el cumplimiento de filtros respecto a mezclarlos en prosa.

Etiquetas con refuerzo negativo ayudan a Gemini:

```
vegetariano — OBLIGATORIO: sin carne, pescado ni mariscos
dulce — OBLIGATORIO: postres, dulces... no platos salados
```

### 3. Esquema JSON completo en el prompt

Incluir el formato esperado con tipos y un ejemplo reduce campos faltantes y errores de estructura.

### 4. Campo `busqueda_imagen`

Pedir 2–4 palabras en **inglés** orientadas al plato visible evita que el frontend busque en Unsplash con títulos largos y creativos (ej. "emulsión de chocolate" dominando la búsqueda).

Fallback server-side en `ensure_image_query()` si Gemini omite el campo.

### 5. Reglas de negocio en lenguaje natural

- Maximizar uso de ingredientes listados.
- `ingredientes_extra` solo para básicos de cocina no listados.
- Generar las recetas que se puedan si no alcanzan 3 con todas las restricciones.

---

## Imágenes con Unsplash

### Problema inicial

La búsqueda usaba el **nombre completo** de la receta + `" food dish"`, con `per_page: 1`. Títulos creativos de Gemini confundían a Unsplash (ej. foto de brownie para tomates rellenos porque aparecía "chocolate").

### Solución implementada

| Capa | Comportamiento |
|------|----------------|
| Gemini | Genera `busqueda_imagen` corta en inglés |
| Backend | `ensure_image_query()` completa si falta |
| Frontend | `resolveImageQuery()` → prioridad: `busqueda_imagen` > 2 ingredientes > 3 palabras del nombre |
| Unsplash | Query `"${query} food"`, `per_page: 3`, orientación landscape |
| Cache | `Map` en memoria por query para no repetir requests |

Recetas guardadas antes de este cambio usan el fallback automáticamente.

---

## Frontend: decisiones clave

### Proxy de Vite en desarrollo

`vite.config.ts` proxea `/auth`, `/api` y `/recipes` a `127.0.0.1:8000`. Con `VITE_API_URL` vacío, las requests son same-origin → **sin problemas de CORS en local**.

### Contextos globales

- **AuthContext** — sesión, login/logout, carga de perfil.
- **ThemeContext** — dark mode persistente.
- **ToastContext** — feedback no intrusivo (guardar, copiar, errores).

### Rutas y permisos

| Ruta | Auth |
|------|------|
| `/`, `/favoritos`, `/perfil` | Requerida (`ProtectedRoute`) |
| `/comunidad` | Pública (lectura); compartir requiere login |
| `/login`, `/register` | Públicas |

### Filtros actuales

```typescript
interface Filtros {
  dieta: 'ninguna' | 'vegetariano' | 'vegano' | 'sin_gluten' | 'sin_lactosa'
  porciones: number
  complejidad: 'cualquiera' | 'fácil' | 'intermedio' | 'difícil'
  tiempo_max: number
  momento: 'cualquiera' | 'desayuno' | 'almuerzo' | 'cena'
  sabor: 'cualquiera' | 'dulce' | 'salado'
}
```

---

## Desafíos encontrados

### CORS y `VITE_API_URL`

- En dev: proxy de Vite + `VITE_API_URL=` vacío.
- En prod: `CORS_ORIGINS` en backend debe incluir el dominio de Vercel.
- Error común: `VITE_API_URL=https://tu-backend.onrender.com` en local → **Failed to fetch** (CORS o backend inexistente). Solución: dejar vacío en desarrollo.

### Migración Claude → Gemini

- Cambio de SDK y formato de respuesta.
- Gemini free tier puede devolver `limit: 0` con keys sin cuota; mensaje de error orienta a crear key nueva en AI Studio.
- Rate limits 429: reintentos con backoff.

### Respuestas inconsistentes del modelo

Con pocos ingredientes y filtros muy restrictivos, a veces llegan 1–2 recetas en lugar de 3. El frontend muestra las que vengan sin romper la UI.

### Inconsistencias ocasionales de Gemini

Ejemplos observados: badge vegetariano con salchichas en ingredientes. Mitigación parcial con etiquetas `OBLIGATORIO` en el prompt; no es 100% determinista.

### Imágenes desalineadas con el plato

Resuelto con `busqueda_imagen`. Persiste variabilidad de Unsplash según stock fotográfico.

### PostgreSQL en Docker (Windows)

Puerto host **5444** (no 5432) para evitar conflictos con instalaciones locales de Postgres. Documentado en README y `.env.example`.

---

## Lecciones aprendidas

1. **Separar frontend y backend vale la pena** — protege API keys, permite cambiar modelo de IA sin tocar el cliente y habilita auth + persistencia real.

2. **El prompt es iterativo** — cada filtro nuevo (momento, sabor) requirió su propia etiqueta en el prompt, no solo un campo más en el JSON del request.

3. **Siempre validar output del LLM** — limpieza de markdown, fallback de `busqueda_imagen`, manejo de JSON inválido y rate limits.

4. **No confiar en títulos creativos para búsquedas externas** — un campo dedicado (`busqueda_imagen`) diseñado para otro sistema (Unsplash) funciona mejor que reutilizar copy de marketing.

5. **Proxy en dev simplifica la vida** — menos horas debuggeando CORS que configurando orígenes para cada puerto.

6. **Persistir recetas como JSONB** — flexible para evolucionar el schema de receta sin migraciones por cada campo nuevo; el frontend tipa con TypeScript.

7. **Dieta preferida en perfil** — mejora UX sin forzar al usuario a reconfigurar filtros en cada búsqueda.

---

## CI/CD y deploy

Workflow: `.github/workflows/ci.yml` (nombre: **CI/CD — FoodAlchemy**).

### En cada push / PR a `main`

| Job | Pasos |
|-----|-------|
| **Frontend** | `npm ci` → `tsc --noEmit` → `vite build` → deploy Vercel (solo en `main`) |
| **Backend** | `pip install` → syntax check de módulos clave → Render autodeploy desde GitHub |

### Secrets de GitHub

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Deploy manual (resumen)

1. PostgreSQL en Render → `DATABASE_URL` con `postgresql+psycopg2://`
2. Web Service backend en Render (`backend/`, uvicorn)
3. Frontend en Vercel (`frontend/`, `VITE_API_URL` apuntando al backend)
4. `CORS_ORIGINS` = URL de producción del frontend

Guía detallada paso a paso: [DEPLOY.md](./DEPLOY.md) · Resumen en [README.md](./README.md#deploy-en-producción-paso-a-paso)

---

## Referencias

- [README.md](./README.md) — instalación, uso y deploy
- [Google AI Studio](https://aistudio.google.com/apikey) — API key Gemini
- [Unsplash Developers](https://unsplash.com/developers) — access key para imágenes
- Swagger local: `http://localhost:8000/docs`
