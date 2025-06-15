# Script para configurar CORS no Firebase Storage
# Certifique-se de ter o Google Cloud SDK instalado

Write-Host "=== Configuração de CORS para Firebase Storage ===" -ForegroundColor Green
Write-Host ""

# Verificar se gcloud está instalado
if (Get-Command "gcloud" -ErrorAction SilentlyContinue) {
    Write-Host "✅ Google Cloud SDK encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Google Cloud SDK não encontrado" -ForegroundColor Red
    Write-Host "Por favor, instale o Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Após a instalação, execute:" -ForegroundColor Yellow
    Write-Host "gcloud auth login" -ForegroundColor Cyan
    Write-Host "gcloud config set project SEU_PROJECT_ID" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Para configurar o CORS no seu Firebase Storage bucket:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Faça login no Google Cloud:" -ForegroundColor White
Write-Host "   gcloud auth login" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Configure o projeto:" -ForegroundColor White
Write-Host "   gcloud config set project SEU_PROJECT_ID" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Aplique a configuração CORS:" -ForegroundColor White
Write-Host "   gsutil cors set cors.json gs://SEU_STORAGE_BUCKET" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Verifique a configuração:" -ForegroundColor White
Write-Host "   gsutil cors get gs://SEU_STORAGE_BUCKET" -ForegroundColor Cyan
Write-Host ""
Write-Host "Substitua SEU_PROJECT_ID e SEU_STORAGE_BUCKET pelos valores do seu projeto Firebase." -ForegroundColor Yellow
Write-Host ""
Write-Host "O arquivo cors.json já foi criado na raiz do projeto com a configuração necessária." -ForegroundColor Green
