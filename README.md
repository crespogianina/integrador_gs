# FoodAlchemy

Generá recetas con IA a partir de los ingredientes que tenés en la heladera. La app combina **Gemini** para crear platos, **PostgreSQL** para usuarios y favoritos, **Unsplash** para fotos, y una interfaz React pensada para móvil y escritorio.

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
11. [CI/CD](#cicd)
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

> Completá estas URLs después del deploy. Guía detallada: **[DEPLOY.md](./DEPLOY.md)**

| Recurso | URL |
|---------|-----|
| **App (frontend)** | _pendiente — ej. `https://foodalchemy.vercel.app`_ |
| **API (backend)** | _pendiente — ej. `https://foodalchemy-api.onrender.com`_ |
| **Swagger** | _pendiente — ej. `https://foodalchemy-api.onrender.com/docs`_ |
| **Repositorio** | [github.com/crespogianina/integrador_gs](https://github.com/crespogianina/integrador_gs) |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | FastAPI, Python 3.11+, SQLAlchemy, Alembic |
| Base de datos | PostgreSQL 16 (Docker local) |
| Autenticación | JWT (python-jose + passlib/bcrypt) |
| IA | Google Gemini (`gemini-2.5-flash-lite` por defecto) |
| Imágenes | Unsplash API |
| Deploy | Vercel (frontend), Render (backend) |
| CI/CD | GitHub Actions |

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
│   │   ├── hooks/            # useRecipeGenerator, useRecipeImage…
│   │   ├── pages/            # Generar, Favoritos, Comunidad, Perfil
│   │   └── lib/api.ts
│   └── public/manifest.json
├── docker-compose.yml      # PostgreSQL en puerto 5444
└── .github/workflows/ci.yml
```

---

## Requisitos previos

Antes de empezar, instalá:

1. **Git**
2. **Node.js 20+** y npm
3. **Python 3.11+**
4. **Docker Desktop** (para PostgreSQL local)
5. **API key de Gemini** → [Google AI Studio](https://aistudio.google.com/apikey)
6. *(Opcional)* **Access Key de Unsplash** → [Unsplash Developers](https://unsplash.com/developers)

---

## Instalación local (paso a paso)

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/integrador_gs.git
cd integrador_gs
```

### Paso 2 — Levantar PostgreSQL con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Verificá que el contenedor esté sano:

```bash
docker compose ps
```

PostgreSQL queda expuesto en **`localhost:5444`** (usuario `foodalchemy`, contraseña `foodalchemy_dev`, base `foodalchemy`).

### Paso 3 — Configurar y arrancar el backend

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
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

Editá `backend/.env` con estos valores mínimos:

```env
GEMINI_API_KEY=tu-api-key-de-gemini
DATABASE_URL=postgresql+psycopg2://foodalchemy:foodalchemy_dev@localhost:5444/foodalchemy
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

### Paso 4 — Configurar y arrancar el frontend

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
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

### Paso 5 — Verificar que todo funciona

1. Entrá a `/register` y creá una cuenta.
2. Iniciá sesión en `/login`.
3. En la página principal, agregá ingredientes (ej. `tomate`, `huevo`, `queso`).
4. Opcional: abrí **Filtros** y elegí dieta, momento del día o tipo de plato.
5. Tocá **Generar recetas** y esperá las 3 propuestas.
6. Guardá una en favoritos y visitá `/favoritos`.
7. Compartí una receta en `/comunidad`.

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

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `GEMINI_API_KEY` | API key de Google Gemini | `AIzaSy...` |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql+psycopg2://foodalchemy:foodalchemy_dev@localhost:5444/foodalchemy` |
| `JWT_SECRET_KEY` | Secreto para firmar tokens JWT | string largo y aleatorio |
| `JWT_ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token | `10080` (7 días) |
| `GEMINI_MODEL` | Modelo de Gemini | `gemini-2.5-flash-lite` |
| `CORS_ORIGINS` | Orígenes permitidos (`*` o lista separada por comas) | `*` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Desarrollo | Producción |
|----------|-------------|------------|------------|
| `VITE_API_URL` | URL del backend | Vacío (usa proxy Vite) | `https://tu-backend.onrender.com` |
| `VITE_UNSPLASH_ACCESS_KEY` | Key de Unsplash para fotos | Tu access key | Tu access key |

---

## API

Documentación interactiva en `/docs` cuando el backend está corriendo.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Registrar usuario |
| `POST` | `/auth/login` | No | Login (JSON) |
| `POST` | `/auth/token` | No | Login OAuth2 (Swagger) |
| `GET` | `/auth/me` | Sí | Perfil actual |
| `PATCH` | `/auth/me` | Sí | Actualizar perfil |
| `POST` | `/api/recetas` | Sí | Generar recetas con Gemini |
| `GET` | `/recipes` | Sí | Listar favoritos |
| `POST` | `/recipes` | Sí | Guardar favorito |
| `DELETE` | `/recipes/{id}` | Sí | Eliminar favorito |
| `GET` | `/api/comunidad` | No | Listar recetas compartidas |
| `POST` | `/api/comunidad` | Sí | Compartir receta |
| `GET` | `/` | No | Health check |

---

## Deploy en producción (paso a paso)

Guía completa con checklist, CORS, secrets de GitHub y troubleshooting: **[DEPLOY.md](./DEPLOY.md)**

Resumen rápido:
### Paso 1 — Base de datos en Render

1. Creá una instancia **PostgreSQL** en [Render](https://render.com).
2. Copiá la **Internal Database URL** (formato `postgresql://...`).
3. Convertila al formato SQLAlchemy: reemplazá `postgresql://` por `postgresql+psycopg2://`.

### Paso 2 — Backend en Render

1. Creá un **Web Service** conectado al repo de GitHub.
2. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Variables de entorno:
   - `GEMINI_API_KEY`
   - `DATABASE_URL` (URL de Render con `postgresql+psycopg2://`)
   - `JWT_SECRET_KEY` (secreto fuerte, distinto al de desarrollo)
   - `CORS_ORIGINS` → URL de tu frontend en Vercel (ej. `https://tu-app.vercel.app`)
4. Deploy y copiá la URL pública del servicio (ej. `https://foodalchemy-api.onrender.com`).

### Paso 3 — Frontend en Vercel

1. Importá el repo en [Vercel](https://vercel.com).
2. **Root Directory:** `frontend`
3. Variables de entorno:
   - `VITE_API_URL=https://tu-backend.onrender.com`
   - `VITE_UNSPLASH_ACCESS_KEY=tu-key`
4. Deploy.

### Paso 4 — Verificación final

1. Abrí la URL de Vercel.
2. Registrate e iniciá sesión.
3. Generá una receta y confirmá que favoritos y comunidad persisten tras recargar.

---

## CI/CD

El workflow `.github/workflows/ci.yml` se ejecuta en cada push y PR a `main`:

- **Frontend:** `tsc`, build y deploy a Vercel (solo en `main`).
- **Backend:** verificación de sintaxis Python (Render hace autodeploy desde GitHub).

Secrets necesarios en GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## Informe técnico

Documentación ampliada del proyecto: [INFORME.md](./INFORME.md)

---

## IA utilizada

- **Google Gemini** — generación de recetas en tiempo real.
- **Unsplash** — imágenes ilustrativas en las cards (query optimizada por la IA).
