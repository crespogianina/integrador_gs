# Deploy paso a paso — FoodAlchemy

Guía para dejar la app **online** con Render (backend + PostgreSQL) y Vercel (frontend). Seguí los pasos en orden.

---

## Antes de empezar

Necesitás:

- Cuenta en [GitHub](https://github.com), [Render](https://render.com) y [Vercel](https://vercel.com)
- API key de [Google Gemini](https://aistudio.google.com/apikey)
- *(Opcional)* Access key de [Unsplash](https://unsplash.com/developers)
- Código pusheado a la rama **`main`** del repo público

---

## Paso 1 — Preparar GitHub

### 1.1 Repo público

1. Abrí `https://github.com/TU_USUARIO/integrador_gs`
2. **Settings** → **General** → **Danger Zone** → **Change repository visibility** → **Public**

### 1.2 Mergear a `main`

El CI/CD y Render despliegan desde `main`:

```bash
git checkout main
git merge fixes-login-y-datos   # o tu rama de trabajo
git push origin main
```

### 1.3 Compartir con el docente

- Enviá el link del repo, **o**
- **Settings** → **Collaborators** → agregar el usuario del docente

---

## Paso 2 — PostgreSQL en Render

1. Entrá a [dashboard.render.com](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Configuración sugerida:
   - **Name:** `foodalchemy-db`
   - **Database:** `foodalchemy`
   - **User:** `foodalchemy`
   - **Plan:** Free
4. **Create Database**
5. Esperá a que esté **Available**
6. En la pestaña **Info**, copiá **Internal Database URL** (la usarás en el backend)

> El backend normaliza automáticamente `postgresql://` a `postgresql+psycopg2://`. Podés pegar la URL de Render tal cual.

---

## Paso 3 — Backend (API) en Render

### Opción A — Blueprint (recomendada si empezás de cero)

1. **New +** → **Blueprint**
2. Conectá el repo `integrador_gs`
3. Render lee `render.yaml` y crea DB + Web Service
4. Completá manualmente en el dashboard:
   - `GEMINI_API_KEY` → tu key de Gemini
   - `CORS_ORIGINS` → lo configurás en el Paso 5 (después de tener la URL de Vercel)

### Opción B — Web Service manual

1. **New +** → **Web Service**
2. Conectá el repo de GitHub
3. Configuración:

| Campo | Valor |
|-------|-------|
| **Name** | `foodalchemy-api` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free |

4. **Environment Variables** (Environment):

| Key | Valor |
|-----|-------|
| `GEMINI_API_KEY` | Tu API key de Gemini |
| `DATABASE_URL` | Internal Database URL del Paso 2 |
| `JWT_SECRET_KEY` | String largo aleatorio (distinto al de local) |
| `JWT_ALGORITHM` | `HS256` |
| `GEMINI_MODEL` | `gemini-2.5-flash-lite` |
| `CORS_ORIGINS` | Temporalmente `*`; luego la URL de Vercel |

5. **Create Web Service** y esperá el primer deploy (5–10 min)
6. Copiá la URL pública, ej: `https://foodalchemy-api.onrender.com`

### 3.1 Verificar backend

Abrí en el navegador:

```
https://TU-API.onrender.com/
```

Deberías ver:

```json
{"status":"ok","message":"FoodAlchemy API funcionando","model":"gemini-2.5-flash-lite"}
```

Swagger: `https://TU-API.onrender.com/docs`

> **Nota:** el plan free de Render “duerme” la API tras inactividad. La primera request puede tardar ~30–60 s.

---

## Paso 4 — Frontend en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new)
2. **Import** del repo `integrador_gs`
3. Configuración:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |

4. **Environment Variables**:

| Key | Valor |
|-----|-------|
| `VITE_API_URL` | `https://TU-API.onrender.com` (sin barra final) |
| `VITE_UNSPLASH_ACCESS_KEY` | Tu access key de Unsplash (opcional) |

5. **Deploy**
6. Copiá la URL de producción, ej: `https://foodalchemy.vercel.app`

El archivo `frontend/vercel.json` ya incluye rewrites para React Router (`/favoritos`, `/login`, etc.).

---

## Paso 5 — CORS en el backend

Volvé a Render → tu Web Service → **Environment**:

1. Editá `CORS_ORIGINS` con la URL exacta de Vercel:

```
https://foodalchemy.vercel.app
```

Si tenés preview domains, podés usar varias separadas por coma:

```
https://foodalchemy.vercel.app,https://integrador-gs.vercel.app
```

2. **Save Changes** → Render redeployea solo

---

## Paso 6 — CI/CD con GitHub Actions (Vercel automático)

Para que cada push a `main` despliegue el frontend:

### 6.1 Obtener tokens de Vercel

1. [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create** → copiá el token
2. En el proyecto de Vercel → **Settings** → **General**:
   - Copiá **Project ID**
3. En **Team Settings** (o cuenta personal) → **General**:
   - Copiá **Team ID** (= `VERCEL_ORG_ID`)

### 6.2 Secrets en GitHub

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Valor |
|--------|-------|
| `VERCEL_TOKEN` | Token del paso 6.1 |
| `VERCEL_ORG_ID` | Team / Org ID |
| `VERCEL_PROJECT_ID` | Project ID de Vercel |

### 6.3 Render autodeploy

En Render → Web Service → **Settings** → **Build & Deploy** → activá **Auto-Deploy** en la rama `main`.

---

## Paso 7 — Verificación final (checklist)

Marcá cada ítem después de probarlo en la **URL de Vercel** (no en localhost):

- [ ] Registro de usuario nuevo
- [ ] Login y logout
- [ ] Generar recetas con ingredientes
- [ ] Filtros (dieta, momento, sabor)
- [ ] Guardar y ver favoritos (persisten al recargar)
- [ ] Compartir en comunidad
- [ ] Ver comunidad sin login
- [ ] Imágenes en cards (si configuraste Unsplash)

---

## Paso 8 — Actualizar README con links de demo

Editá `README.md` sección **Demo en vivo**:

```markdown
## Demo en vivo

- **App:** https://foodalchemy.vercel.app
- **API:** https://foodalchemy-api.onrender.com
- **Swagger:** https://foodalchemy-api.onrender.com/docs
```

Hacé commit y push a `main`.

---

## Solución de problemas

### Failed to fetch (frontend)

- `VITE_API_URL` en Vercel debe ser la URL del backend **con** `https://`
- Rebuild en Vercel después de cambiar variables (`Deployments` → **Redeploy**)
- Verificá `CORS_ORIGINS` en Render

### 502 / API no responde

- Plan free: esperá 60 s en la primera request (cold start)
- Revisá **Logs** en Render
- Confirmá `GEMINI_API_KEY` y `DATABASE_URL`

### Error de Gemini `limit: 0`

- Creá una API key nueva en [AI Studio](https://aistudio.google.com/apikey)
- Actualizá `GEMINI_API_KEY` en Render

### Rutas 404 al recargar (`/favoritos`, etc.)

- Confirmá que existe `frontend/vercel.json` con rewrites
- Redeploy en Vercel

### Base de datos vacía / tablas no existen

- Las tablas se crean al arrancar la API (`create_all` en `main.py`)
- Revisá logs de Render al primer deploy; si `DATABASE_URL` falla, no conecta

---

## Resumen de URLs a guardar

| Servicio | URL |
|----------|-----|
| Frontend (demo) | `https://____________.vercel.app` |
| Backend API | `https://____________.onrender.com` |
| Repo GitHub | `https://github.com/crespogianina/integrador_gs` |
