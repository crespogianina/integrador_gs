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
13. [CI/CD y agentes de IA](#cicd-y-agentes-de-ia)

---

## Resumen del proyecto

**FoodAlchemy** es una aplicación full-stack que permite a los usuarios ingresar ingredientes disponibles y recibir recetas generadas por IA, con filtros dietéticos y de contexto (momento del día, dulce/salado), favoritos persistentes, comunidad y una interfaz responsive con dark mode.

Desarrollada íntegramente con asistencia de herramientas de IA: **Cursor** para la implementación, **Claude** para análisis y corrección, y **Google Gemini** tanto para el diseño de prompts como para la generación de recetas en runtime.

---

## Arsenal de herramientas IA

### Herramientas de desarrollo

| Herramienta            | Rol en el proyecto                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cursor**             | Editor con IA integrada. Herramienta principal de implementación: generación de código, completions en contexto del repo completo, refactor y estructura del proyecto. |
| **Claude (Anthropic)** | Corrección de código, análisis de bugs complejos, revisión de arquitectura y debugging de problemas de deploy (CORS, JWT, configuración de middlewares).               |
| **Google Gemini**      | Diseño y ajuste del prompt de generación de recetas. Consultas sobre buenas prácticas de API REST y estructura de schemas Pydantic.                                    |

### Herramientas de runtime

| Herramienta                                 | Uso                                                          |
| ------------------------------------------- | ------------------------------------------------------------ |
| **Google Gemini** (`gemini-2.5-flash-lite`) | Generación de recetas en tiempo real vía FastAPI             |
| **Unsplash API**                            | Fotos ilustrativas en las cards (query optimizada por la IA) |

---

## Sinergia con la IA

### Qué hizo cada herramienta

**Cursor** fue la herramienta del día a día. Se usó para:

- Generar la estructura inicial del proyecto (FastAPI + React + PostgreSQL)
- Escribir endpoints, modelos SQLAlchemy y schemas Pydantic a partir de descripciones en lenguaje natural
- Completar componentes React con contexto del resto del codebase
- Refactorizar código manteniendo consistencia de estilo

**Claude** se usó principalmente para:

- Diagnosticar errores que Cursor no resolvía (especialmente CORS, `strict_content_type` de FastAPI y problemas de deploy en Render/Vercel)
- Revisar código generado y detectar inconsistencias o bugs lógicos
- Entender el comportamiento de dependencias (FastAPI, SQLAlchemy, passlib)
- Generar documentación técnica (README, INFORME, DEPLOY)

**Gemini** se usó para:

- Diseñar la estructura del prompt de generación de recetas
- Iterar sobre las restricciones de dieta, momento del día y tipo de plato
- Brainstorming del campo `busqueda_imagen` para mejorar las fotos de Unsplash
- Consultas sobre diseño de APIs REST

### Prompts que funcionaron mejor

1. **Restricciones con `OBLIGATORIO`** — mejor cumplimiento de dieta, momento y sabor que instrucciones vagas en prosa.
2. **Esquema JSON completo en el prompt** — menos campos faltantes y menos errores de parseo.
3. **`busqueda_imagen` en inglés, 2-4 palabras** — fotos de Unsplash mucho más coherentes con el plato.
4. **`clean_json_response()` + regla "sin markdown"** — esencial para respuestas estables de Gemini.

### Dónde falló o hubo que corregir la IA

- **Código inconsistente con el estilo del repo**: Cursor a veces generaba convenciones distintas al resto del proyecto. Se revisó manualmente y se refactorizó.
- **Over-engineering**: sugerencias de abstracciones innecesarias. Se descartaron siguiendo el principio de diff mínimo.
- **Recetas incoherentes**: Gemini no es 100% determinista; aparecieron casos de recetas "vegetarianas" con carne. Se mitigó con etiquetas `OBLIGATORIO`.
- **Imágenes desalineadas**: el modelo generaba títulos creativos que confundían a Unsplash. Resuelto con el campo dedicado `busqueda_imagen`.
- **CORS en producción**: Claude ayudó a diagnosticar que FastAPI tiene `strict_content_type=True` por defecto, bloqueando los preflight OPTIONS.

### Programar y diseñar

| Tarea                   | Herramienta     | Resultado                                                                      |
| ----------------------- | --------------- | ------------------------------------------------------------------------------ |
| Arquitectura full-stack | Cursor          | Migración de prototipo frontend-only a monorepo con FastAPI, PostgreSQL y JWT  |
| Estructura de carpetas  | Cursor          | Convenciones `core/`, `models/`, `schemas/`, `services/` alineadas con FastAPI |
| Integración Gemini      | Cursor + Gemini | `gemini_service.py`, schema de filtros y endpoint `/api/recetas`               |
| UI/UX                   | Cursor          | FilterPanel, RecipeCard, dark mode y navegación móvil                          |
| Campo `busqueda_imagen` | Claude + Gemini | Diagnóstico del problema + diseño del campo en el prompt                       |

### Depurar

| Problema                  | Herramienta     | Solución                                                               |
| ------------------------- | --------------- | ---------------------------------------------------------------------- |
| CORS en producción        | Claude          | Diagnóstico de `strict_content_type=True`; fix con `False`             |
| Imágenes incorrectas      | Gemini + Claude | Campo `busqueda_imagen` en prompt + refactor de `useRecipeImage`       |
| Gemini 429 / limit: 0     | Cursor          | Reintentos con backoff exponencial en `gemini_service.py`              |
| `VITE_API_URL` en CI      | Claude          | Variable no cargada antes del build; redeploy con variable configurada |
| Vercel CLI desactualizada | Claude          | Reemplazo de `amondnet/vercel-action` por `vercel@latest` directo      |

### Documentar

| Actividad                       | Herramienta                                             |
| ------------------------------- | ------------------------------------------------------- |
| README, INFORME, DEPLOY         | Claude — redacción alineada a los requerimientos del TP |
| Agentes de IA en GitHub Actions | Claude — diseño y código de los 3 workflows             |

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
│  PostgreSQL (Render)      │      │  Google Gemini API          │
│  users · recipes          │      │  prompt + JSON de recetas   │
│  community_recipes        │      └─────────────────────────────┘
└───────────────────────────┘
```

Principios de seguridad:

- **`GEMINI_API_KEY` y `JWT_SECRET_KEY` solo en el backend** — nunca en el browser.
- **`VITE_UNSPLASH_ACCESS_KEY` en el frontend** — key pública de solo lectura.
- **Endpoints protegidos** con `Depends(get_current_user)` para generar, favoritos y compartir.

---

## Flujo de generación de recetas

1. El usuario autenticado envía `POST /api/recetas` con `{ ingredientes, filtros }`.
2. El backend aplica `apply_dieta_preferida()`: si el usuario tiene dieta en perfil y no eligió otra, la aplica automáticamente.
3. `GeminiService.build_prompt()` arma el prompt con todas las restricciones.
4. Gemini responde JSON; el backend limpia markdown (`clean_json_response`), parsea y ejecuta `ensure_image_query()` en cada receta.
5. El frontend recibe `{ recetas: [...] }` y renderiza `RecipeCard` por cada una.
6. `useRecipeImage` busca en Unsplash usando `busqueda_imagen`.

### Reintentos y errores

- Hasta **3 intentos** si Gemini devuelve 429, con backoff exponencial.
- Error explícito si la API key no tiene cuota disponible (`limit: 0`).
- `JSONDecodeError` → HTTP 500 con mensaje claro al usuario.

---

## Autenticación y persistencia

### JWT

| Paso | Acción                                                                          |
| ---- | ------------------------------------------------------------------------------- |
| 1    | `POST /auth/register` crea usuario con contraseña hasheada (bcrypt via passlib) |
| 2    | `POST /auth/login` devuelve `{ access_token }`                                  |
| 3    | Frontend guarda token en `localStorage` (`foodalchemy_token`)                   |
| 4    | `apiFetch()` adjunta `Authorization: Bearer <token>` en cada request            |
| 5    | `GET/PATCH /auth/me` para perfil y dieta preferida                              |

Token por defecto: **7 días**.

### Qué se guarda en PostgreSQL

| Entidad   | Tabla               | Contenido                                       |
| --------- | ------------------- | ----------------------------------------------- |
| Usuario   | `users`             | email, nombre, dieta_preferida                  |
| Favorito  | `recipes`           | `title` + `content` (JSONB con receta completa) |
| Comunidad | `community_recipes` | receta + autor + timestamp                      |

---

## Modelo de datos

```
User (1) ──< (N) Recipe
User (1) ──< (N) CommunityRecipe
```

**Recipe.content** almacena el objeto receta completo en JSONB — flexible para evolucionar el schema sin migraciones.

---

## Prompt engineering

### Estructura del prompt

```
Restricciones a respetar OBLIGATORIAMENTE:
- Dieta: vegetariano — OBLIGATORIO: sin carne, pescado ni mariscos
- Momento del día: desayuno — OBLIGATORIO: platos ligeros para la mañana
- Tipo de plato: dulce — OBLIGATORIO: no platos salados
```

Separar cada restricción en su propia línea con etiqueta explícita mejoró el cumplimiento respecto a instrucciones mezcladas en prosa.

### Formato JSON estricto

```
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.
No uses bloques de código markdown.
```

Se agregó `clean_json_response()` como red de seguridad adicional para limpiar backticks.

### Campo `busqueda_imagen`

Pedir 2-4 palabras en inglés orientadas al plato visible evita búsquedas confusas en Unsplash. Fallback server-side en `ensure_image_query()` si Gemini omite el campo.

---

## Imágenes con Unsplash

### Problema inicial

La búsqueda usaba el nombre completo de la receta. Títulos creativos de Gemini confundían a Unsplash.

### Solución implementada

| Capa     | Comportamiento                                                        |
| -------- | --------------------------------------------------------------------- |
| Gemini   | Genera `busqueda_imagen` corta en inglés                              |
| Backend  | `ensure_image_query()` completa si falta                              |
| Frontend | Prioridad: `busqueda_imagen` > 2 ingredientes > 3 palabras del nombre |
| Unsplash | Query `"${query} food"`, `per_page: 3`, orientación landscape         |
| Cache    | `Map` en memoria por query para no repetir requests                   |

---

## Frontend: decisiones clave

### Proxy de Vite en desarrollo

`vite.config.ts` proxea `/auth`, `/api` y `/recipes` a `127.0.0.1:8000`. Con `VITE_API_URL` vacío, las requests son same-origin — sin problemas de CORS en local.

### Contextos globales

- **AuthContext** — sesión, login/logout, carga de perfil.
- **ThemeContext** — dark mode persistente.
- **ToastContext** — feedback no intrusivo.

### Rutas y permisos

| Ruta                         | Auth                                        |
| ---------------------------- | ------------------------------------------- |
| `/`, `/favoritos`, `/perfil` | Requerida (`ProtectedRoute`)                |
| `/comunidad`                 | Pública (lectura); compartir requiere login |
| `/login`, `/register`        | Públicas                                    |

---

## Desafíos encontrados

### CORS en producción

El problema más complejo del deploy. FastAPI versiones recientes tienen `strict_content_type=True` por defecto, rechazando los preflight OPTIONS antes de que el middleware CORS los procese. Los logs de Render mostraban `400 Bad Request` en cada OPTIONS request. Diagnosticado con Claude. Solución: `strict_content_type=False` en la creación del app.

### Vercel CLI desactualizada en CI

El action `amondnet/vercel-action@v25` usa Vercel CLI 25, pero Vercel ahora requiere la versión 47+. Solucionado instalando `vercel@latest` directamente en el step del workflow.

### Imágenes desalineadas con el plato

Búsquedas con títulos creativos de Gemini devolvían fotos incorrectas. Resuelto con el campo `busqueda_imagen` en el prompt y lógica de fallback en tres niveles en `useRecipeImage`.

### Recetas inconsistentes del modelo

Con filtros muy restrictivos, Gemini a veces devuelve menos de 3 recetas o ignora restricciones. Mitigado con etiquetas `OBLIGATORIO`; el frontend muestra las recetas que lleguen sin romper la UI.

### Variable de entorno no disponible en build

`VITE_API_URL` fue agregada a Vercel después del primer deploy, compilándose vacía. El frontend apuntaba a `localhost` en producción. Solución: redeploy después de cargar la variable.

---

## Lecciones aprendidas

1. **Las herramientas de IA se complementan** — Cursor es ágil para escribir código nuevo; Claude es mejor para diagnosticar bugs complejos; Gemini ayuda en el diseño de prompts.

2. **El prompt es iterativo** — cada filtro nuevo requirió su propia etiqueta explícita, no solo un campo más en el request.

3. **Siempre validar output del LLM** — limpieza de markdown, fallback de `busqueda_imagen`, manejo de JSON inválido y rate limits son necesarios en producción.

4. **No confiar en títulos creativos para búsquedas externas** — un campo dedicado diseñado específicamente para Unsplash funciona mucho mejor.

5. **Proxy en dev simplifica la vida** — menos tiempo debuggeando CORS que configurando orígenes para cada entorno.

6. **Persistir recetas como JSONB** — flexible para evolucionar el schema sin migraciones.

7. **El deploy tiene sus propias trampas** — variables de entorno, versiones de CLI y configuraciones de CORS son detalles que rompen la app en producción aunque todo funcione en local.

---

## CI/CD y agentes de IA

### Workflow principal (`ci.yml`)

| Job          | Pasos                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| **Frontend** | `npm ci` → `tsc --noEmit` → `vite build` → deploy Vercel (solo en `main`) |
| **Backend**  | `pip install` → syntax check → Render autodeploy desde GitHub             |

### Agentes autónomos

| Workflow                     | Disparador                     | Qué hace                                                                                      |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `ai_generador_changelog.yml` | Push a `main`                  | Toma los últimos 5 commits, los procesa con Gemini y actualiza `CHANGELOG.md` automáticamente |
| `ai_pr_review.yml`           | PR abierto o actualizado       | Analiza el diff con Gemini y comenta en el PR con análisis de código                          |
| `ai_security_audit.yml`      | Push a `main` + cron lunes 9am | Corre Bandit + Safety, manda resultados a Gemini, crea issue si hay problemas                 |

### URLs de producción

| Servicio        | URL                                      |
| --------------- | ---------------------------------------- |
| **Frontend**    | https://integradorgs-frontend.vercel.app |
| **Backend API** | https://integrador-gs.onrender.com       |
| **Swagger**     | https://integrador-gs.onrender.com/docs  |

---

## Referencias

- [README.md](./README.md) — instalación, uso y deploy
- [DEPLOY.md](./DEPLOY.md) — guía de deploy paso a paso
- [Google AI Studio](https://aistudio.google.com/apikey) — API key Gemini
- [Unsplash Developers](https://unsplash.com/developers) — access key para imágenes
- Swagger local: `http://localhost:8000/docs`
