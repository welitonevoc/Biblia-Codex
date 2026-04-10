# start-local.ps1 - Inicia o OpenClaude com modelos locais (Ollama)
$ErrorActionPreference = "Stop"
Write-Host "Iniciando OpenClaude em Modo Local..."

if (Test-Path ".env.local")
{
    $envContent = Get-Content ".env.local"
    foreach ($line in $envContent)
    {
        if ($line -match '^([^=#\s]+)=([^#]*)')
        {
            $key = $Matches[1].Trim()
            $val = $Matches[2].Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
        }
    }
}

Write-Host "Verificando conexao com Ollama..."
try
{
    $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction Stop
    Write-Host "Ollama Online!"
}
catch
{
    Write-Host "Erro: Ollama Offline."
    exit 1
}

Write-Host "Lancando OpenClaude..."
openclaude $args
