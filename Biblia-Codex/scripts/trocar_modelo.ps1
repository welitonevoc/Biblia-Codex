# Script para trocar modelo no OpenCode (Ollama)
# Execute: .\trocar_modelo.ps1 llama3.2
# ou: .\trocar_modelo.ps1 qwen2.5-coder:7b

param(
    [Parameter(Mandatory=$true)]
    [string]$Modelo
)

$ConfigPath = "$env:USERPROFILE\.config\opencode\opencode.json"

if (-not (Test-Path $ConfigPath)) {
    Write-Host "❌ Arquivo de configuração não encontrado: $ConfigPath" -ForegroundColor Red
    exit 1
}

# Lê a configuração
$config = Get-Content $ConfigPath | ConvertFrom-Json

# Verifica se o modelo existe na configuração
if (-not $config.provider.ollama.models.$Modelo) {
    Write-Host "❌ Modelo '$Modelo' não está configurado!" -ForegroundColor Red
    Write-Host "Modelos disponíveis:" -ForegroundColor Yellow
    $config.provider.ollama.models.PSObject.Properties | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Cyan
    }
    exit 1
}

# Atualiza o modelo atual
$config.model = "ollama/$Modelo"

# Salva a configuração
$config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath

Write-Host "✅ Modelo alterado para: $Modelo" -ForegroundColor Green
Write-Host "Reinicie o OpenCode para aplicar as mudanças." -ForegroundColor Yellow
