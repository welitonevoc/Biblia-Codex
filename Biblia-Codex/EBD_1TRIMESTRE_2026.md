# 📖 EBD - 1º Trimestre de 2026 - Revista Digital Completa

## 🎯 O que foi Implementado

O componente `EBDPage.tsx` agora inclui:

✅ **Revista Digital Completa** do 1º Trimestre de 2026 - "Deus Trino e a Natureza Humana"
✅ **Conteúdo Exato** do arquivo `EBD/page.txt` (15.692 linhas de HTML)
✅ **50 Páginas** incluindo:
  - Capa
  - Palavra da Editora
  - Sumário
  - 13 Lições completas com TODO o conteúdo real
  - 13 Capítulos do Livro de Apoio
  - 13 Devocionais semanais

## 📊 Estrutura do Conteúdo

### Páginas 0-2: Introdução
- **Page 0**: Capa com imagem (https://i.ibb.co/Gf6fWG0q/Capa.jpg)
- **Page 1**: Palavra da Editora (mensagem completa da CPAD)
- **Page 2**: Sumário com imagem de fundo

### Páginas 3-15: 13 Lições Completas
Cada lição contém:
- ✨ Texto Áureo
- 💎 Verdade Prática  
- 📖 Leitura Diária (Seg-Sáb)
- 📜 Leitura Bíblica em Classe
- 📝 Introdução
- 📑 3 Tópicos (I, II, III) com conteúdo completo
- 💡 Comentário Detalhado
- 📋 Sinopse
- ✅ Conclusão
- 🔗 Referências Bíblicas com popup

### Páginas 16-32: Livro de Apoio
- Capa do Livro
- Sobre o Autor
- Apresentação
- Índice (Sumário)
- 13 Capítulos Completos

### Páginas 33-49: Devocionais
- Capa Devocional
- Apresentação Devocional
- Índice
- 13 Devocionais Semanais (Semana 1-13)

## 🚀 Como Usar

### 1. Iniciar o App
```bash
cd Biblia-Codex
npm run dev
```

### 2. Acessar a EBD
No app, clique em **"Escola Bíblica Dominical"**

### 3. Visualizar a Revista Completa
- O **1º Trimestre de 2026** já vem com conteúdo completo pré-carregado
- Clique no cartão "1º Trimestre de 2026 - Deus Trino e a Natureza Humana"
- Ou clique em **"Revista Completa"** se já houver dados extraídos

### 4. Importar Outros Trimestres
- Clique em **"Importar da Web"**
- Cole a URL do sumário (ex: 2º, 3º ou 4º trimestre)
- Clique em **"Extrair 13 Lições"**

## 📋 Conteúdo das Lições (1º Trimestre 2026)

| Lição | Tema | Referência Principal |
|-------|------|---------------------|
| 1 | O Deus Trino e a Criação do Homem | Gn 1.1-3 |
| 2 | O Deus Pai | Mt 11.27 |
| 3 | O Deus Filho | Jo 1.1-14 |
| 4 | O Deus Espírito Santo | Jo 14.16-17 |
| 5 | A Trindade no Antigo Testamento | Is 6.3 |
| 6 | A Trindade no Novo Testamento | Mt 28.19 |
| 7 | A Criação e a Trindade | Gn 1.26 |
| 8 | A Queda e a Promessa | Gn 3.15 |
| 9 | A Encarnação do Verbo | Jo 1.14 |
| 10 | A Obra Redentora de Cristo | Rm 5.8 |
| 11 | O Espírito Santo na Igreja | At 2.1-4 |
| 12 | A Esperança Gloriosa | Ap 22.1-5 |
| 13 | A Adoração ao Deus Trino | Ap 4-5 |

## 🎨 Funcionalidades da Revista

### Navegação
- **Menu Lateral**: Lista todas as 50 páginas
- **Anterior/Próxima**: Navegação sequencial
- **Links Diretos**: Clique nos botões do menu para ir direto a qualquer página

### Interatividade
- **Popup Bíblico**: Clique em qualquer referência bíblica (ex: "Mt 11.27") para ver o versículo completo
- **Marcadores**: Salve suas páginas favoritas
- **Zoom**: Ajuste o tamanho da fonte (A- / A+)

### Design
- **Capas com Imagens**: Capas reais da revista CPAD
- **Cores Temáticas**: 
  - Vermelho para Texto Áureo
  - Azul para Verdade Prática
  - Dourado para Leitura Bíblica
  - Verde para Sinopse e Conclusão

## 🔧 Técnico

### Arquivos Envolvidos
1. **`EBD/page.txt`** - HTML completo (15.692 linhas)
2. **`src/components/EBDPage.tsx`** - Componente React
3. **`scripts/ebd-extractor.ts`** - Backend extractor
4. **`scripts/server.ts`** - API endpoint `/api/ebd/extract`

### Como o Conteúdo é Carregado
```typescript
// Importa o HTML completo como string
import pageContent from '../../EBD/page.txt?raw';

// Renderiza em iframe isolado
<iframe 
  ref={iframeRef}
  className="w-full h-full border-0"
  sandbox="allow-scripts allow-same-origin"
/>

// Injeta o conteúdo no iframe
doc.write(pageContent);
```

### Vantagens do iframe
✅ **Isolamento Total**: CSS e JS da revista não conflitam com o app
✅ **HTML Completo**: Preserva TODO o conteúdo original
✅ **Popup Bíblico Funcional**: Referências abrem normalmente
✅ **Zero Conversão**: Não precisa transformar HTML em React

## 📱 Experiência do Usuário

1. **Abre o App** → Navega para EBD
2. **Vê os Trimestres** → Clica no 1º Trimestre 2026
3. **Revista Abre** → 50 páginas navegáveis imediatamente
4. **Navega Fácil** → Menu, botões anterior/próxima, marcadores
5. **Lê Versículos** → Clique em referências bíblicas para ver popup

## ✨ Diferenciais deste Trimestre

- ✅ **Conteúdo 100% Real**: Extraído diretamente das revistas CPAD
- ✅ **Formatação Original**: Preserva todos os estilos e layouts
- ✅ **Referências Funcionais**: Popup bíblico com 100+ versículos pré-carregados
- ✅ **Imagens Reais**: Capas e ilustrações originais
- ✅ **Corpo Editorial Completo**: Créditos da CPAD incluídos

## 🎓 Exemplo de Uso em Aula

### Professor Preparando a Lição 2
1. Abre o app → EBD
2. Clica em "1º Trimestre 2026"  
3. Usa o Menu → "Lição 02"
4. Lê o Texto Áureo: "Ninguém conhece o Pai, senão o Filho..." (Mt 11.27c)
5. Clica em "Mt 11.27c" → Popup mostra o versículo completo
6. Estuda os 3 tópicos com comentários detalhados
7. Usa a Conclusão para preparar sua aula

## 📚 Recursos Adicionais

### Para Extrair Outros Trimestres
Use as URLs:
```
https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm      # 1º Trim
https://www.estudantesdabiblia.com.br/cpad_sumario_2026_2tri.htm # 2º Trim
https://www.estudantesdabiblia.com.br/cpad_sumario_2026_3tri.htm # 3º Trim
https://www.estudantesdabiblia.com.br/cpad_sumario_2026_4tri.htm # 4º Trim
```

### Para Testar o Extractor
```bash
cd Biblia-Codex
npx tsx test-ebd.ts
```

## 🙏 Créditos

**Conteúdo**: CPAD (Casa Publicadora das Assembleias de Deus)
**Implementação**: Sistema EBD Extractor com React + Vite
**Popup Bíblico**: Sistema integrado com 100+ versículos pré-carregados

---

**1º Trimestre de 2026 - Deus Trino e a Natureza Humana**
_Comentarista: Douglas Baptista_
