# 📖 EBD Extractor - Formato Visual page.txt

## ✅ Implementação Concluída

O extrator agora gera o conteúdo extraído **exatamente no mesmo formato visual** do arquivo `EBD/page.txt`.

## 🎯 O que foi Feito

### 1. Estrutura HTML Idêntica

Cada lição extraída gera um HTML completo com:

✅ **CSS Variables** - Mesmas variáveis de cores e estilos do page.txt
✅ **Boxes Estilizados** - Texto Áureo, Verdade Prática, Leitura Diária, etc.
✅ **Classes Idênticas** - `.ta-vp-container`, `.daily-read-box`, `.comentario-box`, etc.
✅ **Tipografia** - Mesma fonte Inter, tamanhos e espaçamentos
✅ **Cores Temáticas** - Vermelho para Texto Áureo, Azul para Verdade Prática, etc.

### 2. Componentes Visuais da Lição

Cada lição gerada inclui:

```
┌─────────────────────────────────────┐
│        LIÇÃO N: Título              │
├─────────────────────────────────────┤
│  TEXTO ÁUREO (vermelho centralizado)│
│  VERDADE PRÁTICA (vermelho)         │
├─────────────────────────────────────┤
│  LEITURA DIÁRIA (azul escuro)       │
│  - Segunda: Ref                     │
│  - Terça: Ref                       │
│  ...                                │
├─────────────────────────────────────┤
│  LEITURA BÍBLICA (bege/vermelho)    │
│  Texto completo dos versículos      │
├─────────────────────────────────────┤
│  PLANO DE AULA (azul claro)         │
│  Introdução                         │
├─────────────────────────────────────┤
│  COMENTÁRIO (azul médio)            │
│  Desenvolvimento teológico          │
├─────────────────────────────────────┤
│  I - TÓPICO 1                       │
│  SINOPSE I                          │
│  II - TÓPICO 2                      │
│  SINOPSE II                         │
│  III - TÓPICO 3                     │
│  SINOPSE III                        │
├─────────────────────────────────────┤
│  CONCLUSÃO (azul)                   │
└─────────────────────────────────────┘
```

### 3. Revista Completa Gerada

O extractor gera uma revista com:

- **Page 0**: Capa com imagem
- **Page 1**: Palavra da Editora
- **Page 2**: Sumário
- **Pages 3-15**: 13 Lições completas (formato page.txt)
- **Navegação**: JavaScript para navegar entre páginas
- **Popup Bíblico**: Sistema de popup para versículos

## 📁 Arquivos

### Backend
- **`scripts/ebd-extractor.ts`** - Gerador de HTML no formato page.txt
- **`scripts/server.ts`** - API `/api/ebd/extract`

### Frontend
- **`src/components/EBDPage.tsx`** - Componente React com iframe
- **`public/EBD/page.txt`** - Revista base (1º Trimestre 2026)

### Saída
- **`public/EBD/extracted-{ano}-q{trimestre}.html`** - Revistas geradas

## 🚀 Como Funciona

### 1. Extração
```typescript
// Extrai dados do site
const data = await extractQuarterFromSumario(url);

// Gera HTML no formato page.txt
const magazineHTML = generateMagazineHTML(data);

// Salva em public/EBD/
fs.writeFileSync(outputPath, magazineHTML);
```

### 2. Visualização
```typescript
// Carrega no iframe
fetch(magazineUrl)
  .then(res => res.text())
  .then(html => {
    doc.write(html);  // Renderiza HTML completo
  });
```

## 🎨 Estilos CSS Gerados

### Variáveis de Cor
```css
--primary-color: #B22222;      /* Vermelho Texto Áureo */
--secondary-color: #01579B;    /* Azul Popup Bíblico */
--accent-red: #B22222;         /* Vermelho Destaque */
--dark-read-blue: #003366;     /* Azul Escuro Boxes */
--sinopse-green: #808000;      /* Verde Sinopse */
--conclusao-blue: #2D66A8;     /* Azul Conclusão */
```

### Boxes Estilizados
- `.ta-vp-container` - Texto Áureo + Verdade Prática
- `.daily-read-box` - Leitura Diária (azul escuro)
- `.lesson-read-box` - Leitura Bíblica (bege/vermelho)
- `.comentario-box` - Comentário (azul médio)
- `.conclusao-box` - Conclusão (azul)
- `.sinopse-box` - Sinopse (verde)
- `.auxilio-box` - Auxílio Bibliográfico

## ✨ Resultado

### Antes
❌ Conteúdo extraído em JSON sem formatação visual
❌ Sem CSS ou estilos
❌ Não se parecia com a revista original

### Depois
✅ HTML completo com todos os estilos CSS
✅ Mesma estrutura visual do page.txt
✅ Boxes coloridos, tipografia e layout idênticos
✅ Navegação funcional entre páginas
✅ Popup bíblico funcionando

## 📊 Comparação Visual

### page.txt Original
```
┌────────────────────────────────────┐
│ [CSS Variables]                    │
│ [Body Styling]                     │
│ [Box Styles]                       │
├────────────────────────────────────┤
│ <div id="page-0"> Capa </div>      │
│ <div id="page-1"> Editora </div>   │
│ <div id="page-2"> Sumário </div>   │
│ <div id="page-3"> Lição 1 </div>   │
│ ...                                │
│ <div id="page-15"> Lição 13 </div> │
└────────────────────────────────────┘
```

### HTML Gerado pelo Extractor
```
┌────────────────────────────────────┐
│ [CSS Variables] ✅ IGUAL           │
│ [Body Styling] ✅ IGUAL            │
│ [Box Styles] ✅ IGUAL              │
├────────────────────────────────────┤
│ <div id="page-0"> Capa </div>      │
│ <div id="page-1"> Editora </div>   │
│ <div id="page-2"> Sumário </div>   │
│ <div id="page-3"> Lição 1 </div>   │
│ ...                                │
│ <div id="page-15"> Lição 13 </div> │
└────────────────────────────────────┘
```

## 🎓 Exemplo de Uso

```bash
# 1. Iniciar servidor
npm run dev

# 2. Extrair trimestre
# Frontend: Clique em "Importar da Web"
# Cole: https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm
# Clique em "Extrair 13 Lições"

# 3. Revista abre automaticamente
# URL gerada: /EBD/extracted-2026-q1.html
```

## 📝 Estrutura da Lição Gerada

Cada lição contém:

1. **Título** - Nome completo da lição
2. **Texto Áureo** - Versículo central (box vermelho)
3. **Verdade Prática** - Conceito principal (box vermelho)
4. **Leitura Diária** - 6 dias de leitura (box azul escuro)
5. **Leitura Bíblica** - Texto bíblico completo (box bege)
6. **Plano de Aula** - Introdução e objetivos (box azul claro)
7. **Comentário** - Desenvolvimento teológico (box azul médio)
8. **Tópicos (I, II, III)** - Conteúdo detalhado
9. **Sinopses** - Resumo de cada tópico (box verde)
10. **Conclusão** - Fechamento (box azul)

## 🔧 Técnico

### Funções Principais

```typescript
// Gera HTML de uma lição
generateLessonHTML(lesson: Lesson, number: number): string

// Gera HTML completo da revista
generateMagazineHTML(data: ExtractedData): string

// Extrai dados do site
extractQuarterFromSumario(url: string): Promise<ExtractedData>
```

### Tecnologias
- **cheerio** - Parsing HTML do site
- **axios** - Requests HTTP com encoding ISO-8859-1
- **Express** - Servidor API
- **React** - Frontend com iframe
- **Vite** - Build tool

## ✅ Checklist de Conformidade

- ✅ CSS Variables idênticas ao page.txt
- ✅ Boxes com mesmas cores e bordas
- ✅ Tipografia Inter com mesmos tamanhos
- ✅ Espaçamentos e margens iguais
- ✅ Classes CSS correspondentes
- ✅ Estrutura HTML semântica
- ✅ Navegação JavaScript funcional
- ✅ Popup bíblico operacional
- ✅ Encoding ISO-8859-1 → UTF-8

## 🎉 Resultado Final

**O extrator agora gera lições com o MESMO formato visual do page.txt!**

---

_Implementado em Abril 2026_
_Sistema EBD Extractor - Biblia-Codex_
