# Deploy paso a paso — FoodAlchemy

Guía para dejar la app **online** con Render (backend + PostgreSQL) y Vercel (frontend). Seguí los pasos en orden.

---

## Antes de empezar

Necesitás:

- Cuenta en [GitHub](https://github.com), [Render](https://render.com) y [Vercel](https://vercel.com)
- API key de [Google Gemini](https://aistudio.google.com/apikey)
- _(Opcional)_ Access key de [Unsplash](https://unsplash.com/developers)
- Código pusheado a la rama **`main`** del repo público

---

## Paso 1 — Preparar GitHub

### 1.1 Repo público

1. Abrí `https://github.com/crespogianina/integrador_gs`
2. Confirmá que el repo sea público (visible sin login)

### 1.2 Compartir con el docente

- Enviá el link del repo, **o**
- **Settings** → **Collaborators** → agregar el usuario del docente

---

## Paso 2 — PostgreSQL en Render

1. Entrá a [dashboard.render.com](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Configuración:
   - **Name:** `foodalchemy-db`
   - **Database:** `foodalchemy_db`
   - **User:** `foodalchemy_db_user`
   - **Plan:** Free
4. **Create Database**
5. Esperá a que esté **Available**
6. En la pestaña **Info**, copiá **Internal Database URL**

> El backend normaliza automáticamente `postgresql://` a `postgresql+psycopg2://`. Podés pegar la URL de Render tal cual.

---

## Paso 3 — Backend (API) en Render

1. **New +** → **Web Service**
2. Conectá el repo de GitHub
3. Configuración:

| Campo              | Valor                                          |
| ------------------ | ---------------------------------------------- |
| **Name**           | `integrador_gs`                                |
| **Root Directory** | `backend`                                      |
| **Runtime**        | Python 3                                       |
| **Build Command**  | `pip install -r requirements.txt`              |
| **Start Command**  | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan**           | Free                                           |

4. **Environment Variables**:

| Key              | Valor                                             |
| ---------------- | ------------------------------------------------- |
| `GEMINI_API_KEY` | Tu API key de Gemini                              |
| `DATABASE_URL`   | Internal Database URL del Paso 2                  |
| `JWT_SECRET_KEY` | String largo aleatorio                            |
| `JWT_ALGORITHM`  | `HS256`                                           |
| `GEMINI_MODEL`   | `gemini-2.5-flash-lite`                           |
| `CORS_ORIGINS`   | `*` (temporalmente; actualizá después del Paso 4) |

5. **Create Web Service** y esperá el primer deploy (~5 min)

### Verificar backend

Abrí en el navegador:

```
https://integrador-gs.onrender.com/
```

Deberías ver:

```json
{
  "status": "ok",
  "message": "FoodAlchemy API funcionando",
  "model": "gemini-2.5-flash-lite"
}
```

Swagger: `https://integrador-gs.onrender.com/docs`

> **Nota:** el plan free de Render "duerme" la API tras inactividad. La primera request puede tardar ~30–60 s.

---

## Paso 4 — Frontend en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new)
2. **Import** del repo `integrador_gs`
3. Configuración:

| Campo                | Valor           |
| -------------------- | --------------- |
| **Framework Preset** | Vite            |
| **Root Directory**   | `frontend`      |
| **Build Command**    | `npm run build` |
| **Output Directory** | `dist`          |

4. **Environment Variables**:

| Key                        | Valor                                |
| -------------------------- | ------------------------------------ |
| `VITE_API_URL`             | `https://integrador-gs.onrender.com` |
| `VITE_UNSPLASH_ACCESS_KEY` | Tu access key de Unsplash            |

5. **Deploy**

La URL de producción es: `https://integradorgs-frontend.vercel.app`

---

## Paso 5 — CORS en el backend

Volvé a Render → `integrador_gs` → **Environment** → editá `CORS_ORIGINS`:

```
https://integradorgs-frontend.vercel.app
```

**Save Changes** → Render redeployea automáticamente.

---

## Paso 6 — CI/CD con GitHub Actions

Para que cada push a `main` despliegue el frontend automáticamente:

### 6.1 Obtener tokens de Vercel

1. [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create** → copiá el token
2. En el proyecto de Vercel → **Settings** → **General** → copiá **Project ID**
3. En **Team Settings** → **General** → copiá **Team ID**

### 6.2 Secrets en GitHub

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret              | Valor                                         |
| ------------------- | --------------------------------------------- |
| `VERCEL_TOKEN`      | Token del paso 6.1                            |
| `VERCEL_ORG_ID`     | Team ID de Vercel                             |
| `VERCEL_PROJECT_ID` | Project ID de Vercel                          |
| `GEMINI_API_KEY`    | Tu API key de Gemini (para los agentes de IA) |

---

## Paso 7 — Verificación final

Probá en **https://integradorgs-frontend.vercel.app**:

- [ ] Registro de usuario nuevo
- [ ] Login y logout
- [ ] Generar recetas con ingredientes
- [ ] Filtros (dieta, momento, sabor)
- [ ] Guardar y ver favoritos (persisten al recargar)
- [ ] Compartir en comunidad
- [ ] Ver comunidad sin login
- [ ] Imágenes en cards (si configuraste Unsplash)

---

## Solución de problemas

### Failed to fetch (frontend)

- `VITE_API_URL` en Vercel debe ser `https://integrador-gs.onrender.com` (sin barra final)
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
- Revisá logs de Render al primer deploy

---

## URLs de producción

| Servicio            | URL                                            |
| ------------------- | ---------------------------------------------- |
| **Frontend (demo)** | https://integradorgs-frontend.vercel.app       |
| **Backend API**     | https://integrador-gs.onrender.com             |
| **Swagger**         | https://integrador-gs.onrender.com/docs        |
| **Repositorio**     | https://github.com/crespogianina/integrador_gs |
