"""
Exemplos de uso da API HTTP do Ollama com Python
"""
import requests
import json

OLLAMA_URL = "http://localhost:11434"

def listar_modelos():
    """Lista todos os modelos instalados"""
    response = requests.get(f"{OLLAMA_URL}/api/tags")
    return response.json()

def chat_simples(mensagem, modelo="qwen2.5-coder:3b"):
    """Chat simples sem streaming"""
    payload = {
        "model": modelo,
        "prompt": mensagem,
        "stream": False  # Retorna resposta completa de uma vez
    }
    response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)
    return response.json()["response"]

def chat_com_streaming(mensagem, modelo="qwen2.5-coder:3b"):
    """Chat com streaming (resposta em tempo real)"""
    payload = {
        "model": modelo,
        "prompt": mensagem,
        "stream": True
    }
    response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, stream=True)
    
    print("Resposta: ", end="", flush=True)
    for line in response.iter_lines():
        if line:
            data = json.loads(line)
            if "response" in data:
                print(data["response"], end="", flush=True)
    print()

def chat_com_historico(mensagens, modelo="qwen2.5-coder:3b"):
    """Chat com histórico de conversa (formato chat)"""
    payload = {
        "model": modelo,
        "messages": mensagens,
        "stream": False
    }
    response = requests.post(f"{OLLAMA_URL}/api/chat", json=payload)
    return response.json()["message"]["content"]


if __name__ == "__main__":
    print("=" * 50)
    print("API do Ollama - Exemplos Python")
    print("=" * 50)
    
    # 1. Listar modelos
    print("\n1. Modelos instalados:")
    modelos = listar_modelos()
    for m in modelos.get("models", []):
        print(f"   - {m['name']}")
    
    # 2. Chat simples
    print("\n2. Chat simples:")
    resposta = chat_simples("Olá! Explique o que é uma API em uma frase.")
    print(f"   Resposta: {resposta}")
    
    # 3. Chat com histórico
    print("\n3. Chat com histórico:")
    historico = [
        {"role": "user", "content": "Meu nome é Carlos"},
        {"role": "assistant", "content": "Prazer em conhecê-lo, Carlos!"},
        {"role": "user", "content": "Qual é o meu nome?"}
    ]
    resposta = chat_com_historico(historico)
    print(f"   Resposta: {resposta}")
    
    print("\n" + "=" * 50)
    print("Para streaming, chame: chat_com_streaming('sua pergunta')")
    print("=" * 50)
