# ⚠️ CORREÇÃO NECESSÁRIA - Variável de Ambiente do Windows

## 🔍 Problema Identificado

A variável de ambiente **`OPENAI_MODEL`** está configurada no **Windows** com o valor `qwen2.5-coder:3b`, o que está sobrescrevendo os arquivos `.env` e `.env.local`.

## ✅ Solução - Remover Variável de Ambiente do Sistema

### Opção 1: Via Interface Gráfica (Recomendado)

1. Pressione **Win + R**
2. Digite: `sysdm.cpl` e pressione Enter
3. Clique na aba **Avançado**
4. Clique em **Variáveis de Ambiente**
5. Em **Variáveis de usuário** e **Variáveis do sistema**, procure por:
   - `OPENAI_MODEL`
   - `OPENAI_BASE_URL`
   - `OPENAI_API_KEY`
6. **Remova** ou **edite** essas variáveis
7. Clique em **OK** para salvar

### Opção 2: Via PowerShell (Como Administrador)

```powershell
# Remove as variáveis de ambiente do usuário
[Environment]::SetEnvironmentVariable("OPENAI_MODEL", $null, "User")
[Environment]::SetEnvironmentVariable("OPENAI_BASE_URL", $null, "User")
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $null, "User")

# Remove as variáveis de ambiente do sistema (requer Admin)
[Environment]::SetEnvironmentVariable("OPENAI_MODEL", $null, "Machine")
[Environment]::SetEnvironmentVariable("OPENAI_BASE_URL", $null, "Machine")
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $null, "Machine")

Write-Host "✅ Variáveis de ambiente removidas!" -ForegroundColor Green
Write-Host "🔄 Reinicie seu terminal e o servidor para aplicar as mudanças." -ForegroundColor Yellow
```

### Opção 3: Via CMD (Como Administrador)

```cmd
rem Remove variáveis de ambiente
setx OPENAI_MODEL ""
setx OPENAI_BASE_URL ""
setx OPENAI_API_KEY ""

echo ✅ Variáveis de ambiente removidas!
echo 🔄 Reinicie seu terminal
```

## ✅ Verificação

Após remover as variáveis, verifique se foram removidas:

```powershell
# NOVO Terminal (após a remoção)
echo $env:OPENAI_MODEL
# Deve retornar vazio

# Então reinicie o servidor
cd e:\Biblia-Codex
npm run dev
```

## 📝 Nota

Os arquivos `.env` e `.env.local` agora estão configurados corretamente com:
- `OPENAI_MODEL=qwen7b:latest`
- `OPENAI_BASE_URL=http://127.0.0.1:11434/v1`
- `OPENAI_API_KEY=ollama`

Após remover as variáveis do sistema, o servidor usará automaticamente essas configurações.

---

**Data:** 11 de abril de 2026
