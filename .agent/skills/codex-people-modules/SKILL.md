---
name: codex-people-modules
description: Regras para extração de dados de biografias em módulos MyBible/MySword que utilizam tabelas cruzadas (people + verse).
---

# Biblia Codex - People Module Support

Este guia define como extrair o máximo de informação de módulos de personagens (People/Dictionary) que utilizam tabelas relacionais em vez de uma única coluna de descrição.

## 🛠 Arquitetura de Mapeamento

1. **Estrutura de Tabelas Comuns**
   - `people`: Contém metadados (id, nome, nascimento, etc).
   - `verse` (ou `verses`): Frequentemente contém o texto biográfico longo.
   - **Chave Estrangeira**: O campo `id` de `people` geralmente mapeia para o campo `chapter` ou `book` na tabela `verse`.

2. **Lógica de Extração (Algoritmo)**
   - **Busca Inicial**: Localizar o personagem na tabela `people` via `name LIKE %termo%`.
   - **Join/Busca Secundária**: Se encontrado, buscar na tabela `verse` onde o índice coincide com o `id` da pessoa (ex: `SELECT text FROM verse WHERE chapter = ?`).
   - **Filtro de Conteúdo**: Remover tags MyBible/MySword (ex: `<FI>`, `<FR>`) do texto antes da exibição.

3. **Formatação de Saída**
   - Mesclar os metadados (Gênero, Ano, Local) no topo.
   - Seguir com o texto extraído da tabela `verse`.
   - Incluir referências bíblicas se disponíveis na coluna `verses`.

## 🤝 Boas Práticas

- **Prioridade de Tabela**: Sempre que houver uma tabela `people`, assumir que ela é a fonte primária de IDs, mas não de texto biográfico.
- **Robustez**: Se a tabela `verse` não retornar dados, fazer o fallback para a "Ficha Técnica" baseada apenas nos metadados da tabela `people`.
