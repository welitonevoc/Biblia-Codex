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
    python .agent/scripts/autonomous_agent.py install    # Instala git hooks
"""

import os
import json
import subprocess
import sys
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, agent):
        self.agent = agent
    
    def on_modified(self, event):
        if not event.is_directory:
            print(f"\n📂 Arquivo modificado: {event.src_path}")
            self.agent.run_file_trigger(event.src_path, "on_save")

class AutonomousAgent:
    def __init__(self, config_path: str = ".agent/autonomous_config.json"):
        self.config_path = Path(config_path)
        self.config = self.load_config()
        self.project_root = Path.cwd()
        self.reports_dir = self.project_root / ".agent" / "reports"
        self.reports_dir.mkdir(exist_ok=True)
        
    def load_config(self) -> Dict[str, Any]:
        """Carrega configuração do agente autônomo"""
        if not self.config_path.exists():
            print(f"❌ Config não encontrado: {self.config_path}")
            print(f"💡 Dica: Execute 'python {__file__} init' para criar configuração inicial")
            sys.exit(1)
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def execute_skill(self, skill_name: str, script: Optional[str] = None) -> bool:
        """Executa uma skill específica"""
        print(f"\nExecutando skill: {skill_name}")
        
        if script:
            try:
                result = subprocess.run(
                    script.split(),
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    timeout=self.config['rules']['conditions'].get('max_execution_time', 300)
                )
                
                success = result.returncode == 0
                
                if success:
                    print(f"OK {skill_name}: SUCESSO")
                else:
                    print(f"NOK {skill_name}: FALHOU")
                    if result.stdout:
                        print("STDOUT:", result.stdout[:500])
                    if result.stderr:
                        print("STDERR:", result.stderr[:500])
                    
                return success
                    
            except subprocess.TimeoutExpired:
                print(f"TIMEOUT {skill_name}: (>{self.config['rules']['conditions'].get('max_execution_time', 300)}s)")
                return False
            except FileNotFoundError:
                print(f"ERRO {skill_name}: Script não encontrado")
                return False
            except Exception as e:
                print(f"ERRO {skill_name}: - {str(e)}")
                return False
        else:
            print(f"AVISO {skill_name}: Skill de instrução (sem script)")
            return True
    
    def run_git_trigger(self, trigger_name: str) -> bool:
        """Executa triggers de git"""
        git_config = self.config.get('triggers', {}).get('git', {}).get(trigger_name)
        
        if not git_config or not git_config.get('enabled', False):
            print(f"⏭️ Trigger {trigger_name} desabilitado")
            return True
        
        print(f"\nTrigger Git: {trigger_name}")
        
        results = {}
        all_passed = True
        for skill in git_config.get('skills', []):
            script = self.config.get('scripts', {}).get(skill.split('-')[0])
            passed = self.execute_skill(skill, script)
            results[skill] = passed
            if not passed:
                all_passed = False
                if git_config.get('block_on_failure', False):
                    print(f"🛑 Bloqueando devido a falha em {skill}")
                    # Gera relatório antes de bloquear
                    if self.config.get('rules', {}).get('notifications', {}).get('on_failure', False):
                        self.generate_report(results)
                    return False
        
        if not all_passed and self.config.get('rules', {}).get('notifications', {}).get('on_failure', False):
            self.generate_report(results)
            
        return all_passed
    
    def run_file_trigger(self, file_path: str, event: str) -> bool:
        """Executa triggers baseados em arquivo"""
        file_config = self.config.get('triggers', {}).get('file', {}).get(f"*{Path(file_path).suffix}")
        
        if not file_config or event not in file_config:
            return True
        
        config = file_config[event]
        print(f"\n📄 Trigger Arquivo: {file_path} ({event})")
        
        results = {}
        all_passed = True
        for skill in config.get('skills', []):
            script = self.config.get('scripts', {}).get(skill.split('-')[0])
            passed = self.execute_skill(skill, script)
            results[skill] = passed
            if not passed:
                if config.get('auto_fix', False):
                    print(f"🔧 Tentando auto-fix para {skill}")
                else:
                    all_passed = False
        
        if not all_passed and self.config.get('rules', {}).get('notifications', {}).get('on_failure', False):
            self.generate_report(results)
        
        return all_passed
    
    def run_time_trigger(self, trigger_name: str) -> bool:
        """Executa triggers baseados em tempo"""
        time_config = self.config.get('triggers', {}).get('time', {}).get(trigger_name)
        
        if not time_config or not time_config.get('enabled', False):
            return True
        
        print(f"\n⏰ Trigger Tempo: {trigger_name}")
        
        results = {}
        all_passed = True
        for skill in time_config.get('skills', []):
            script = self.config.get('scripts', {}).get(skill)
            passed = self.execute_skill(skill, script)
            results[skill] = passed
            if not passed:
                all_passed = False
        
        if not all_passed and self.config.get('rules', {}).get('notifications', {}).get('on_failure', False):
            self.generate_report(results)
            
        return all_passed
    
    def generate_report(self, results: Dict[str, bool]) -> str:
        """Gera relatório de execução"""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        report_path = self.reports_dir / f"autonomous_report_{timestamp}.md"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# 🤖 Relatório do Agente Autônomo\n\n")
            f.write(f"**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
            
            f.write("## 📊 Resultados\n\n")
            f.write("| Skill | Status |\n")
            f.write("|-------|--------|\n")
            
            for skill, passed in results.items():
                status = "✅" if passed else "❌"
                f.write(f"| {skill} | {status} |\n")
            
            f.write("\n## 📈 Resumo\n\n")
            total = len(results)
            passed = sum(1 for v in results.values() if v)
            f.write(f"- Total: {total}\n")
            f.write(f"- Aprovados: {passed}\n")
            f.write(f"- Falharam: {total - passed}\n")
            f.write(f"- Taxa de sucesso: {(passed/total*100):.1f}%\n")
        
        return str(report_path)
    
    def run_all_triggers(self, force: bool = False) -> bool:
        """Executa todos os triggers"""
        print("\n" + "="*60)
        print("AGENTE AUTÔNOMO - Execução Completa")
        print("="*60)
        
        results = {}
        all_passed = True
        
        # Git triggers (simulado para teste)
        for trigger in ['pre-commit', 'pre-push']:
            trigger_config = self.config.get('triggers', {}).get('git', {}).get(trigger)
            if trigger_config and trigger_config.get('enabled', False):
                if not self.run_git_trigger(trigger):
                    all_passed = False
                    results[f'git:{trigger}'] = False
                else:
                    results[f'git:{trigger}'] = True
        
        # Time triggers
        for trigger in ['daily', 'weekly']:
            trigger_config = self.config.get('triggers', {}).get('time', {}).get(trigger)
            if trigger_config and trigger_config.get('enabled', False):
                if not self.run_time_trigger(trigger):
                    all_passed = False
                    results[f'time:{trigger}'] = False
                else:
                    results[f'time:{trigger}'] = True
        
        # Gerar relatório
        if results:
            report_path = self.generate_report(results)
            print(f"\nRelatório gerado: {report_path}")
        
        print("\n" + "="*60)
        if all_passed:
            print("OK Todas as verificações passaram!")
        else:
            print("NOK Algumas verificações falharam!")
        print("="*60)
        
        return all_passed
    
    def status(self):
        """Mostra status do agente autônomo"""
        print("\n" + "="*60)
        print("STATUS DO AGENTE AUTÔNOMO")
        print("="*60)
        
        print(f"\nConfiguração:")
        print(f"   Enabled: {self.config.get('enabled', False)}")
        print(f"   Nível de Autonomia: {self.config.get('autonomy_level', 'N1')}")
        
        print(f"\nTriggers Ativos:")
        for category, triggers in self.config.get('triggers', {}).items():
            print(f"\n   {category.upper()}:")
            for trigger, config in triggers.items():
                if isinstance(config, dict) and 'enabled' in config:
                    status = "OK" if config['enabled'] else "NOK"
                    block = "bloqueia" if config.get('block_on_failure', False) else ""
                    print(f"   {status} {trigger} {block}")
        
        print(f"\nScripts Configurados:")
        for name, script in self.config.get('scripts', {}).items():
            print(f"   • {name}: {script}")
        
        print(f"\nAgentes:")
        agents_config = self.config.get('agents', {})
        if agents_config:
            for agent, config in agents_config.items():
                if isinstance(config, dict):
                    status = "OK" if config.get('enabled', False) else "NOK"
                    auto = "auto" if config.get('auto_invoke', False) else "manual"
                    print(f"   {status} {agent} ({auto})")
        
        print("\n" + "="*60)
    
    def install_hooks(self):
        """Instala git hooks"""
        print("\n🔧 Instalando Git Hooks...")
        
        git_hooks_dir = self.project_root / ".git" / "hooks"
        git_hooks_dir.mkdir(exist_ok=True)
        
        # Pre-commit hook
        pre_commit_hook = """#!/bin/sh
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
"""
        
        pre_commit_path = git_hooks_dir / "pre-commit"
        with open(pre_commit_path, 'w') as f:
            f.write(pre_commit_hook)
        pre_commit_path.chmod(0o755)
        print(f"✅ Pre-commit hook instalado: {pre_commit_path}")
        
        # Pre-push hook
        pre_push_hook = """#!/bin/sh
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
"""
        
        pre_push_path = git_hooks_dir / "pre-push"
        with open(pre_push_path, 'w') as f:
            f.write(pre_push_hook)
        pre_push_path.chmod(0o755)
        print(f"✅ Pre-push hook instalado: {pre_push_path}")
        
        print("\n🎉 Git hooks instalados com sucesso!")
    
    def init_config(self):
        """Cria configuração inicial"""
        if self.config_path.exists():
            print(f"⚠️ Config já existe: {self.config_path}")
            response = input("Deseja sobrescrever? (y/N): ")
            if response.lower() != 'y':
                return
        
        config_template = {
            "version": "1.0.0",
            "enabled": True,
            "autonomy_level": "N3",
            "triggers": {
                "git": {
                    "pre-commit": {
                        "enabled": True,
                        "skills": ["lint-and-validate"],
                        "block_on_failure": True
                    },
                    "pre-push": {
                        "enabled": False,
                        "skills": ["vulnerability-scanner", "testing-patterns"],
                        "block_on_failure": True
                    }
                },
                "time": {
                    "daily": {
                        "enabled": False,
                        "time": "09:00",
                        "skills": ["session_manager.py status"]
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
            "rules": {
                "priority": {
                    "security": 1,
                    "test": 2,
                    "lint": 3,
                    "docs": 4
                },
                "conditions": {
                    "max_execution_time": 300
                }
            },
            "agents": {
                "orchestrator": {
                    "enabled": False,
                    "auto_invoke": False,
                    "min_agents": 3
                }
            }
        }
        
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(config_template, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Configuração inicial criada: {self.config_path}")
        print("💡 Edite o arquivo para personalizar triggers e scripts")

def main():
    if len(sys.argv) < 2:
        print("Usage: python autonomous_agent.py [watch|run|status|force|install|init]")
        print("\nCommands:")
        print("  init     - Criar configuração inicial")
        print("  status   - Ver status do agente")
        print("  run      - Executar verificações")
        print("  force    - Forçar execução completa")
        print("  install  - Instalar git hooks")
        print("  watch    - Modo observação (file watcher)")
        sys.exit(1)
    
    agent = AutonomousAgent()
    command = sys.argv[1]
    
    if command == "init":
        agent.init_config()
    elif command == "status":
        agent.status()
    elif command == "run":
        agent.run_all_triggers()
    elif command == "force":
        agent.run_all_triggers(force=True)
    elif command == "install":
        agent.install_hooks()
    elif command == "watch":
        print("👁️ Modo observação iniciado (Ctrl+C para parar)")
        observer = Observer()
        handler = FileChangeHandler(agent)
        observer.schedule(handler, str(agent.project_root), recursive=True)
        observer.start()
        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()
    else:
        print(f"Comando desconhecido: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
