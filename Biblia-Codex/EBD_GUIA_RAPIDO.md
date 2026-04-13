# 🚀 Guia Rápido - EBD Extractor

## Passo a Passo (3 minutos)

### 1️⃣ Abra o App Biblia-Codex
```bash
cd Biblia-Codex
npm run dev
```
Acesse: `http://localhost:3000`

---

### 2️⃣ Navegue até a EBD
Clique na aba **"Escola Bíblica Dominical"** no menu principal.

---

### 3️⃣ Clique em "Importar da Web"
Botão azul no canto superior direito.

---

### 4️⃣ Cole a URL do Sumário
Exemplo:
```
https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm
```

---

### 5️⃣ Clique em "Extrair 13 Lições"
⏳ Aguarde 15-30 segundos enquanto as lições são extraídas.

---

### 6️⃣ Revista Digital Abre Automaticamente
✨ Pronto! Navegue pelas 42 páginas:
- Páginas 1-3: Capa, Apresentação, Sumário
- Páginas 4-16: 13 Lições completas
- Páginas 17-29: 13 Capítulos de apoio
- Páginas 30-42: 13 Devocionais

---

### 7️⃣ Use os Recursos
- **MENU** → Ver marcadores
- **🔖** → Salvar página atual
- **A- / A+** → Ajustar tamanho da fonte
- **Anterior / Próxima** → Navegar páginas

---

## 🎯 Exemplos de URLs Válidas

### 1º Trimestre 2026 (Janeiro-Março)
```
https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm
```

### 2º Trimestre 2026 (Abril-Junho)
```
https://www.estudantesdabiblia.com.br/cpad_sumario_2026_2tri.htm
```

### 3º Trimestre 2026 (Julho-Setembro)
```
https://www.estudantesdabiblia.com.br/cpad_sumario_2026_3tri.htm
```

### 4º Trimestre 2026 (Outubro-Dezembro)
```
https://www.estudantesdabiblia.com.br/cpad_sumario_2026_4tri.htm
```

---

## 💡 Dicas

✅ **Dados são salvos automaticamente** - Na próxima vez, a revista carregará instantaneamente

✅ **Limpar dados** - Clique em "Voltar aos trimestres" na revista para voltar à grade normal

✅ **Funciona offline após extração** - Uma vez extraído, não precisa de internet

✅ **Testar no CLI** - Use `npx tsx test-ebd.ts` para verificar se o extrator está funcionando

---

## ❓ Problemas?

### "Erro ao conectar"
→ Execute `npm run dev` e tente novamente

### "Extração falhou"
→ Verifique se a URL está correta e acessível no navegador

### "Nada aparece"
→ Aguarde 30 segundos. O processo extrai 13 páginas web.

---

## 📱 Pronto!

Agora você tem uma **Revista Digital completa** da EBD com:
- ✅ Texto Áureo
- ✅ Verdade Prática
- ✅ Leitura Diária
- ✅ Leitura Bíblica
- ✅ Introdução
- ✅ 3 Tópicos por lição
- ✅ Comentário
- ✅ Sinopse
- ✅ Conclusão
- ✅ Livro de apoio (13 capítulos)
- ✅ Devocionais (13 semanas)

**Total: 42 páginas de conteúdo!** 📖✨
