@echo off
echo ========================================
echo Pushing to GitHub: Rohit-1907/Sahayak
echo ========================================
echo.

cd /d d:\capstone

echo Step 1: Initializing Git...
git init

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "Complete OTP verification system with worker arrival flow"

echo.
echo Step 4: Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Rohit-1907/Sahayak.git

echo.
echo Step 5: Pushing to main branch...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo DONE! Check: https://github.com/Rohit-1907/Sahayak
echo ========================================
pause
