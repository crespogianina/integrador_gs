# FoodAlchemy

Generá recetas con IA a partir de los ingredientes que tenés en la heladera. La app combina **Gemini** para crear platos, **PostgreSQL** para usuarios y favoritos, **Unsplash** para fotos, y una interfaz React pensada para móvil y escritorio.

Desarrollada con asistencia de **Cursor**, **Claude** y **Google Gemini**.

---

## Tabla de contenidos

1. [Funcionalidades](#funcionalidades)
2. [Demo en vivo](#demo-en-vivo)
3. [Stack tecnológico](#stack-tecnológico)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Requisitos previos](#requisitos-previos)
6. [Instalación local (paso a paso)](#instalación-local-paso-a-paso)
7. [Uso de la aplicación (paso a paso)](#uso-de-la-aplicación-paso-a-paso)
8. [Variables de entorno](#variables-de-entorno)
9. [API](#api)
10. [Deploy en producción (paso a paso)](#deploy-en-producción-paso-a-paso)
11. [CI/CD y Agentes de IA](#cicd-y-agentes-de-ia)
12. [Informe técnico](#informe-técnico)

---

## Funcionalidades

### Generación de recetas

- Input de ingredientes con chips, sugerencias rápidas, pegado con comas y contador.
- Generación de **3 recetas** con Google Gemini, optimizadas según los ingredientes disponibles.
- Filtros: dieta (vegetariano, vegano, sin gluten, sin lactosa), porciones, complejidad, tiempo máximo, **momento del día** (desayuno / almuerzo / cena) y **tipo de plato** (dulce / salado).
- Modo **"Tengo hambre ya"**: recetas fáciles de hasta 15 minutos.
- Historial de búsquedas recientes.
- Dieta preferida del perfil se aplica automáticamente si no elegís otra en los filtros.

### Recetas y UI

- Cards con imagen (Unsplash), pasos expandibles, tip del chef, escala de porciones y lista de compras.
- Copiar receta completa al portapapeles.
- Imágenes más precisas gracias al campo `busqueda_imagen` generado por la IA.

### Cuenta y datos

- Registro, login y perfil con JWT.
- Favoritos guardados en PostgreSQL (no en localStorage).
- Comunidad: compartir recetas con nombre de autor, persistidas en base de datos.

### Experiencia

- Dark mode, toasts, navegación móvil inferior, PWA (`manifest.json`).
- Comunidad visible sin login; generar, favoritos y perfil requieren cuenta.

---

## Demo en vivo

| Recurso            | URL                                            |
| ------------------ | ---------------------------------------------- |
| **App (frontend)** | https://integradorgs-frontend.vercel.app       |
| **API (backend)**  | https://integrador-gs.onrender.com             |
| **Swagger**        | https://integrador-gs.onrender.com/docs        |
| **Repositorio**    | https://github.com/crespogianina/integrador_gs |

> El backend corre en el plan free de Render — la primera request puede tardar hasta 60 segundos si estuvo inactivo.

---

## Stack tecnológico

| Capa            | Tecnología                                             |
| --------------- | ------------------------------------------------------ |
| Frontend        | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend         | FastAPI, Python 3.11+, SQLAlchemy, Alembic             |
| Base de datos   | PostgreSQL 16                                          |
| Autenticación   | JWT (python-jose + passlib/bcrypt)                     |
| IA (runtime)    | Google Gemini (`gemini-2.5-flash-lite`)                |
| IA (desarrollo) | Cursor, Claude (Anthropic), Google Gemini              |
| Imágenes        | Unsplash API                                           |
| Deploy          | Vercel (frontend), Render (backend + DB)               |
| CI/CD           | GitHub Actions (build, deploy, agentes de IA)          |

---

## Estructura del proyecto

```
integrador_gs/
├── backend/
│   ├── api/v1/endpoints/   # auth, recipes, ai, comunidad
│   ├── core/               # config, database, security
│   ├── models/             # User, Recipe, CommunityRecipe
│   ├── schemas/            # Pydantic
│   ├── services/           # gemini_service.py
│   ├── alembic/            # migraciones
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/     # RecipeCard, FilterPanel, Navbar…
│   │   ├── context/        # Auth, Theme, Toast
│   │   ├── hooks/          # useRecipeGenerator, useRecipeImage…
│   │   ├── pages/          # Generar, Favoritos, Comunidad, Perfil
│   │   └── lib/api.ts
│   └── public/manifest.json
└── .github/workflows/
    ├── ci.yml                    # CI/CD principal
    ├── ai_generador_changelog.yml  # Agente: changelog automático
    ├── ai_pr_review.yml            # Agente: revisión de PRs
    └── ai_security_audit.yml       # Agente: auditoría de seguridad
```

---

## Requisitos previos

Antes de empezar, instalá:

1. **Git**
2. **Node.js 22+** y npm
3. **Python 3.11+**
4. **API key de Gemini** → [Google AI Studio](https://aistudio.google.com/apikey)
5. _(Opcional)_ **Access Key de Unsplash** → [Unsplash Developers](https://unsplash.com/developers)

> Para desarrollo local necesitás una base de datos PostgreSQL. Podés usar [Render](https://render.com) gratis o instalarlo localmente.

---

## Instalación local (paso a paso)

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/crespogianina/integrador_gs.git
cd integrador_gs
```

### Paso 2 — Configurar y arrancar el backend

```bash
cd backend
python -m venv venv
```

Activar el entorno virtual:

- **Windows (PowerShell):** `venv\Scripts\Activate.ps1`
- **Windows (CMD):** `venv\Scripts\activate.bat`
- **macOS / Linux:** `source venv/bin/activate`

Instalar dependencias y configurar entorno:

```bash
pip install -r requirements.txt
cp .env.example .env
```

Editá `backend/.env` con estos valores mínimos:

```env
GEMINI_API_KEY=tu-api-key-de-gemini
DATABASE_URL=postgresql+psycopg2://usuario:password@host:5432/foodalchemy
JWT_SECRET_KEY=un-secreto-largo-y-aleatorio
```

Arrancar la API:

```bash
uvicorn main:app --reload
```

Comprobaciones:

- API: [http://localhost:8000](http://localhost:8000)
- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

> Las tablas se crean automáticamente al iniciar la API (`create_all` en el lifespan).

### Paso 3 — Configurar y arrancar el frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Para desarrollo local, dejá **`VITE_API_URL` vacío** para usar el proxy de Vite hacia `localhost:8000`:

```env
VITE_API_URL=
VITE_UNSPLASH_ACCESS_KEY=tu-access-key-de-unsplash
```

Arrancar la app:

```bash
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173).

### Paso 4 — Verificar que todo funciona

1. Entrá a `/register` y creá una cuenta.
2. Iniciá sesión en `/login`.
3. Agregá ingredientes (ej. `tomate`, `huevo`, `queso`).
4. Tocá **Generar recetas** y esperá las 3 propuestas.
5. Guardá una en favoritos y visitá `/favoritos`.
6. Compartí una receta en `/comunidad`.

---

## Uso de la aplicación (paso a paso)

### Generar recetas

1. Iniciá sesión.
2. Escribí ingredientes y presioná Enter (o usá las sugerencias).
3. Abrí **Filtros** si querés restringir dieta, porciones, complejidad, tiempo, momento o sabor.
4. Tocá **Generar recetas** o **Tengo hambre ya** (rápido, ≤ 15 min).
5. Expandí **Ver preparación** en cualquier card para ver los pasos.
6. Usá los botones para copiar, guardar favorito, lista de compras o compartir en comunidad.

### Perfil

1. Andá a **Perfil**.
2. Editá tu nombre y dieta preferida.
3. Esa dieta se aplica sola al generar si no elegís otra en los filtros.

### Comunidad

1. Entrá a **Comunidad** (no requiere login para ver).
2. Para publicar, generá una receta estando logueado y usá el botón de compartir en la card.

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable                      | Descripción                    | Ejemplo                                   |
| ----------------------------- | ------------------------------ | ----------------------------------------- |
| `GEMINI_API_KEY`              | API key de Google Gemini       | `AIzaSy...`                               |
| `DATABASE_URL`                | Conexión PostgreSQL            | `postgresql+psycopg2://user:pass@host/db` |
| `JWT_SECRET_KEY`              | Secreto para firmar tokens JWT | string largo y aleatorio                  |
| `JWT_ALGORITHM`               | Algoritmo JWT                  | `HS256`                                   |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token             | `10080` (7 días)                          |
| `GEMINI_MODEL`                | Modelo de Gemini               | `gemini-2.5-flash-lite`                   |
| `CORS_ORIGINS`                | Orígenes permitidos            | `https://tu-app.vercel.app`               |

### Frontend (`frontend/.env`)

| Variable                   | Descripción                | Desarrollo             | Producción                           |
| -------------------------- | -------------------------- | ---------------------- | ------------------------------------ |
| `VITE_API_URL`             | URL del backend            | Vacío (usa proxy Vite) | `https://integrador-gs.onrender.com` |
| `VITE_UNSPLASH_ACCESS_KEY` | Key de Unsplash para fotos | Tu access key          | Tu access key                        |

---

## API

Documentación interactiva en `/docs` cuando el backend está corriendo.

| Método   | Ruta             | Auth | Descripción                |
| -------- | ---------------- | ---- | -------------------------- |
| `POST`   | `/auth/register` | No   | Registrar usuario          |
| `POST`   | `/auth/login`    | No   | Login (JSON)               |
| `POST`   | `/auth/token`    | No   | Login OAuth2 (Swagger)     |
| `GET`    | `/auth/me`       | Sí   | Perfil actual              |
| `PATCH`  | `/auth/me`       | Sí   | Actualizar perfil          |
| `POST`   | `/api/recetas`   | Sí   | Generar recetas con Gemini |
| `GET`    | `/recipes`       | Sí   | Listar favoritos           |
| `POST`   | `/recipes`       | Sí   | Guardar favorito           |
| `DELETE` | `/recipes/{id}`  | Sí   | Eliminar favorito          |
| `GET`    | `/api/comunidad` | No   | Listar recetas compartidas |
| `POST`   | `/api/comunidad` | Sí   | Compartir receta           |
| `GET`    | `/`              | No   | Health check               |

---

## Deploy en producción (paso a paso)

Guía completa: **[DEPLOY.md](./DEPLOY.md)**

Resumen rápido:

1. **PostgreSQL en Render** → copiar Internal Database URL
2. **Backend en Render** → Root Directory: `backend`, Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Frontend en Vercel** → Root Directory: `frontend`, agregar `VITE_API_URL`
4. **CORS** → actualizar `CORS_ORIGINS` en Render con la URL de Vercel

---

## CI/CD y Agentes de IA

El proyecto incluye 4 workflows en `.github/workflows/`:

### CI/CD principal (`ci.yml`)

Se ejecuta en cada push y PR a `main`:

- **Frontend:** type check TypeScript → build → deploy automático a Vercel
- **Backend:** verificación de sintaxis Python → Render hace autodeploy desde GitHub

### Agente: Generador de Changelog (`ai_generador_changelog.yml`)

Se activa en cada push a `main`. Toma los últimos commits, los procesa con Gemini y actualiza `CHANGELOG.md` automáticamente.

### Agente: Revisión de PRs (`ai_pr_review.yml`)

Se activa al abrir o actualizar un Pull Request. Analiza el diff del código con Gemini y comenta automáticamente en el PR con puntos positivos, sugerencias y revisión de seguridad.

### Agente: Auditoría de Seguridad (`ai_security_audit.yml`)

Corre en cada push a `main` y todos los lunes. Usa Bandit + Safety para analizar el código Python, manda los resultados a Gemini y crea un issue automático si detecta problemas.

### Secrets necesarios en GitHub

| Secret              | Descripción                     |
| ------------------- | ------------------------------- |
| `VERCEL_TOKEN`      | Token de Vercel para deploy     |
| `VERCEL_ORG_ID`     | ID de la organización en Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel       |
| `GEMINI_API_KEY`    | API key para los agentes de IA  |

---

## Informe técnico

Documentación ampliada del proyecto (arsenal de IA, prompt engineering, desafíos, lecciones aprendidas): **[INFORME.md](./INFORME.md)**

---

## IA utilizada

| Herramienta            | Rol                                                                |
| ---------------------- | ------------------------------------------------------------------ |
| **Cursor**             | Editor con IA integrada — implementación principal del proyecto    |
| **Claude (Anthropic)** | Corrección de código, análisis de bugs, debugging de CORS y deploy |
| **Google Gemini**      | Diseño de prompts + generación de recetas en runtime               |
| **Unsplash API**       | Imágenes ilustrativas en las cards                                 |
