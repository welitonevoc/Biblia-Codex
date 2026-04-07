# 🤖 Agente Autônomo - Sistema de Ações Automáticas

> **Transforme skills em agentes autônomos que executam ações sem intervenção manual**

---

## 📚 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Configuração](#configuração)
4. [Scripts de Automação](#scripts-de-automação)
5. [Workflows Autônomos](#workflows-autônomos)
6. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 VISÃO GERAL

### O Que é Agente Autônomo?

Um **Agente Autônomo** é uma configuração que permite que skills sejam executadas automaticamente quando certos gatilhos são detectados, sem necessidade de comando manual.

### Níveis de Autonomia

| Nível | Descrição | Exemplo |
|-------|-----------|---------|
| **N1 - Manual** | Usuário executa skill manualmente | `"Execute @vulnerability-scanner"` |
| **N2 - Sugerido** | Agente sugere skill, usuário aprova | `"Sugiro usar @vulnerability-scanner. Aprova?"` |
| **N3 - Condicional** | Executa automaticamente se condições atendidas | `Se código novo → executa @lint-and-validate` |
| **N4 - Automático** | Executa sempre que gatilho detectado | `Commit → auto lint + test + security scan` |
| **N5 - Autônomo** | Agente decide quais skills usar | `Agente analisa e executa skills necessárias` |

---

## 🏗️ ARQUITETURA DO SISTEMA

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENTE AUTÔNOMO                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   GATILHOS    │  │   DECISOR     │  │   EXECUTOR    │   │
│  │  (Triggers)   │→ │  (Dispatcher) │→ │  (Runner)     │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│         ↑                  ↑                  ↑              │
│         │                  │                  │              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   EVENTOS     │  │   REGRAS      │  │   SKILLS      │   │
│  │  - Git        │  │  - Routing    │  │  - Scripts    │   │
│  │  - File       │  │  - Priority   │  │  - Commands   │   │
│  │  - Time       │  │  - Context    │  │  - Agents     │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Execução

```
1. Evento Detectado (ex: git commit)
         ↓
2. Gatilho Ativado (ex: pre-commit)
         ↓
3. Decisor Analisa Contexto
         ↓
4. Skills Selecionadas (ex: lint + test)
         ↓
5. Executor Roda Scripts
         ↓
6. Relatório Gerado
```

---

## ⚙️ CONFIGURAÇÃO

### Arquivo de Configuração: `autonomous_config.json`

**Local:** `.agent/autonomous_config.json`

```json
{
  "version": "1.0.0",
  "enabled": true,
  "autonomy_level": "N4",
  
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "skills": ["lint-and-validate", "code-review-checklist"],
        "block_on_failure": true
      },
      "pre-push": {
        "enabled": true,
        "skills": ["vulnerability-scanner", "testing-patterns"],
        "block_on_failure": true
      },
      "post-merge": {
        "enabled": false,
        "skills": ["documentation-templates"],
        "block_on_failure": false
      }
    },
    
    "file": {
      "*.kt": {
        "on_save": {
          "skills": ["android-kotlin-specialist"],
          "auto_fix": true
        },
        "on_commit": {
          "skills": ["lint-and-validate"],
          "auto_fix": false
        }
      },
      "*.sqlite3": {
        "on_commit": {
          "skills": ["mysword-bible-engine", "mysword-format-parser"],
          "validate_schema": true
        }
      },
      "*.gbf": {
        "on_commit": {
          "skills": ["mysword-format-parser"],
          "auto_convert": true
        }
      }
    },
    
    "time": {
      "daily": {
        "enabled": true,
        "time": "09:00",
        "timezone": "America/Sao_Paulo",
        "skills": ["session_manager.py status"],
        "report": true
      },
      "weekly": {
        "enabled": true,
        "day": "monday",
        "time": "08:00",
        "skills": ["verify_all.py"],
        "report": true
      }
    },
    
    "manual": {
      "force_run": {
        "command": "autonomous --force",
        "skills": ["verify_all.py"],
        "override_blocks": true
      }
    }
  },
  
  "rules": {
    "priority": {
      "security": 1,
      "test": 2,
      "lint": 3,
      "docs": 4
    },
    
    "conditions": {
      "only_on_branch": ["main", "develop"],
      "skip_if_ci": true,
      "max_execution_time": 300
    },
    
    "notifications": {
      "on_success": false,
      "on_failure": true,
      "channels": ["console", "file"]
    }
  },
  
  "scripts": {
    "lint": "python .agent/skills/lint-and-validate/scripts/lint_runner.py",
    "security": "python .agent/skills/vulnerability-scanner/scripts/security_scan.py",
    "test": "python .agent/skills/webapp-testing/scripts/playwright_runner.py",
    "status": "python .agent/scripts/session_manager.py status",
    "verify": "python .agent/scripts/verify_all.py"
  },
  
  "agents": {
    "orchestrator": {
      "enabled": true,
      "auto_invoke": true,
      "min_agents": 3
    },
    "specialists": [
      "android-kotlin-specialist",
      "backend-specialist",
      "frontend-specialist",
      "test-engineer",
      "security-auditor"
    ]
  }
}
```

---

## 🛠️ SCRIPTS DE AUTOMAÇÃO

### 1. Script Principal: `autonomous_agent.py`

**Local:** `.agent/scripts/autonomous_agent.py`

```python
#!/usr/bin/env python3
"""
Autonomous Agent - Antigravity Kit
===================================
Executa skills automaticamente baseado em gatilhos configurados.

Usage:
    python .agent/scripts/autonomous_agent.py watch      # Modo observação
    python .agent/scripts/autonomous_agent.py run        # Executa triggers manuais
    python .agent/scripts/autonomous_agent.py status     # Status do agente
    python .agent/scripts/autonomous_agent.py force      # Força execução completa
"""

import os
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

class AutonomousAgent:
    def __init__(self, config_path: str = ".agent/autonomous_config.json"):
        self.config_path = Path(config_path)
        self.config = self.load_config()
        self.project_root = Path.cwd()
        
    def load_config(self) -> Dict[str, Any]:
        """Carrega configuração do agente autônomo"""
        if not self.config_path.exists():
            print(f"❌ Config não encontrado: {self.config_path}")
            sys.exit(1)
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def execute_skill(self, skill_name: str, script: str = None) -> bool:
        """Executa uma skill específica"""
        print(f"\n🤖 Executando skill: {skill_name}")
        
        if script:
            try:
                result = subprocess.run(
                    script.split(),
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    timeout=self.config['rules']['conditions'].get('max_execution_time', 300)
                )
                
                if result.returncode == 0:
                    print(f"✅ {skill_name}: SUCESSO")
                    return True
                else:
                    print(f"❌ {skill_name}: FALHOU")
                    print(result.stdout)
                    print(result.stderr)
                    return False
                    
            except subprocess.TimeoutExpired:
                print(f"⏱️ {skill_name}: TIMEOUT")
                return False
            except Exception as e:
                print(f"❌ {skill_name}: ERRO - {str(e)}")
                return False
        else:
            print(f"⚠️ {skill_name}: Sem script definido (skill de instrução)")
            return True
    
    def run_git_trigger(self, trigger_name: str) -> bool:
        """Executa triggers de git"""
        git_config = self.config['triggers']['git'].get(trigger_name)
        
        if not git_config or not git_config['enabled']:
            print(f"⏭️ Trigger {trigger_name} desabilitado")
            return True
        
        print(f"\n🔔 Trigger Git: {trigger_name}")
        
        all_passed = True
        for skill in git_config['skills']:
            script = self.config['scripts'].get(skill.split('-')[0])
            if not self.execute_skill(skill, script):
                all_passed = False
                if git_config['block_on_failure']:
                    print(f"🛑 Bloqueando devido a falha em {skill}")
                    return False
        
        return all_passed
    
    def run_file_trigger(self, file_path: str, event: str) -> bool:
        """Executa triggers baseados em arquivo"""
        file_config = self.config['triggers']['file'].get(f"*{Path(file_path).suffix}")
        
        if not file_config or event not in file_config:
            return True
        
        config = file_config[event]
        print(f"\n📄 Trigger Arquivo: {file_path} ({event})")
        
        for skill in config['skills']:
            script = self.config['scripts'].get(skill.split('-')[0])
            self.execute_skill(skill, script)
        
        return True
    
    def run_time_trigger(self, trigger_name: str) -> bool:
        """Executa triggers baseados em tempo"""
        time_config = self.config['triggers']['time'].get(trigger_name)
        
        if not time_config or not time_config['enabled']:
            return True
        
        print(f"\n⏰ Trigger Tempo: {trigger_name}")
        
        for skill in time_config['skills']:
            script = self.config['scripts'].get(skill)
            self.execute_skill(skill, script)
        
        return True
    
    def run_all_triggers(self, force: bool = False) -> bool:
        """Executa todos os triggers"""
        print("\n" + "="*60)
        print("🤖 AGENTE AUTÔNOMO - Execução Completa")
        print("="*60)
        
        all_passed = True
        
        # Git triggers (simulado)
        for trigger in ['pre-commit', 'pre-push']:
            if not self.run_git_trigger(trigger):
                all_passed = False
        
        # Time triggers
        for trigger in ['daily', 'weekly']:
            if not self.run_time_trigger(trigger):
                all_passed = False
        
        print("\n" + "="*60)
        if all_passed:
            print("✅ Todas as verificações passaram!")
        else:
            print("❌ Algumas verificações falharam!")
        print("="*60)
        
        return all_passed
    
    def status(self):
        """Mostra status do agente autônomo"""
        print("\n" + "="*60)
        print("🤖 STATUS DO AGENTE AUTÔNOMO")
        print("="*60)
        
        print(f"\n📊 Configuração:")
        print(f"   Enabled: {self.config['enabled']}")
        print(f"   Nível de Autonomia: {self.config['autonomy_level']}")
        
        print(f"\n🔔 Triggers Ativos:")
        for category, triggers in self.config['triggers'].items():
            print(f"\n   {category.upper()}:")
            for trigger, config in triggers.items():
                if isinstance(config, dict) and 'enabled' in config:
                    status = "✅" if config['enabled'] else "❌"
                    print(f"   {status} {trigger}")
        
        print(f"\n🛠️ Scripts Configurados:")
        for name, script in self.config['scripts'].items():
            print(f"   • {name}: {script}")
        
        print("\n" + "="*60)

def main():
    if len(sys.argv) < 2:
        print("Usage: python autonomous_agent.py [watch|run|status|force]")
        sys.exit(1)
    
    agent = AutonomousAgent()
    command = sys.argv[1]
    
    if command == "status":
        agent.status()
    elif command == "run":
        agent.run_all_triggers()
    elif command == "force":
        agent.run_all_triggers(force=True)
    elif command == "watch":
        print("👁️ Modo observação (implementar file watcher)")
        # Implementar file watcher aqui
    else:
        print(f"Comando desconhecido: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

### 2. Script de Instalação: `install_autonomous.ps1`

**Local:** `.agent/scripts/install_autonomous.ps1`

```powershell
#!/usr/bin/env pwsh
# install_autonomous.ps1 - Instala Sistema de Agente Autônomo

$ErrorActionPreference = "Stop"

Write-Host "🤖 Instalando Sistema de Agente Autônomo..." -ForegroundColor Cyan

# 1. Copiar arquivo de configuração
$ConfigSource = ".agent\autonomous_config.json"
$ConfigDest = "$env:USERPROFILE\.antigravity\autonomous_config.json"

if (Test-Path $ConfigSource) {
    Copy-Item -Path $ConfigSource -Destination $ConfigDest -Force
    Write-Host "✅ Configuração instalada: $ConfigDest" -ForegroundColor Green
}

# 2. Configurar hooks do Git
Write-Host "`n🔧 Configurando Git Hooks..." -ForegroundColor Yellow

$GitHooksDir = ".git\hooks"
if (-not (Test-Path $GitHooksDir)) {
    New-Item -ItemType Directory -Path $GitHooksDir | Out-Null
}

# Pre-commit hook
$PreCommitHook = @"
#!/bin/sh
# Git Pre-Commit Hook - Antigravity Autonomous Agent

echo "🤖 Running Autonomous Agent (pre-commit)..."
python .agent/scripts/autonomous_agent.py run

# Check exit code
if [ `$? -ne 0 ]; then
    echo "❌ Pre-commit checks failed!"
    exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
"@

Set-Content -Path "$GitHooksDir\pre-commit" -Value $PreCommitHook
Write-Host "✅ Pre-commit hook instalado" -ForegroundColor Green

# Pre-push hook
$PrePushHook = @"
#!/bin/sh
# Git Pre-Push Hook - Antigravity Autonomous Agent

echo "🤖 Running Autonomous Agent (pre-push)..."
python .agent/scripts/autonomous_agent.py force

# Check exit code
if [ `$? -ne 0 ]; then
    echo "❌ Pre-push checks failed!"
    exit 1
fi

echo "✅ Pre-push checks passed!"
exit 0
"@

Set-Content -Path "$GitHooksDir\pre-push" -Value $PrePushHook
Write-Host "✅ Pre-push hook instalado" -ForegroundColor Green

# 3. Configurar Task Scheduler (Windows)
Write-Host "`n⏰ Configurando Task Scheduler..." -ForegroundColor Yellow

$TaskName = "Antigravity_Daily_Check"
$ScriptPath = "python $(Get-Location)\.agent\scripts\autonomous_agent.py run"

# Criar scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `"$ScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "✅ Task Scheduler configurado: $TaskName" -ForegroundColor Green

Write-Host "`n🎉 Instalação do Agente Autônomo concluída!" -ForegroundColor Green
Write-Host "`n💡 Uso:" -ForegroundColor Yellow
Write-Host "   python .agent/scripts/autonomous_agent.py status   # Ver status"
Write-Host "   python .agent/scripts/autonomous_agent.py run      # Executar checks"
Write-Host "   python .agent/scripts/autonomous_agent.py force    # Forçar execução"
```

---

## 🔄 WORKFLOWS AUTÔNOMOS

### Workflow 1: Pre-Commit Automático

**Arquivo:** `.agent/workflows/auto-pre-commit.md`

```markdown
---
name: auto-pre-commit
description: Executa verificações automáticas antes de cada commit
triggers: git.pre-commit
---

# Workflow: Pre-Commit Automático

## Gatilho
- **Evento:** `git commit`
- **Condição:** Sempre que houver commit

## Skills Executadas

### 1. Lint-and-Validate
```bash
python .agent/skills/lint-and-validate/scripts/lint_runner.py .
```

**Ação:** Verifica linting, formatação, imports

**Bloqueia se:** Falhar

### 2. Code-Review-Checklist
```bash
# Verificação automática de padrões
python .agent/scripts/checklist.py .
```

**Ação:** Revisão de código automatizada

**Bloqueia se:** Issues críticos encontrados

### 3. Security-Scan (Opcional)
```bash
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
```

**Ação:** Scan de segurança rápido

**Bloqueia se:** Vulnerabilidades críticas

## Fluxo

```
git commit → Pre-Commit Hook → autonomous_agent.py run
                                    ↓
                            1. lint-and-validate
                            2. code-review-checklist
                            3. security-scan (opcional)
                                    ↓
                              ✅ Pass → Commit
                              ❌ Fail → Abort
```

## Configuração

Editar `.agent/autonomous_config.json`:

```json
{
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "skills": ["lint-and-validate", "code-review-checklist"],
        "block_on_failure": true
      }
    }
  }
}
```
```

---

### Workflow 2: CI/CD Autônomo

**Arquivo:** `.agent/workflows/auto-ci-cd.md`

```markdown
---
name: auto-ci-cd
description: Pipeline de CI/CD com execução autônoma de skills
triggers: git.push, pull_request
---

# Workflow: CI/CD Autônomo

## Gatilhos
- Push para `main` ou `develop`
- Pull Request criado/atualizado

## Stages

### Stage 1: Validação (Obrigatório)

```yaml
stages:
  - name: validation
    skills:
      - lint-and-validate
      - code-review-checklist
    block: true
```

### Stage 2: Testes (Obrigatório)

```yaml
stages:
  - name: tests
    skills:
      - testing-patterns
      - webapp-testing
    block: true
```

### Stage 3: Segurança (Obrigatório)

```yaml
stages:
  - name: security
    skills:
      - vulnerability-scanner
    block: true
```

### Stage 4: Performance (Opcional)

```yaml
stages:
  - name: performance
    skills:
      - performance-profiling
    block: false
```

### Stage 5: Deploy (Automático se stages anteriores passarem)

```yaml
stages:
  - name: deploy
    skills:
      - deployment-procedures
    condition: all_previous_passed
```

## GitHub Actions Integration

**.github/workflows/autonomous-ci.yml:**

```yaml
name: Autonomous CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  autonomous-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Dependencies
        run: pip install -r requirements.txt
      
      - name: Run Autonomous Agent
        run: python .agent/scripts/autonomous_agent.py force
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: autonomous-report
          path: .agent/reports/
```
```

---

### Workflow 3: Session Manager Autônomo

**Arquivo:** `.agent/workflows/auto-session.md`

```markdown
---
name: auto-session
description: Gerencia sessões de desenvolvimento automaticamente
triggers: time.daily, project.open
---

# Workflow: Session Manager Autônomo

## Gatilhos

### Diário (9:00 AM)
- Executa status do projeto
- Gera relatório de atividades

### Ao Abrir Projeto
- Detecta mudanças desde última sessão
- Sugere tarefas pendentes

## Skills Executadas

### Session Status
```bash
python .agent/scripts/session_manager.py status
```

### Verify Changes
```bash
git diff HEAD
```

### Generate Report
```bash
python .agent/scripts/verify_all.py --report
```

## Relatório de Sessão

```markdown
## 📊 Relatório de Sessão - {data}

### 📁 Projeto
- Nome: {project_name}
- Path: {project_path}
- Stack: {tech_stack}

### 🔄 Mudanças desde última sessão
- Arquivos modificados: {count}
- Commits: {count}
- Issues resolvidos: {count}

### ✅ Verificações
- [ ] Lint: Pass/Fail
- [ ] Tests: Pass/Fail
- [ ] Security: Pass/Fail

### 📋 Tarefas Sugeridas
1. {task_1}
2. {task_2}
3. {task_3}
```
```

---

## 🎯 EXEMPLOS PRÁTICOS

### Exemplo 1: Configuração Mínima

**.agent/autonomous_config.json:**

```json
{
  "enabled": true,
  "autonomy_level": "N3",
  
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "skills": ["lint-and-validate"],
        "block_on_failure": true
      }
    }
  },
  
  "scripts": {
    "lint": "python .agent/skills/lint-and-validate/scripts/lint_runner.py"
  }
}
```

**Instalação:**

```bash
# Instalar hooks do git
python .agent/scripts/autonomous_agent.py install

# Verificar status
python .agent/scripts/autonomous_agent.py status

# Executar manualmente
python .agent/scripts/autonomous_agent.py run
```

---

### Exemplo 2: Configuração Completa

**.agent/autonomous_config.json:**

```json
{
  "enabled": true,
  "autonomy_level": "N4",
  
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "skills": ["lint-and-validate", "code-review-checklist"],
        "block_on_failure": true
      },
      "pre-push": {
        "enabled": true,
        "skills": ["vulnerability-scanner", "testing-patterns"],
        "block_on_failure": true
      }
    },
    "time": {
      "daily": {
        "enabled": true,
        "time": "09:00",
        "skills": ["session_manager.py status"],
        "report": true
      },
      "weekly": {
        "enabled": true,
        "day": "monday",
        "time": "08:00",
        "skills": ["verify_all.py"],
        "report": true
      }
    },
    "file": {
      "*.kt": {
        "on_save": {
          "skills": ["android-kotlin-specialist"],
          "auto_fix": true
        }
      }
    }
  },
  
  "scripts": {
    "lint": "python .agent/skills/lint-and-validate/scripts/lint_runner.py",
    "security": "python .agent/skills/vulnerability-scanner/scripts/security_scan.py",
    "test": "python .agent/skills/webapp-testing/scripts/playwright_runner.py",
    "status": "python .agent/scripts/session_manager.py status",
    "verify": "python .agent/scripts/verify_all.py"
  },
  
  "agents": {
    "orchestrator": {
      "enabled": true,
      "auto_invoke": true,
      "min_agents": 3
    }
  }
}
```

---

### Exemplo 3: Execução Manual

```bash
# Verificar status do agente
python .agent/scripts/autonomous_agent.py status

# Executar todas as verificações
python .agent/scripts/autonomous_agent.py run

# Forçar execução completa (ignora blocks)
python .agent/scripts/autonomous_agent.py force

# Modo observação (watch files)
python .agent/scripts/autonomous_agent.py watch
```

---

### Exemplo 4: Integração com VS Code

**.vscode/tasks.json:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Autonomous Agent: Status",
      "type": "shell",
      "command": "python .agent/scripts/autonomous_agent.py status",
      "problemMatcher": [],
      "group": "build"
    },
    {
      "label": "Autonomous Agent: Run Checks",
      "type": "shell",
      "command": "python .agent/scripts/autonomous_agent.py run",
      "problemMatcher": [],
      "group": "test"
    },
    {
      "label": "Autonomous Agent: Force Run",
      "type": "shell",
      "command": "python .agent/scripts/autonomous_agent.py force",
      "problemMatcher": [],
      "group": "test"
    }
  ]
}
```

---

## 📊 NÍVEIS DE AUTONOMIA - Detalhamento

### N1 - Manual

```json
{
  "autonomy_level": "N1",
  "triggers": {}
}
```

**Comportamento:** Nenhuma execução automática. Usuário deve executar skills manualmente.

---

### N2 - Sugerido

```json
{
  "autonomy_level": "N2",
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "suggest": true,
        "skills": ["lint-and-validate"]
      }
    }
  }
}
```

**Comportamento:** Agente sugere skill, aguarda aprovação do usuário.

---

### N3 - Condicional

```json
{
  "autonomy_level": "N3",
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "auto_execute": true,
        "conditions": {
          "only_if_new_files": true
        },
        "skills": ["lint-and-validate"]
      }
    }
  }
}
```

**Comportamento:** Executa automaticamente se condições forem atendidas.

---

### N4 - Automático

```json
{
  "autonomy_level": "N4",
  "triggers": {
    "git": {
      "pre-commit": {
        "enabled": true,
        "auto_execute": true,
        "block_on_failure": true,
        "skills": ["lint-and-validate", "code-review-checklist"]
      }
    }
  }
}
```

**Comportamento:** Executa sempre que gatilho é ativado.

---

### N5 - Autônomo

```json
{
  "autonomy_level": "N5",
  "agents": {
    "orchestrator": {
      "enabled": true,
      "auto_invoke": true,
      "decision_making": true
    }
  }
}
```

**Comportamento:** Agente decide quais skills usar baseado no contexto.

---

## 📖 PRÓXIMOS PASSOS

1. ✅ **Inventário**: Ver `SKILLS_INVENTORY.md`
2. ✅ **Instalação**: Ver `INSTALACAO_GLOBAL.md`
3. ✅ **Como Requisitar**: Ver `COMO_REQUISITAR.md`
4. ✅ **Agente Autônomo**: Concluído (esta seção)
5. 🛠️ **Scripts de Automação**: Próxima seção

---

## 📚 REFERÊNCIAS

- [SKILLS_INVENTORY.md](SKILLS_INVENTORY.md)
- [INSTALACAO_GLOBAL.md](INSTALACAO_GLOBAL.md)
- [COMO_REQUISITAR.md](COMO_REQUISITAR.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [antigravity-awesome-skills - loki-mode](antigravity-awesome-skills-main/skills/loki-mode/)
