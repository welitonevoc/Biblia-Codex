# 📖 EBD Extractor - Revista Digital Dinâmica

Sistema completo para extração e visualização de lições da Escola Bíblica Dominical (EBD/CPAD).

## 🎯 Funcionalidades

✅ **Extração Automática** - Extrai conteúdo completo de 13 lições a partir da URL do sumário
✅ **Revista Digital** - Visualização no formato de revista digital com 42 páginas
✅ **Sistema de Marcadores** - Salva páginas favoritadas no localStorage
✅ **Controle de Fonte** - Ajuste dinâmico do tamanho da fonte (80% - 150%)
✅ **Navegação Fluida** - Anterior/Próxima com indicador de página
✅ **Cache Local** - Dados extraídos salvos automaticamente

## 📁 Estrutura de Arquivos

```
Biblia-Codex/
├── scripts/
│   ├── ebd-extractor.ts      # Backend: Extrator de lições
│   └── server.ts             # Servidor Express com API /api/ebd/extract
├── src/
│   └── components/
│       └── EBDPage.tsx       # Frontend: Componente React completo
├── test-ebd.ts               # Script de teste
└── test-ebd-save.ts          # Script de teste com salvamento JSON
```

## 🚀 Como Usar

### 1. Iniciar o Servidor

```bash
cd Biblia-Codex
npm run dev
```

O servidor roda na porta 3000 com:
- Frontend Vite (React)
- Backend Express (API de extração)

### 2. Acessar a EBD

No app, navegue até a página **Escola Bíblica Dominical**.

### 3. Importar da Web

1. Clique no botão **"Importar da Web"** (canto superior direito)
2. Cole a URL do sumário. Exemplo:
   ```
   https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm
   ```
3. Clique em **"Extrair 13 Lições"**
4. Aguarde a extração (processa em lotes de 3 lições)
5. A revista digital abrirá automaticamente

### 4. Navegar na Revista

- **Menu** - Abre sidebar de marcadores
- **A- / A+** - Ajusta tamanho da fonte
- **🔖 Bookmark** - Salva a página atual
- **Anterior / Próxima** - Navega entre as 42 páginas

## 📊 Estrutura da Revista Digital

A revista gerada possui **42 páginas**:

| Páginas | Conteúdo |
|---------|----------|
| 1 | Capa com título e comentarista |
| 2 | Palavra da Editora |
| 3 | Sumário com todas as 13 lições |
| 4-16 | **13 Lições completas** (1 página cada) |
| 17-29 | **13 Capítulos do Livro de Apoio** |
| 30-42 | **13 Devocionais** |

### Conteúdo de Cada Lição

Cada lição extraída contém:
- ✨ Texto Áureo
- 💎 Verdade Prática
- 📖 Leitura Diária (Segunda a Sábado)
- 📜 Leitura Bíblica em Classe
- 📝 Introdução
- 📑 Tópicos (I, II, III)
- 💡 Comentário
- 📋 Sinopse
- ✅ Conclusão

## 🔧 API Endpoint

### POST `/api/ebd/extract`

Extrai conteúdo completo de um trimestre.

**Request:**
```json
{
  "sumarioUrl": "https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "quarter": 1,
    "title": "Lições Bíblicas CPAD",
    "commentator": "Comentarista: Douglas Baptista",
    "lessons": [
      {
        "number": 1,
        "title": "Lição 1: Título da Lição",
        "textAureo": "<p>...</p>",
        "verdadePratica": "<p>...</p>",
        "leituraDiaria": "<p>...</p>",
        "leituraBiblica": "<p>...</p>",
        "introducao": "<p>...</p>",
        "topicos": [...],
        "comentario": "<p>...</p>",
        "sinopse": "<p>...</p>",
        "conclusao": "<p>...</p>"
      }
      // ... mais 12 lições
    ]
  }
}
```

### GET `/api/ebd/extract`

Testa se a API está funcionando.

## 🧪 Testes

### Testar Extração (CLI)

```bash
npx tsx test-ebd.ts
```

### Testar com Salvamento JSON

```bash
npx tsx test-ebd-save.ts
```

Gera arquivo `ebd-extracted-sample.json` para inspeção.

## 🔍 URLs de Exemplo

- **1º Trimestre 2026**: `https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm`
- **2º Trimestre 2026**: `https://www.estudantesdabiblia.com.br/cpad_sumario_2026_2tri.htm`
- **3º Trimestre 2026**: `https://www.estudantesdabiblia.com.br/cpad_sumario_2026_3tri.htm`
- **4º Trimestre 2026**: `https://www.estudantesdabiblia.com.br/cpad_sumario_2026_4tri.htm`

## 🛠️ Tecnologias

| Componente | Tecnologia |
|------------|-----------|
| Backend | Node.js + Express + Cheerio + Axios |
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Build | Vite 8 |
| Estado | localStorage (cache de dados extraídos) |
| Encoding | ISO-8859-1 (compatível com site CPAD) |

## 📝 Notas

- **Encoding**: O site usa ISO-8859-1. O extractor converte automaticamente para UTF-8.
- **Rate Limiting**: Lições são processadas em lotes de 3 para evitar bloqueio.
- **Fallback**: Se uma lição falhar, conteúdo padrão é gerado.
- **Persistência**: Dados extraídos são salvos em `localStorage`.

## 🐛 Troubleshooting

### "Erro ao conectar com o servidor"
- Certifique-se de que `npm run dev` está rodando
- Verifique se a porta 3000 está disponível

### "Extração falhou"
- Verifique se a URL está correta
- Aguarde alguns segundos e tente novamente
- O site pode estar temporariamente indisponível

### "Títulos aparecem como 'Lição 1'"
- O site pode ter mudado a estrutura HTML
- Verifique o console para logs de extração

## 📄 Licença

Este é um projeto educacional para uso com a Escola Bíblica Dominical - CPAD.
