@echo off
echo ====================================================
echo Setting up S-Grocery Backend in Isolated Virtualenv
echo ====================================================

REM 1. Create a dedicated, isolated virtual environment if not already present
if not exist "venv\" (
    echo Creating isolated Python virtual environment (venv)...
    python -m venv venv
)

REM 2. Activate the virtual environment
call venv\Scripts\activate.bat

REM 3. Upgrade pip and install packages inside venv ONLY (never touches global Python)
echo Installing packages inside isolated venv...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ====================================================
echo Setup complete! Packages installed inside isolated venv.
echo Your global Python and system remain 100%% untouched.
echo To run backend, double-click run_backend.bat
echo ====================================================
pause
