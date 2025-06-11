// Tradutor português do Brasil para português de Portugal
document.addEventListener('DOMContentLoaded', function() {
    // Lista de substituições PT-BR para PT-PT
    const ptBrToPtPt = {
        // Palavras e frases que diferem entre PT-BR e PT-PT
        "suas": "as suas",
        "seus filhos": "os seus filhos",
        "contatos": "contactos",
        "automaticamente todas as": "automaticamente todas as",
        "Gerencie": "Gira",
        "através": "através",
        "quem pode ligar para seus filhos": "quem pode ligar para os seus filhos",
        "crianças seguras": "crianças seguras",
        "contatos salvos": "contactos guardados",
        
        // Correções para termos específicos que talvez não sejam captados acima
        "para seus filhos": "para os seus filhos",
        "na lista de contatos": "na lista de contactos",
        "para manter suas crianças": "para manter as suas crianças"
    };
    
    // Função para aplicar as substituições apenas no texto visível, não nos atributos data-pt
    function applyPortugueseCorrections() {
        // Obter todos os elementos com texto
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, li');
        
        // Para cada elemento
        textElements.forEach(el => {
            // Se não tiver filhos (nós de texto apenas)
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                let text = el.innerText;
                
                // Aplicar todas as substituições
                Object.entries(ptBrToPtPt).forEach(([brTerm, ptTerm]) => {
                    const regex = new RegExp('\\b' + brTerm + '\\b', 'gi');
                    text = text.replace(regex, ptTerm);
                });
                
                // Atualizar o texto apenas se houve alterações
                if (text !== el.innerText) {
                    el.innerText = text;
                }
            }
        });
        
        console.log("🇵🇹 Correções de português de Portugal aplicadas");
    }
    
    // Aplicar correções quando a página carregar e quando o idioma mudar para português
    applyPortugueseCorrections();
    
    // Procurar por botões de troca de idioma
    const langButtons = document.querySelectorAll('.lang-btn, .mobile-lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang === 'pt') {
                // Aguardar um momento para o script principal atualizar o conteúdo
                setTimeout(applyPortugueseCorrections, 100);
            }
        });
    });
});
