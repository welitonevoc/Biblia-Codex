#!/bin/bash

# Verifica se uma mensagem de commit foi fornecida
if [ -z "$1" ]; then
  echo "Erro: Por favor, forneça uma mensagem de commit."
  echo "Uso: ./push.sh \"Sua mensagem de commit aqui\""
  exit 1
fi

echo "--- Iniciando o processo de sincronização ---"

# 1. Adiciona todas as alterações
git add .

# 2. Faz o commit com a mensagem passada como argumento
git commit -m "$1"

# 3. Puxa as alterações remotas antes de enviar (evita conflitos)
git pull origin main

# 4. Faz o push final
git push origin main

echo "--- Sincronização concluída com sucesso! ---"