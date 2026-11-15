# S-Grocery FastAPI Backend on Render

This is the FastAPI backend for the S-Grocery application, designed to be deployed for free on **Render**.

## Features
- **FastAPI**: Fast, asynchronous Python REST API framework.
- **Firebase Firestore & Auth Ready**: Integrates with Firebase Admin SDK.
- **Voice Assistance API**: Multi-lingual pronunciation phrases for English, Bengali, and Hindi.
- **Render Ready**: Includes `render.yaml`, `Dockerfile`, and automatic PORT binding.

---

## How to Deploy to Render (Step by Step)

### Option A: Deploy via GitHub (Recommended)
1. Push this project to your GitHub repository (e.g., `https://github.com/manishamandal1105/S-grocery.git`).
2. Go to [Render.com](https://render.com) and log in.
3. In the Render Dashboard, click **New +** and select **Web Service**.
4. Connect your GitHub repository `S-grocery`.
5. Fill in the following settings:
   - **Name:** `s-grocery-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
6. Click **Create Web Service**.
7. Render will build and deploy your API! Once deployed, you will get a public URL like:
   `https://s-grocery-backend.onrender.com`

---

## Local Development
To run this FastAPI server locally:

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open your browser at `http://localhost:8000/docs` to view the interactive Swagger API documentation.
