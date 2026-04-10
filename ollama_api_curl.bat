REM Exemplos de uso da API Ollama via cURL (Windows)
@echo off
chcp 65001 >nul
echo ==========================================
echo API Ollama - Exemplos com cURL
echo ==========================================

set OLLAMA_URL=http://localhost:11434

echo.
echo 1. LISTAR MODELOS:
echo ------------------
curl -s %OLLAMA_URL%/api/tags | findstr "name"

echo.
echo 2. GERAR TEXTO (prompt simples):
echo --------------------------------
curl -s -X POST %OLLAMA_URL%/api/generate -H "Content-Type: application/json" -d "{\"model\": \"qwen2.5-coder:3b\", \"prompt\": \"Ola! Qual eh a capital do Brasil?\", \"stream\": false}"

echo.
echo.
echo 3. CHAT COM HISTORICO:
echo ----------------------
curl -s -X POST %OLLAMA_URL%/api/chat -H "Content-Type: application/json" -d "{\"model\": \"qwen2.5-coder:3b\", \"messages\": [{\"role\": \"user\", \"content\": \"Meu nome eh Maria\"}, {\"role\": \"user\", \"content\": \"Qual eh meu nome?\"}], \"stream\": false}"

echo.
echo.
echo ==========================================
echo Exemplos concluidos!
echo ==========================================

REM Notas:
REM - stream:false = resposta completa de uma vez
REM - stream:true = resposta em partes (streaming)
REM - Use \" no JSON quando executar via batch/cmd

pause
