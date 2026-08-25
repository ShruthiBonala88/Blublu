# Blublu Automated Deploy Script
Write-Host "🚀 Starting Automated Build & Deployment..." -ForegroundColor Cyan

# 1. Build frontend web bundle
Write-Host "📦 Building Frontend Web Production Bundle..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"
npm run build:web

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Exit 1
}

# 2. Return to root & commit
Set-Location -Path "$PSScriptRoot"
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add -A
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "deploy: automated deployment - $timestamp"

# 3. Push to main monorepo
Write-Host "🌐 Pushing to Monorepo (ShruthiBonala88/Blublu)..." -ForegroundColor Yellow
git push origin main

# 4. Push subtree to Vercel connected repo (ShruthiBonala88/Blublu_frontend)
Write-Host "⚡ Pushing to Vercel Repo (ShruthiBonala88/Blublu_frontend)..." -ForegroundColor Yellow
git subtree split --prefix frontend -b auto-deploy-branch
git push frontend_repo auto-deploy-branch:main --force
git branch -D auto-deploy-branch

Write-Host "✅ Automatic Deployment Completed! Vercel is now building live." -ForegroundColor Green
