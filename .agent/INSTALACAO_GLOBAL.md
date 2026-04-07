# 🌍 Instalação Global de Skills - Antigravity Kit

> **Guia completo para instalar skills globalmente e usar em qualquer projeto**

---

## 📦 OPÇÃO 1: Instalação com npx (Recomendado)

### Instalação Única

```bash
# Windows (PowerShell)
npx antigravity-awesome-skills

# Linux/Mac
npx antigravity-awesome-skills
```

**Local de instalação padrão:**
- Windows: `%USERPROFILE%\.gemini\antigravity\skills`
- Linux/Mac: `~/.gemini/antigravity/skills`

### Verificar Instalação

```bash
# Windows (PowerShell)
Test-Path ~\.gemini\antigravity\skills && echo "Skills instaladas!"

# Linux/Mac
test -d ~/.gemini/antigravity/skills && echo "Skills instaladas!"
```

---

## 📦 OPÇÃO 2: Instalação Manual (Controle Total)

### Passo 1: Escolher Local Global

```bash
# Windows
mkdir C:\Users\Jose Menezes\.antigravity\skills

# Linux/Mac
mkdir -p ~/.antigravity/skills
```

### Passo 2: Copiar Skills

```bash
# Copiar skills locais para global (Windows)
xcopy /E /I .agent\skills C:\Users\Jose Menezes\.antigravity\skills

# Copiar antigravity-awesome-skills (Windows)
xcopy /E /I .agent\antigravity-awesome-skills-main\skills C:\Users\Jose Menezes\.antigravity\skills

# Linux/Mac
cp -r .agent/skills ~/.antigravity/skills
cp -r .agent/antigravity-awesome-skills-main/skills ~/.antigravity/skills
```

### Passo 3: Configurar Variável de Ambiente

**Windows (PowerShell - perfil permanente):**

```powershell
# Adicionar ao perfil do PowerShell
$env:ANTIGRAVITY_SKILLS = "C:\Users\Jose Menezes\.antigravity\skills"
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_SKILLS", "C:\Users\Jose Menezes\.antigravity\skills", "User")
```

**Linux/Mac (.bashrc ou .zshrc):**

```bash
export ANTIGRAVITY_SKILLS="$HOME/.antigravity/skills"
```

---

## 📦 OPÇÃO 3: Script de Instalação Automática

### Criar Script `install-skills.ps1` (Windows)

```powershell
#!/usr/bin/env pwsh
# install-skills.ps1 - Instalação Global de Skills Antigravity

$ErrorActionPreference = "Stop"

# Configurações
$GlobalSkillsPath = "$env:USERPROFILE\.antigravity\skills"
$ProjectSkillsPath = ".agent\skills"
$AwesomeSkillsPath = ".agent\antigravity-awesome-skills-main\skills"

Write-Host "🌍 Instalando Skills Antigravity Globalmente..." -ForegroundColor Cyan

# Criar diretório global
if (-not (Test-Path $GlobalSkillsPath)) {
    New-Item -ItemType Directory -Path $GlobalSkillsPath | Out-Null
    Write-Host "✅ Diretório criado: $GlobalSkillsPath" -ForegroundColor Green
}

# Copiar skills locais
if (Test-Path $ProjectSkillsPath) {
    Write-Host "📦 Copiando skills locais..." -ForegroundColor Yellow
    Copy-Item -Path $ProjectSkillsPath -Destination $GlobalSkillsPath -Recurse -Force
    Write-Host "✅ Skills locais copiadas" -ForegroundColor Green
}

# Copiar antigravity-awesome-skills
if (Test-Path $AwesomeSkillsPath) {
    Write-Host "📦 Copiando antigravity-awesome-skills (1272+ skills)..." -ForegroundColor Yellow
    Copy-Item -Path $AwesomeSkillsPath -Destination $GlobalSkillsPath -Recurse -Force
    Write-Host "✅ 1272+ skills copiadas" -ForegroundColor Green
}

# Configurar variável de ambiente
$env:ANTIGRAVITY_SKILLS = $GlobalSkillsPath
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_SKILLS", $GlobalSkillsPath, "User")
Write-Host "✅ Variável de ambiente configurada" -ForegroundColor Green

# Verificar instalação
$SkillCount = (Get-ChildItem -Path $GlobalSkillsPath -Directory).Count
Write-Host "`n🎉 Instalação concluída!" -ForegroundColor Green
Write-Host "📊 Total de skills: $SkillCount" -ForegroundColor Cyan
Write-Host "📍 Local: $GlobalSkillsPath" -ForegroundColor Cyan
Write-Host "`n💡 Como usar:" -ForegroundColor Yellow
Write-Host '   "Use @brainstorming para planejar"' -ForegroundColor White
Write-Host '   "Execute @vulnerability-scanner"' -ForegroundColor White
```

### Executar Instalação

```powershell
# Navegar até .agent/scripts
cd .agent\scripts

# Executar script
.\install-skills.ps1
```

---

## 📦 OPÇÃO 4: Script Bash (Linux/Mac)

```bash
#!/bin/bash
# install-skills.sh - Instalação Global de Skills Antigravity

set -e

GLOBAL_SKILLS="$HOME/.antigravity/skills"
PROJECT_SKILLS=".agent/skills"
AWESOME_SKILLS=".agent/antigravity-awesome-skills-main/skills"

echo "🌍 Instalando Skills Antigravity Globalmente..."

# Criar diretório global
mkdir -p "$GLOBAL_SKILLS"
echo "✅ Diretório criado: $GLOBAL_SKILLS"

# Copiar skills locais
if [ -d "$PROJECT_SKILLS" ]; then
    echo "📦 Copiando skills locais..."
    cp -r "$PROJECT_SKILLS"/* "$GLOBAL_SKILLS/"
    echo "✅ Skills locais copiadas"
fi

# Copiar antigravity-awesome-skills
if [ -d "$AWESOME_SKILLS" ]; then
    echo "📦 Copiando antigravity-awesome-skills (1272+ skills)..."
    cp -r "$AWESOME_SKILLS"/* "$GLOBAL_SKILLS/"
    echo "✅ 1272+ skills copiadas"
fi

# Exportar variável de ambiente
export ANTIGRAVITY_SKILLS="$GLOBAL_SKILLS"
echo "export ANTIGRAVITY_SKILLS=\"$GLOBAL_SKILLS\"" >> ~/.bashrc

# Verificar instalação
SKILL_COUNT=$(find "$GLOBAL_SKILLS" -maxdepth 1 -type d | wc -l)
echo ""
echo "🎉 Instalação concluída!"
echo "📊 Total de skills: $SKILL_COUNT"
echo "📍 Local: $GLOBAL_SKILLS"
echo ""
echo "💡 Como usar:"
echo '   "Use @brainstorming para planejar"'
echo '   "Execute @vulnerability-scanner"'
```

---

## 🔧 CONFIGURAÇÃO EM DIFERENTES AGENTES

### Claude Code

**Arquivo:** `~/.claude/settings.json` ou `.claude/settings.local.json`

```json
{
  "skills": {
    "global_path": "~/.antigravity/skills",
    "auto_load": true,
    "skills": [
      "brainstorming",
      "clean-code",
      "vulnerability-scanner",
      "mysword-bible-engine"
    ]
  }
}
```

### Gemini CLI

**Arquivo:** `~/.gemini/settings.json`

```json
{
  "antigravity": {
    "skills_path": "~/.antigravity/skills",
    "enabled": true
  }
}
```

### Cursor IDE

**Configurações → AI → Skills:**

```
Path: C:\Users\Jose Menezes\.antigravity\skills
Auto-load: true
```

### VS Code + Copilot

**`.vscode/settings.json`:**

```json
{
  "github.copilot.chat.skills": {
    "globalPath": "${home}/.antigravity/skills",
    "enabled": ["brainstorming", "clean-code", "architecture"]
  }
}
```

---

## 🎯 SKILLS ESSENCIAIS PARA INSTALAR PRIMEIRO

### 🏆 Top 10 Essenciais

```bash
# Lista de skills essenciais para copiar
$ESSENTIAL_SKILLS = @(
    "brainstorming",
    "clean-code",
    "architecture",
    "vulnerability-scanner",
    "lint-and-validate",
    "testing-patterns",
    "documentation-templates",
    "deployment-procedures",
    "mysword-bible-engine",
    "android-kotlin-specialist"
)

foreach ($skill in $ESSENTIAL_SKILLS) {
    Copy-Item ".agent\skills\$skill" "$GlobalSkillsPath\" -Recurse -Force
}
```

---

## 📊 VERIFICAÇÃO PÓS-INSTALAÇÃO

### Script de Verificação `verify-install.ps1`

```powershell
#!/usr/bin/env pwsh
# verify-install.ps1 - Verifica instalação das skills

$GlobalSkillsPath = "$env:USERPROFILE\.antigravity\skills"

Write-Host "🔍 Verificando Instalação..." -ForegroundColor Cyan

# Verificar diretório
if (-not (Test-Path $GlobalSkillsPath)) {
    Write-Host "❌ Diretório não encontrado: $GlobalSkillsPath" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Diretório encontrado" -ForegroundColor Green

# Contar skills
$SkillCount = (Get-ChildItem -Path $GlobalSkillsPath -Directory).Count
Write-Host "📊 Total de skills: $SkillCount" -ForegroundColor Cyan

# Verificar skills essenciais
$EssentialSkills = @("brainstorming", "clean-code", "vulnerability-scanner", "lint-and-validate")
Write-Host "`n🎯 Skills Essenciais:" -ForegroundColor Yellow

foreach ($skill in $EssentialSkills) {
    if (Test-Path "$GlobalSkillsPath\$skill") {
        Write-Host "   ✅ $skill" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $skill (faltando)" -ForegroundColor Red
    }
}

# Listar todas as skills
Write-Host "`n📚 Todas as Skills (primeiras 20):" -ForegroundColor Yellow
Get-ChildItem -Path $GlobalSkillsPath -Directory | Select-Object -First 20 | ForEach-Object {
    Write-Host "   • $($_.Name)" -ForegroundColor White
}

Write-Host "`n✅ Verificação concluída!" -ForegroundColor Green
```

---

## 🔄 ATUALIZAÇÃO DE SKILLS

### Atualizar Skills Locais → Global

```powershell
# Windows
robocopy .agent\skills %USERPROFILE%\.antigravity\skills /E /UPDATE /NFL /NDL

# Linux/Mac
rsync -av --update .agent/skills/ ~/.antigravity/skills/
```

### Atualizar do Repositório Original

```bash
# Clonar/atualizar antigravity-awesome-skills
cd .agent
git clone https://github.com/sickn33/antigravity-awesome-skills.git
# ou se já existe:
cd antigravity-awesome-skills && git pull
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Instalação Global**: Concluída (esta seção)
2. 📖 **Como Requisitar**: Ver `COMO_REQUISITAR.md`
3. 🤖 **Agente Autônomo**: Ver `AGENTE_AUTONOMO.md`

---

## 📖 REFERÊNCIAS

- [SKILLS_INVENTORY.md](SKILLS_INVENTORY.md) - Inventário completo
- [antigravity-awesome-skills README](antigravity-awesome-skills-main/README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura do sistema
