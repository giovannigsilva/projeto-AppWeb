// Seleciona os elementos principais da interface do chat
const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const chatBotToggle = document.querySelector("#chat-toggle");
const closeChatBot = document.querySelector("#close-chat");

// Configuração da API (modelo Gemini)

//const API_KEY = "SUA CHAVE AQUI"; // ← Substituir e remover o comentário
                                                                            // Assume que API_KEY foi definida no .env.js
const API_URL = ``;

// Objeto para armazenar a mensagem do usuário
const userData = {
    message: null
}

const initialInputHeight = messageInput.scrollHeight;

const chatHistory = [
    {
        role: "model",
        parts: [{ text: `` }],
    },
];

// Cria dinamicamente um elemento de mensagem com classes específicas
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes); // Adiciona classes ao elemento
    div.innerHTML = content; // Insere o conteúdo HTML
    return div;
}

// Gera a resposta do bot utilizando a API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    
    //Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: `Usando os detalhes fornecidos, responda a esta conversa: ${userData.message}` }],
    });
    // Configuração da requisição POST para a API do Gemini
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: chatHistory
        })
    }

    try {
        // Envia a requisição e espera a resposta
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();

        // Se houver erro na resposta, lança uma exceção
        if (!response.ok) throw new Error(data.error.message);

        // Extrai e trata o texto da resposta da API
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;

        //Add bot response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText }],
        });

    } catch (error) {
        // Em caso de erro, exibe a mensagem de erro no chat
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000"; // Exibe a mensagem em vermelho
    } finally {
        // Remove o estado de "pensando" e rola o chat para o final
        incomingMessageDiv.classList.remove(".thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
}

// Lida com o envio da mensagem do usuário
const handleOutgoingMessage = (e) => {
    e.preventDefault(); // Evita comportamento padrão do botão/formulário
    userData.message = messageInput.value.trim(); // Armazena a mensagem
    messageInput.value = ""; // Limpa o campo
    messageInput.dispatchEvent(new Event("input")); // Dispara evento para ajuste da altura

    // Cria o elemento da mensagem do usuário
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Adiciona mensagem do bot simulando "pensando..."
    setTimeout(() => {
        const messageContent = `
            <svg class="bot-avatar" width="50" height="50" viewBox="0 0 1024 1024">
                    <path
                        d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">
                    </path>
            </svg>
            <div class="message-text"> 
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        // Chama a função para obter a resposta da API
        generateBotResponse(incomingMessageDiv);
    }, 600); // Espera 600ms antes de mostrar a resposta do bot
}

// Permite enviar a mensagem com a tecla Enter (sem Shift) em telas maiores
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

// Ajusta dinamicamente a altura do campo de texto conforme o conteúdo
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`; // Reseta altura
    messageInput.style.height = `${messageInput.scrollHeight}px`; // Ajusta nova altura

    // Ajusta borda arredondada conforme altura
    document.querySelector(".-chat-form").style.borderRadius =
        messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Inicializa o seletor de emojis (usando EmojiMart)
const picker = new EmojiMart.Picker({
    theme: "light", // Tema claro
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        // Insere o emoji na posição do cursor
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus(); // Mantém o foco no input
    },
    onClickOutside: (e) => {
        // Alterna ou esconde o seletor de emojis
        if (e.target.id === "emoji") {
            document.body.classList.toggle("show-emoji");
        } else {
            document.body.classList.remove("show-emoji");
        }
    }
});

// Adiciona o seletor de emoji ao formulário
document.querySelector(".chat-form").appendChild(picker);

// Adiciona eventos aos botões para abrir e fechar o chat
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
chatBotToggle.addEventListener("click", () => document.body.classList.toggle("show-chat"));
closeChatBot.addEventListener("click", () => document.body.classList.remove("show-chat"));
