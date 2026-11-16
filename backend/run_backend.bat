@echo off
echo Starting S-Grocery FastAPI Backend...

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    python main.py
) else (
    echo [NOTE] Virtual environment not found. Running setup first...
    call setup_backend.bat
    call venv\Scripts\activate.bat
    python main.py
)

pause
