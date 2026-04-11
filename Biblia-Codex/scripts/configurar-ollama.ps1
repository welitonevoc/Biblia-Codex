# Script para configurar o Ollama para conexões externas
# Execute como Administrador

Write-Host "🔧 Configurando Ollama para aceitar conexões externas..." -ForegroundColor Cyan

# Verifica se o Ollama está rodando e fecha
Write-Host "⏹️  Verificando processos do Ollama..." -ForegroundColor Yellow
$ollamaProcess = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if ($ollamaProcess) {
    Write-Host "⚠️  Ollama encontrado. Finalizando..." -ForegroundColor Yellow
    Stop-Process -Name "ollama" -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Ollama finalizado." -ForegroundColor Green
} else {
    Write-Host "✅ Ollama não está em execução." -ForegroundColor Green
}

# Configura variáveis de ambiente
Write-Host "`n🌐 Configurando variáveis de ambiente..." -ForegroundColor Cyan
$env:OLLAMA_HOST = "0.0.0.0"
$env:OLLAMA_ORIGINS = "*"

[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0", "User")
[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "User")

Write-Host "✅ OLLAMA_HOST=0.0.0.0" -ForegroundColor Green
Write-Host "✅ OLLAMA_ORIGINS=*" -ForegroundColor Green

# Inicia o Ollama
Write-Host "`n🚀 Iniciando Ollama..." -ForegroundColor Cyan
Write-Host "📌 O Ollama agora aceitará conexões de qualquer endereço." -ForegroundColor Yellow
Write-Host "📌 Pressione Ctrl+C para parar o servidor.`n" -ForegroundColor Yellow

ollama serve
