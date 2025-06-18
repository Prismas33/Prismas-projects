# Script para configurar CORS no Firebase Storage
# Certifique-se de ter o Google Cloud SDK instalado

# Definição dos valores específicos do projeto
$PROJECT_ID = "linkmind-94209"  # Extraído da URL do erro
$STORAGE_BUCKET = "linkmind-94209.firebasestorage.app"  # Bucket atualizado para firebasestorage.app

Write-Host "=== Configuração de CORS para Firebase Storage ===" -ForegroundColor Green
Write-Host ""
Write-Host "Projeto: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Bucket: $STORAGE_BUCKET" -ForegroundColor Cyan
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
    Write-Host "gcloud config set project $PROJECT_ID" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Executando os comandos automaticamente..." -ForegroundColor Yellow
Write-Host ""

# Configurar o projeto
Write-Host "Configurando o projeto: $PROJECT_ID" -ForegroundColor White
gcloud config set project $PROJECT_ID

# Aplicar configuração CORS
Write-Host ""
Write-Host "Aplicando configuração CORS ao bucket: $STORAGE_BUCKET" -ForegroundColor White
gsutil cors set cors.json gs://$STORAGE_BUCKET

# Verificar a configuração
Write-Host ""
Write-Host "Verificando configuração CORS aplicada:" -ForegroundColor White
gsutil cors get gs://$STORAGE_BUCKET

Write-Host ""
Write-Host "✅ Configuração CORS aplicada com sucesso!" -ForegroundColor Green
Write-Host "Aguarde alguns minutos para as alterações se propagarem completamente." -ForegroundColor Yellow
Write-Host "Se o problema persistir, tente limpar o cache do navegador." -ForegroundColor Yellow
