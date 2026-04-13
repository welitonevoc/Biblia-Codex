/**
 * Gerador de Conteúdo EBD - 2º Trimestre 2026
 * Tema: A Fé dos Patriarcas
 * Gera HTML otimizado para todas as 13 lições
 */

const licoes = [
    {
        numero: 1,
        titulo: "ABRAÃO: O PAI DA FÉ",
        textoAureo: "Pela fé, Abraão, sendo chamado, obedeceu, indo para um lugar que havia de receber por herança; e saiu, sem saber para onde ia.",
        referencia: "Hebreus 11.8",
        verdadePratica: "A FÉ",
        introducao: "A fé de Abraão é o modelo para todos os crentes. Chamado por Deus para deixar sua terra natal, ele demonstrou obediência radical e confiança absoluta nas promessas divinas.",
        topicos: [
            {
                titulo: "I - O CHAMADO DE ABRAÃO",
                conteudo: "Deus chamou Abrão em Ur dos Caldeus, uma das cidades mais desenvolvidas da antiguidade. Este chamado exigiu fé para abandonar o conhecido e confiar no desconhecido. A resposta de Abraão foi imediata: 'saiu, sem saber para onde ia' (Hb 11.8)."
            },
            {
                titulo: "II - AS PROMESSAS DE DEUS",
                conteudo: "Deus fez a Abraão promessas extraordinárias: uma grande nação, uma terra e uma bênção universal. Estas promessas não se baseavam em mérito humano, mas na graça soberana de Deus. Abraão creu, e isso lhe foi imputado como justiça (Gn 15.6)."
            },
            {
                titulo: "III - A PROVA DA FÉ",
                conteudo: "A maior prova de fé veio quando Deus pediu que Abraão sacrificasse Isaque. Mesmo diante desta demanda impossível, Abraão confiou que Deus poderia ressuscitar os mortos (Hb 11.19). Sua fé foi vindicada quando Deus proveu um carneiro substituto."
            }
        ],
        sinopse: "A fé de Abraão nos ensina que confiar em Deus significa obedecer mesmo quando não entendemos completamente Seus caminhos.",
        conclusao: "Abraão nos deixou um exemplo incomparável de fé. Sua vida demonstra que Deus é fiel às Suas promessas e que a obediência radical é o caminho da bênção."
    },
    {
        numero: 2,
        titulo: "A PROMESSA DE DEUS",
        textoAureo: "E levar-te-ei a terra de Canaã, e não te deixarei até que haja feito o que te tenho falado.",
        referencia: "Gênesis 15.7",
        verdadePratica: "AS PROMESSAS",
        introducao: "As promessas de Deus são o fundamento da nossa fé. Ele prometeu a Abraão descendência, terra e bênção universal. Estas promessas não se baseiam em mérito humano, mas na graça e fidelidade de Deus.",
        topicos: [
            {
                titulo: "I - A PROMESSA DE DESCENDÊNCIA",
                conteudo: "Deus prometeu a Abraão que sua descendência seria numerosa como as estrelas do céu. Mesmo com idade avançada e Sara estéril, Abraão creu na promessa divina."
            },
            {
                titulo: "II - A PROMESSA DA TERRA",
                conteudo: "A terra de Canaã foi prometida a Abraão e seus descendentes como possessão perpétua. Esta promessa apontava para uma herança maior e eterna."
            },
            {
                titulo: "III - A PROMESSA DA BÊNÇÃO UNIVERSAL",
                conteudo: "Em Abraão seriam benditas todas as famílias da terra. Esta promessa se cumpriu em Cristo, que trouxe salvação a todos os povos."
            }
        ],
        sinopse: "As promessas de Deus são firmes e seguras, fundamentadas em Seu caráter imutável e fiel.",
        conclusao: "As promessas feitas a Abraão revelam o plano redentor de Deus para toda a humanidade."
    },
    {
        numero: 3,
        titulo: "ISAQUE: O FILHO DA PROMESSA",
        textoAureo: "Então disse Abraão: Moço, ficai-vos aqui com o jumento; e eu e o moço iremos até ali; e, havendo adorado, tornaremos a vós.",
        referencia: "Gênesis 22.5",
        verdadePratica: "O CUMPRIMENTO",
        introducao: "Isaque nasceu como cumprimento da promessa divina. Sua vida nos ensina sobre paciência, fé e o perfeito timing de Deus.",
        topicos: [
            {
                titulo: "I - O NASCIMENTO MILAGROSO",
                conteudo: "Isaque nasceu quando Abraão tinha 100 anos e Sara 90. Seu nascimento foi sobrenatural, demonstrando que nada é impossível para Deus."
            },
            {
                titulo: "II - O SACRIFÍCIO NO MONTE MORIA",
                conteudo: "Quando Deus pediu Isaque em sacrifício, Abraão obedeceu crendo que Deus poderia ressuscitá-lo. Isaque carregou a lenha como tipo de Cristo."
            },
            {
                titulo: "III - O POÇO DA PROMESSA",
                conteudo: "Isaque reabriu os poços de seu pai e encontrou águas vivas. Sua vida de fé trouxe prosperidade e paz."
            }
        ],
        sinopse: "Isaque representa o cumprimento das promessas de Deus no tempo perfeito.",
        conclusao: "A vida de Isaque nos ensina a confiar no tempo de Deus e a sermos obedientes."
    }
    // Adicione as demais lições (4-13) seguindo o mesmo padrão
];

function gerarHTMLLicao(licao) {
    return `
        <div id="page-${licao.numero + 2}" class="magazine-page hidden-center">
            <div class="max-w-4xl mx-auto p-4">
                <!-- Header da Lição -->
                <div class="text-center mb-6">
                    <div class="capitulo-label">LIÇÃO ${String(licao.numero).padStart(2, '0')}</div>
                    <h1 class="titulo-principal">${licao.titulo}</h1>
                </div>

                <!-- Texto Áureo -->
                <div class="versiculo-destaque">
                    "${licao.textoAureo}"
                    <strong>${licao.referencia}</strong>
                </div>

                <!-- Verdade Prática -->
                <div class="keyword-wrapper">
                    <div class="keyword-box">
                        <div class="keyword-label">VERDADE PRÁTICA</div>
                        <div class="keyword-word">${licao.verdadePratica}</div>
                    </div>
                </div>

                <!-- Introdução -->
                <div class="paragrafo-capitular">
                    ${licao.introducao}
                </div>

                <!-- Tópicos -->
                ${licao.topicos(topico => `
                <h2 class="secao-romana">${topico.titulo}</h2>
                <p class="mt-4">
                    ${topico.conteudo}
                </p>
                `).join('')}

                <!-- Sinopse -->
                <div class="sinopse-box">
                    <p class="sinopse-text">SINOPSE</p>
                    <p>${licao.sinopse}</p>
                </div>

                <!-- Conclusão -->
                <div class="conclusao-box block-margin">
                    <div class="box-header">CONCLUSÃO</div>
                    <div class="p-4 inner-block-spacing">
                        <p>${licao.conclusao}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Gerar todas as lições
const todasLicoes = licoes.map(gerarHTMLLicao).join('\n\n');

console.log("HTML gerado para as lições:");
console.log(todasLicoes);

// Para salvar em arquivo:
// const fs = require('fs');
// fs.writeFileSync('licoes-geradas.html', todasLicoes);
