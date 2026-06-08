# 🍽️ RecetasIA — Cociná con lo que tenés

Ingresá los ingredientes que tenés en tu heladera y la IA genera recetas personalizadas en segundos. Con filtros por dieta, porciones, complejidad y tiempo de cocción.

## ✨ Features

- 🧅 **Input de ingredientes** con chips interactivos y sugerencias rápidas
- 🤖 **Generación con Claude** — 3 recetas que maximizan los ingredientes disponibles
- 🥦 **Filtros completos**: vegetariano, vegano, sin gluten, sin lactosa, porciones, dificultad y tiempo
- ⚡ **Modo "Tengo hambre ya"** — recetas fáciles de máximo 15 minutos
- 📋 **Ver pasos** en cada card expandible con tip del chef
- ❤️ **Guardar favoritos** en localStorage
- 📋 **Compartir receta** copiando al portapapeles

## 🛠 Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS v3 |
| Backend | FastAPI + Python 3.11 |
| IA | Claude claude-sonnet-4-20250514 (Anthropic) |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| CI/CD | GitHub Actions |

## 🚀 Correr el proyecto localmente

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Editá .env y pegá tu API key de Anthropic

uvicorn main:app --reload
# API corriendo en http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# .env ya apunta a http://localhost:8000 por defecto

npm run dev
# App corriendo en http://localhost:5173
```

## 🌐 Deploy

### Backend en Render

1. Crear nuevo **Web Service** en [render.com](https://render.com)
2. Conectar el repo de GitHub
3. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Agregar variable de entorno: `ANTHROPIC_API_KEY=sk-ant-...`
5. Deploy → copiar la URL del servicio

### Frontend en Vercel

1. Crear nuevo proyecto en [vercel.com](https://vercel.com)
2. Conectar el repo, **Root Directory**: `frontend`
3. Agregar variable de entorno: `VITE_API_URL=https://tu-backend.onrender.com`
4. Deploy

### CI/CD con GitHub Actions

Agregar estos secrets en el repo de GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

En cada push a `main` se ejecuta type check, build y deploy automático.

## 🤖 IA utilizada

- **Claude claude-sonnet-4-20250514 (Anthropic)** — generación de recetas en tiempo real
- **Claude (claude.ai)** — desarrollo asistido, debugging y arquitectura del proyecto

## 📝 Informe Técnico

Ver [INFORME.md](./INFORME.md)
