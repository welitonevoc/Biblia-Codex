# API Ollama - Endpoints Principais

## URL Base
```
http://localhost:11434
```

---

## 1. Listar Modelos
**GET** `/api/tags`

```bash
curl http://localhost:11434/api/tags
```

---

## 2. Gerar Texto (Generate)
**POST** `/api/generate`

```bash
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:3b",
  "prompt": "O que é uma API?",
  "stream": false
}'
```

**Parâmetros:**
- `model` (obrigatório): nome do modelo
- `prompt` (obrigatório): texto de entrada
- `stream`: `true` ou `false` (streaming de resposta)
- `options`: configurações extras (temperature, etc)

---

## 3. Chat (com histórico)
**POST** `/api/chat`

```bash
curl -X POST http://localhost:11434/api/chat -d '{
  "model": "qwen2.5-coder:3b",
  "messages": [
    {"role": "user", "content": "Oi!"},
    {"role": "assistant", "content": "Olá! Como posso ajudar?"},
    {"role": "user", "content": "Qual é a capital da França?"}
  ],
  "stream": false
}'
```

**Roles:** `user`, `assistant`, `system`

---

## 4. Pull Model (baixar modelo)
**POST** `/api/pull`

```bash
curl -X POST http://localhost:11434/api/pull -d '{
  "name": "llama3.2"
}'
```

---

## 5. Embeddings (vetores)
**POST** `/api/embed`

```bash
curl -X POST http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Texto para gerar embedding"
}'
```

---

## Modelos Disponíveis
https://ollama.com/library

Populares:
- `qwen2.5-coder` - Código/tecnico
- `llama3.2` - Geral
- `gemma3` - Google
- `phi4` - Microsoft
- `deepseek-r1` - Raciocínio
- `nomic-embed-text` - Embeddings

---

## Exemplos Práticos

Veja os arquivos na pasta:
- `ollama_api_example.py` - Python completo
- `ollama_api_example.js` - JavaScript/Node.js
- `ollama_api_curl.bat` - Batch Windows
