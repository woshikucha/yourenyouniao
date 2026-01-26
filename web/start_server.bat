@echo off
echo Starting local server...
echo Open browser and visit: http://localhost:8000
echo.
python -m http.server 8000
pause
