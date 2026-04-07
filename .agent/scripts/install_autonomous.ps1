#!/usr/bin/env pwsh
# install_autonomous.ps1 - Instala Sistema de Agente Autônomo

$ErrorActionPreference = "Stop"

Write-Host "`n🤖 Instalando Sistema de Agente Autônomo..." -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Verificar pré-requisitos
Write-Host "`n📋 Verificando pré-requisitos..." -ForegroundColor Yellow

# Verificar Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado. Instale Python 3.8+" -ForegroundColor Red
    exit 1
}

# Verificar arquivo de configuração
$ConfigPath = ".agent\autonomous_config.json"
if (Test-Path $ConfigPath) {
    Write-Host "✅ Configuração encontrada: $ConfigPath" -ForegroundColor Green
} else {
    Write-Host "⚠️ Configuração não encontrada. Criando..." -ForegroundColor Yellow
    python .agent/scripts/autonomous_agent.py init
}

# 2. Copiar configuração para diretório global
$GlobalConfigDir = "$env:USERPROFILE\.antigravity"
$GlobalConfigPath = "$GlobalConfigDir\autonomous_config.json"

if (-not (Test-Path $GlobalConfigDir)) {
    New-Item -ItemType Directory -Path $GlobalConfigDir | Out-Null
    Write-Host "✅ Diretório global criado: $GlobalConfigDir" -ForegroundColor Green
}

if (Test-Path $ConfigPath) {
    Copy-Item -Path $ConfigPath -Destination $GlobalConfigPath -Force
    Write-Host "✅ Configuração copiada para: $GlobalConfigPath" -ForegroundColor Green
}

# 3. Configurar hooks do Git
Write-Host "`n🔧 Configurando Git Hooks..." -ForegroundColor Yellow

$GitHooksDir = ".git\hooks"
if (-not (Test-Path $GitHooksDir)) {
    New-Item -ItemType Directory -Path $GitHooksDir | Out-Null
}

# Pre-commit hook
$PreCommitHook = @'
#!/bin/sh
# Git Pre-Commit Hook - Antigravity Autonomous Agent

echo "🤖 Running Autonomous Agent (pre-commit)..."
python .agent/scripts/autonomous_agent.py run

# Check exit code
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit checks failed!"
    exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
'@

Set-Content -Path "$GitHooksDir\pre-commit" -Value $PreCommitHook
(Get-Item "$GitHooksDir\pre-commit").Attributes = "ReadOnly"
Write-Host "✅ Pre-commit hook instalado" -ForegroundColor Green

# Pre-push hook
$PrePushHook = @'
#!/bin/sh
# Git Pre-Push Hook - Antigravity Autonomous Agent

echo "🤖 Running Autonomous Agent (pre-push)..."
python .agent/scripts/autonomous_agent.py force

# Check exit code
if [ $? -ne 0 ]; then
    echo "❌ Pre-push checks failed!"
    exit 1
fi

echo "✅ Pre-push checks passed!"
exit 0
'@

Set-Content -Path "$GitHooksDir\pre-push" -Value $PrePushHook
(Get-Item "$GitHooksDir\pre-push").Attributes = "ReadOnly"
Write-Host "✅ Pre-push hook instalado" -ForegroundColor Green

# 4. Criar diretório de relatórios
$ReportsDir = ".agent\reports"
if (-not (Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Path $ReportsDir | Out-Null
    Write-Host "✅ Diretório de relatórios criado: $ReportsDir" -ForegroundColor Green
}

# 5. Configurar Task Scheduler (Windows) - Opcional
Write-Host "`n⏰ Configurando Task Scheduler (Opcional)..." -ForegroundColor Yellow
$Response = Read-Host "Deseja configurar task diária? (y/N)"

if ($Response -eq 'y' -or $Response -eq 'Y') {
    $TaskName = "Antigravity_Daily_Check"
    $ScriptPath = "python $(Get-Location)\.agent\scripts\autonomous_agent.py run"
    
    # Verificar se task já existe
    $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($ExistingTask) {
        Write-Host "⚠️ Task já existe. Removendo..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    
    # Criar scheduled task
    $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `"$ScriptPath`""
    $Trigger = New-ScheduledTaskTrigger -Daily -At 9am
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    try {
        Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
        Write-Host "✅ Task Scheduler configurado: $TaskName" -ForegroundColor Green
        Write-Host "   📅 Execução: Diária às 09:00" -ForegroundColor Cyan
    } catch {
        Write-Host "⚠️ Erro ao criar task (executando como administrador pode ser necessário)" -ForegroundColor Yellow
    }
}

# 6. Criar atalhos no VS Code (opcional)
Write-Host "`n💻 Configurando VS Code (Opcional)..." -ForegroundColor Yellow
$VSCodeSettingsDir = ".vscode"
if (-not (Test-Path $VSCodeSettingsDir)) {
    New-Item -ItemType Directory -Path $VSCodeSettingsDir | Out-Null
}

$VSCodeTasks = @{
    version = "2.0.0"
    tasks = @(
        @{
            label = "🤖 Autonomous: Status"
            type = "shell"
            command = "python .agent/scripts/autonomous_agent.py status"
            problemMatcher = @()
            group = "build"
        },
        @{
            label = "🤖 Autonomous: Run Checks"
            type = "shell"
            command = "python .agent/scripts/autonomous_agent.py run"
            problemMatcher = @()
            group = "test"
        },
        @{
            label = "🤖 Autonomous: Force Run"
            type = "shell"
            command = "python .agent/scripts/autonomous_agent.py force"
            problemMatcher = @()
            group = "test"
        }
    )
} | ConvertTo-Json -Depth 10

$VSCodeTasks | Set-Content -Path "$VSCodeSettingsDir\tasks.json" -Encoding UTF8
Write-Host "✅ VS Code tasks configuradas" -ForegroundColor Green

# 7. Verificar instalação
Write-Host "`n🔍 Verificando instalação..." -ForegroundColor Yellow

try {
    $status = python .agent/scripts/autonomous_agent.py status 2>&1
    Write-Host "✅ Agente autônomo funcional" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao verificar agente" -ForegroundColor Red
    exit 1
}

# Resumo final
Write-Host "`n" + "=" * 60
Write-Host "🎉 Instalação do Agente Autônomo concluída!" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📚 Documentação:" -ForegroundColor Cyan
Write-Host "   • SKILLS_INVENTORY.md - Inventário de skills"
Write-Host "   • INSTALACAO_GLOBAL.md - Instalação global"
Write-Host "   • COMO_REQUISITAR.md - Como usar skills"
Write-Host "   • AGENTE_AUTONOMO.md - Sistema autônomo"

Write-Host "`n💡 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   python .agent/scripts/autonomous_agent.py status   # Ver status"
Write-Host "   python .agent/scripts/autonomous_agent.py run      # Executar checks"
Write-Host "   python .agent/scripts/autonomous_agent.py force    # Forçar execução"
Write-Host "   python .agent/scripts/autonomous_agent.py init     # Recriar config"

Write-Host "`n🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Edite .agent/autonomous_config.json para personalizar"
Write-Host "   2. Teste com: python .agent/scripts/autonomous_agent.py run"
Write-Host "   3. Habilite triggers adicionais conforme necessário"

Write-Host "`n"
