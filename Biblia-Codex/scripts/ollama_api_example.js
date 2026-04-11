/**
 * Exemplos de uso da API HTTP do Ollama com JavaScript/Node.js
 */

const OLLAMA_URL = "http://localhost:11434";

// Listar modelos instalados
async function listarModelos() {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    return await response.json();
}

// Chat simples sem streaming
async function chatSimples(mensagem, modelo = "qwen2.5-coder:3b") {
    const payload = {
        model: modelo,
        prompt: mensagem,
        stream: false
    };
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return data.response;
}

// Chat com streaming (resposta em tempo real)
async function chatComStreaming(mensagem, modelo = "qwen2.5-coder:3b") {
    const payload = {
        model: modelo,
        prompt: mensagem,
        stream: true
    };
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    process.stdout.write("Resposta: ");
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            try {
                const data = JSON.parse(line);
                if (data.response) {
                    process.stdout.write(data.response);
                }
            } catch (e) {
                // Ignora linhas inválidas
            }
        }
    }
    console.log(); // Nova linha no final
}

// Chat com histórico (formato chat)
async function chatComHistorico(mensagens, modelo = "qwen2.5-coder:3b") {
    const payload = {
        model: modelo,
        messages: mensagens,
        stream: false
    };
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return data.message.content;
}

// Executar exemplos
async function main() {
    console.log("=".repeat(50));
    console.log("API do Ollama - Exemplos JavaScript");
    console.log("=".repeat(50));
    
    try {
        // 1. Listar modelos
        console.log("\n1. Modelos instalados:");
        const modelos = await listarModelos();
        modelos.models?.forEach(m => console.log(`   - ${m.name}`));
        
        // 2. Chat simples
        console.log("\n2. Chat simples:");
        const resposta = await chatSimples("Olá! Explique o que é uma API em uma frase.");
        console.log(`   Resposta: ${resposta}`);
        
        // 3. Chat com histórico
        console.log("\n3. Chat com histórico:");
        const historico = [
            { role: "user", content: "Meu nome é Carlos" },
            { role: "assistant", content: "Prazer em conhecê-lo, Carlos!" },
            { role: "user", content: "Qual é o meu nome?" }
        ];
        const respostaHistorico = await chatComHistorico(historico);
        console.log(`   Resposta: ${respostaHistorico}`);
        
        console.log("\n" + "=".repeat(50));
        console.log("Para streaming, chame: await chatComStreaming('sua pergunta')");
        console.log("=".repeat(50));
        
    } catch (error) {
        console.error("Erro:", error.message);
    }
}

main();
