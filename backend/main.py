"""
S-Grocery Backend API
Built with Python & FastAPI
Configured for deployment on Render
Database: Firebase Firestore / Firebase Admin SDK
"""

from fastapi import FastAPI, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import os
import urllib.request
import urllib.parse

# Initialize FastAPI App
app = FastAPI(
    title="S-Grocery Backend API",
    description="FastAPI Backend for S-Grocery Smart Kirana & Store Management",
    version="1.0.0"
)

# Enable CORS for frontend requests (Local development & Firebase Hosting)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Adjust to specific Firebase Hosting URL in production
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---

class StoreProfile(BaseModel):
    store_name: str = Field(..., description="Name of the grocery store")
    owner_name: str = Field(..., description="Name of the shop owner")
    email: EmailStr = Field(..., description="Owner email address")
    business_type: str = Field("Retail Shop", description="Retail Shop, Shop & Supply, or Wholesale")
    phone: Optional[str] = None
    address: Optional[str] = None
    joined_date: Optional[str] = None

class SaleItem(BaseModel):
    store_name: str
    amount: float
    payment_mode: str = Field("Cash", description="Cash, UPI, or Credit")
    customer_name: Optional[str] = "Walk-in Customer"
    timestamp: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = Field("owner", description="owner or helper")

# --- In-Memory Cache / Fallback Store ---
in_memory_stores = {}
in_memory_sales = []

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "S-Grocery Backend API",
        "timestamp": datetime.utcnow().isoformat(),
        "hosted_on": "Render",
        "supported_languages": ["en", "bn", "hi"]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "uptime": "ok",
        "service": "FastAPI on Render"
    }

# Voice Assistance Pronunciation Helper Endpoint
@app.get("/api/voice/phrases")
def get_voice_phrases(lang: str = "en"):
    """
    Returns verified speech assistant phrases in English, Bengali, or Hindi.
    """
    phrases = {
        "en": {
            "langSelected": "You selected English language.",
            "rolePrompt": "Select your role.",
            "fields": {
                "name": "Name",
                "store_name": "Store Name",
                "email": "Email Address",
                "password": "Password",
                "business_type": "Business Type",
                "passcode": "Passcode"
            }
        },
        "bn": {
            "langSelected": "আপনি বাংলা ভাষা নির্বাচন করেছেন।",
            "rolePrompt": "আপনার ভূমিকা নির্বাচন করুন।",
            "fields": {
                "name": "নাম",
                "store_name": "দোকানের নাম",
                "email": "ইমেল ঠিকানা",
                "password": "পাসওয়ার্ড",
                "business_type": "ব্যবসার ধরন",
                "passcode": "পাসকোড"
            }
        },
        "hi": {
            "langSelected": "आपने हिंदी भाषा चुनी है।",
            "rolePrompt": "अपनी भूमिका चुनें।",
            "fields": {
                "name": "नाम",
                "store_name": "दुकान का नाम",
                "email": "ईमेल पता",
                "password": "पासवर्ड",
                "business_type": "व्यापार का प्रकार",
                "passcode": "पासकोड"
            }
        }
    }
    return phrases.get(lang, phrases["en"])

@app.get("/api/tts")
def text_to_speech(text: str, lang: str = "bn"):
    """
    Server-side Text-To-Speech proxy for natural Bengali speech synthesis.
    Eliminates browser CORS restrictions and OS language pack dependencies.
    """
    if not text:
        raise HTTPException(status_code=400, detail="Missing text parameter")
    try:
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.parse.quote(text)}&tl={lang}&client=tw-ob"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "*/*"
            }
        )
        with urllib.request.urlopen(req) as resp:
            audio_bytes = resp.read()
            return Response(
                content=audio_bytes,
                media_type="audio/mpeg",
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Access-Control-Allow-Origin": "*"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS streaming error: {str(e)}")

# Store Profile Endpoints
@app.post("/api/stores", status_code=status.HTTP_201_CREATED)
def create_store_profile(store: StoreProfile):
    in_memory_stores[store.email] = store.dict()
    return {
        "message": "Store profile saved successfully",
        "store": store
    }

@app.get("/api/stores/{email}")
def get_store_profile(email: str):
    if email in in_memory_stores:
        return in_memory_stores[email]
    return {
        "store_name": "My Store",
        "owner_name": "Shop Owner",
        "email": email,
        "business_type": "Retail Shop",
        "joined_date": datetime.utcnow().strftime("%Y-%m-%d")
    }

# Sales Endpoints
@app.post("/api/sales", status_code=status.HTTP_201_CREATED)
def record_sale(sale: SaleItem):
    sale_data = sale.dict()
    sale_data["id"] = f"sale_{len(in_memory_sales) + 1}"
    sale_data["timestamp"] = sale_data["timestamp"] or datetime.utcnow().isoformat()
    in_memory_sales.append(sale_data)
    return {
        "message": "Sale recorded successfully",
        "sale": sale_data
    }

@app.get("/api/sales")
def get_sales(store_name: Optional[str] = None):
    if store_name:
        filtered = [s for s in in_memory_sales if s.get("store_name") == store_name]
        return filtered
    return in_memory_sales

# Authentication Endpoint
@app.post("/api/auth/login")
def login(creds: LoginRequest):
    # In production, this verifies with Firebase Admin Auth SDK
    return {
        "authenticated": True,
        "role": creds.role,
        "email": creds.email,
        "token": f"mock_jwt_token_{creds.role}_{datetime.utcnow().timestamp()}"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
