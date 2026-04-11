# Alternativas ao Claude no Ollama

Infelizmente o Anthropic (Claude) não permite que seus modelos sejam distribuídos via Ollama.

Mas aqui estão as **melhores alternativas gratuitas e locais**:

---

## 🥇 RECOMENDADOS (estilo Claude)

### 1. **Llama 3.2** (Meta)
```bash
ollama pull llama3.2
```
- **Tamanhos:** 1B, 3B (leve) | 11B, 90B Vision (mais pesados)
- **Uso:** Geral, conversação, análise
- **Qualidade:** ⭐⭐⭐⭐⭐ (muito próximo do Claude)

### 2. **Qwen 2.5** (Alibaba) ← VOCÊ JÁ TEM!
```bash
ollama pull qwen2.5:14b
```
- Você já tem o `qwen2.5-coder:7b` que é excelente para código
- **Para conversação:** `qwen2.5` ou `qwen2.5:14b`

### 3. **Command R** (Cohere)
```bash
ollama pull command-r
```
- Especializado em conversação longa
- Ótimo para RAG (busca em documentos)
- **Tamanho:** 35B

### 4. **Mistral** / **Mixtral**
```bash
ollama pull mistral          # 7B, rápido
ollama pull mixtral          # 8x7B, mais poderoso
```

---

## 🔧 COMANDOS ÚTEIS

### Baixar múltiplos modelos:
```bash
# Modelos leves e rápidos
ollama pull llama3.2:3b
ollama pull qwen2.5:7b
ollama pull phi4

# Modelos mais poderosos
ollama pull llama3.2:11b
ollama pull command-r
```

### Ver espaço usado:
```bash
ollama list
```

### Remover modelo:
```bash
ollama rm nome-do-modelo
```

---

## 📝 COMPARAÇÃO RÁPIDA

| Modelo | Tamanho | Velocidade | Uso Ideal |
|--------|---------|------------|-----------|
| llama3.2:3b | 2.0 GB | ⭐⭐⭐⭐⭐ | Conversação geral |
| qwen2.5:7b | 4.7 GB | ⭐⭐⭐⭐ | Código + texto |
| phi4 | 9.1 GB | ⭐⭐⭐ | Raciocínio complexo |
| command-r | 20 GB | ⭐⭐⭐ | Chat longo, RAG |

---

## 🚀 RECOMENDAÇÃO

Para substituir o Claude, eu recomendo:

1. **Llama 3.2:3b** - Leve, rápido, excelente qualidade
2. **Qwen 2.5:7b** - Você já tem, muito bom!

Execute no terminal:
```bash
ollama pull llama3.2
ollama pull qwen2.5:7b
```

---

## 📚 Documentação

Lista completa: https://ollama.com/library

