# Script para remover variáveis de ambiente conflitantes do Windows
# Execute como Administrador

Write-Host "🔧 Removendo variáveis de ambiente conflitantes..." -ForegroundColor Cyan
Write-Host ""

# Mostra valores atuais
Write-Host "📊 Valores atuais:" -ForegroundColor Yellow
Write-Host "  OPENAI_MODEL (User): $([Environment]::GetEnvironmentVariable('OPENAI_MODEL', 'User'))"
Write-Host "  OPENAI_MODEL (Machine): $([Environment]::GetEnvironmentVariable('OPENAI_MODEL', 'Machine'))"
Write-Host "  OPENAI_BASE_URL (User): $([Environment]::GetEnvironmentVariable('OPENAI_BASE_URL', 'User'))"
Write-Host "  OPENAI_BASE_URL (Machine): $([Environment]::GetEnvironmentVariable('OPENAI_BASE_URL', 'Machine'))"
Write-Host ""

# Remove variáveis do usuário
Write-Host "🗑️  Removendo variáveis de usuário..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("OPENAI_MODEL", $null, "User")
[Environment]::SetEnvironmentVariable("OPENAI_BASE_URL", $null, "User")
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $null, "User")

# Remove variáveis do sistema (requer Admin)
Write-Host "🗑️  Removendo variáveis do sistema..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("OPENAI_MODEL", $null, "Machine")
    [Environment]::SetEnvironmentVariable("OPENAI_BASE_URL", $null, "Machine")
    [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $null, "Machine")
    Write-Host "✅ Variáveis do sistema removidas!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro ao remover variáveis do sistema. Execute como Administrador." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Variáveis de ambiente removidas com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   1. Feche TODOS os terminais abertos" -ForegroundColor Yellow
Write-Host "   2. Abra um NOVO terminal" -ForegroundColor Yellow
Write-Host "   3. Execute: cd e:\Biblia-Codex && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
