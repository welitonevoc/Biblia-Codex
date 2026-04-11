# 🚀 Guia de Configuração Ollama + Antigravity

## ✅ Passo 1: Variáveis de Ambiente (.env)

O arquivo `.env` já está configurado com:

```env
OPENAI_BASE_URL="http://host.docker.internal:11434/v1"
OPENAI_API_KEY="ollama"
OPENAI_MODEL="qwen7b"
```

**Nota:** Se NÃO estiver usando Docker, descomente a linha:
```env
# OPENAI_BASE_URL="http://127.0.0.1:11434/v1"
```

---

## 🔓 Passo 2: Preparar o Ollama para Conexões Externas

### Opção A: Usando o Script Automático (Recomendado)

1. Abra o **PowerShell como Administrador**
2. Execute:
```powershell
cd e:\Biblia-Codex
.\configurar-ollama.ps1
```

### Opção B: Manual

1. **Feche o Ollama** completamente (verifique o ícone perto do relógio)
2. Abra o **PowerShell como Administrador**
3. Execute:
```powershell
$env:OLLAMA_HOST="0.0.0.0"
$env:OLLAMA_ORIGINS="*"
ollama serve
```

---

## 🎯 Passo 3: Rodar o Projeto

Em outro terminal (não precisa ser administrador):

```powershell
cd e:\Biblia-Codex
npm run dev
```

O servidor será iniciado em: `http://localhost:3000`

---

## 🐳 Se Usar Docker (Opcional)

Se tiver Docker instalado:

```powershell
docker compose up -d
```

**Nota:** O comando correto é `docker compose` (sem hífen) nas versões mais recentes.

---

## ✅ Verificação

Para testar se está funcionando:

1. **Ollama rodando:** Abra `http://localhost:11434` no navegador
2. **API disponível:** Execute no PowerShell:
```powershell
curl http://localhost:11434/v1/models
```
3. **Servidor do projeto:** Abra `http://localhost:3000`

---

## 🆘 Troubleshooting

### Erro: "Connection refused"
- Verifique se o Ollama está rodando: `ollama list`
- Se necessário, reinicie: `ollama serve`

### Erro: "Model not found"
- Baixe o modelo: `ollama pull qwen7b`
- Verifique modelos disponíveis: `ollama list`

### Docker não conecta ao Ollama
- Use `host.docker.internal` em vez de `localhost`
- Verifique o firewall do Windows

---

## 📝 Comandos Úteis

```powershell
# Verificar status do Ollama
ollama list

# Baixar modelo
ollama pull qwen7b

# Verificar se modelo está instalado
ollama list | Select-String "qwen7b"

# Parar Ollama (Ctrl+C no terminal que está rodando ollama serve)
```

---

**Última atualização:** 11 de abril de 2026
