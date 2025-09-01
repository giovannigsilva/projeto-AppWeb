// Ajustado por Giovanni Gustavo DESENVOLVE 3_5
// Ajustado por Daniella Nunes DESENVOLVE 3_5
// Ajustado por Denison Marques DESENVOLVE 3_5
// Seleciona os elementos principais da interface do chat
const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const chatOpenButton = document.querySelector("#chat-toggle");
const closeChatBot = document.querySelector("#close-chat");
const chatPopup = document.querySelector(".chatbot-popup");
const indexBody = document.querySelector(".index-body");
const clearChatButton = document.querySelector("#clear-chat");
// NOVO: Elemento do contador de caracteres
const charCounter = document.querySelector(".char-counter");


// Elementos do formulário de API
const apiForm = document.querySelector(".api-form");
const apiInput = document.querySelector(".api-input");
const iaSelect = document.querySelector("select[name='ia-escolha']");

// Variáveis globais
let API_KEY = "";
let IA_CHOSEN = "";

// URLs base
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

// Histórico do chat
const chatHistory = [];

// Armazena mensagem do usuário
const userData = {
    message: null
};
const initialInputHeight = messageInput.scrollHeight;

// Cria dinamicamente um elemento de mensagem
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// NOVO: Função para adicionar o botão de copiar
const addCopyButton = (messageDiv) => {
    const messageTextElement = messageDiv.querySelector(".message-text");
    if (!messageTextElement || messageDiv.classList.contains("thinking")) return;

    const copyButton = document.createElement("button");
    copyButton.className = "copy-btn material-symbols-rounded";
    copyButton.textContent = "content_copy";

    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(messageTextElement.innerText).then(() => {
            copyButton.textContent = "check";
            copyButton.classList.add("copied");
            setTimeout(() => {
                copyButton.textContent = "content_copy";
                copyButton.classList.remove("copied");
            }, 1500);
        }).catch(err => console.error("Falha ao copiar texto: ", err));
    });

    messageDiv.appendChild(copyButton);
};


// Gera a resposta do bot
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Adiciona mensagem do usuário ao histórico
    chatHistory.push({
        role: "user",
        content: userData.message
    });

    try {
        let url = "";
        let requestOptions = {};
        let modelName = "";

        if (IA_CHOSEN === "gemini") {
            const geminiHistory = chatHistory.map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{
                    text: msg.content
                }]
            }));

            url = `${GEMINI_URL}?key=${API_KEY}`;
            requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: geminiHistory
                })
            };

        } else if (IA_CHOSEN === "openai" || IA_CHOSEN === "deepseek") {
            const commonHistory = chatHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            if (IA_CHOSEN === "openai") {
                url = OPENAI_URL;
                modelName = "gpt-3.5-turbo";
            } else { // DeepSeek
                url = DEEPSEEK_URL;
                modelName = "deepseek-chat";
            }

            requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: commonHistory
                })
            };

        } else {
            throw new Error("Selecione uma IA válida.");
        }

        const response = await fetch(url, requestOptions);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "Erro na API");

        let apiResponseText = "";

        if (IA_CHOSEN === "gemini") {
            apiResponseText = data.candidates[0].content.parts[0].text.trim();
        } else if (IA_CHOSEN === "openai" || IA_CHOSEN === "deepseek") {
            apiResponseText = data.choices[0].message.content.trim();
        }

        messageElement.innerHTML = ""; // Limpa a ampulheta
        messageElement.innerText = apiResponseText;

        chatHistory.push({
            role: "assistant",
            content: apiResponseText
        });
        
        // Adiciona o botão de copiar após a resposta ser gerada
        addCopyButton(incomingMessageDiv);


    } catch (error) {
        console.error(error);
        messageElement.innerHTML = ""; // Limpa a ampulheta
        messageElement.innerText = "❌ " + error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: "smooth"
        });
    }
};

// Envio de mensagem do usuário
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    if (!API_KEY || !IA_CHOSEN) {
        alert("Insira sua chave da API e selecione uma IA antes de usar!");
        return;
    }

    userData.message = messageInput.value.trim();
    if (!userData.message) return;

    messageInput.value = "";
    messageInput.dispatchEvent(new Event("input")); // Atualiza altura e contador

    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth"
    });

    setTimeout(() => {
        const messageContent = `
            <svg class="bot-avatar" width="35" height="35" viewBox="0 0 1024 1024">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
            <div class="message-text">
                <span class="hourglass-loader">⏳️</span>
            </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: "smooth"
        });

        generateBotResponse(incomingMessageDiv);
    }, 500);
};

// Valida a chave da API
const validateApiKey = async (key, ia) => {
    let url, options;
    if (ia === 'gemini') {
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        options = { method: 'GET' };
    } else if (ia === 'openai') {
        url = 'https://api.openai.com/v1/models';
        options = { method: 'GET', headers: { 'Authorization': `Bearer ${key}` } };
    } else if (ia === 'deepseek') {
        url = 'https://api.deepseek.com/v1/models';
        options = { method: 'GET', headers: { 'Authorization': `Bearer ${key}` } };
    } else {
        return false;
    }

    try {
        const response = await fetch(url, options);
        if (response.ok) {
            return true;
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Status: ${response.status}`);
    } catch (error) {
        console.error("Validation failed:", error);
        alert(`Falha na validação da chave: ${error.message}`);
        return false;
    }
};

const handleApiSubmit = async (e) => {
    e.preventDefault();
    const tempApiKey = apiInput.value.trim();
    const tempIaChoice = iaSelect.value;

    if (!tempApiKey || !tempIaChoice) {
        alert("Por favor, insira a chave da API e selecione uma IA.");
        return;
    }

    const submitButton = e.target.querySelector('#send-api');
    submitButton.innerHTML = '...';
    submitButton.disabled = true;

    const isValid = await validateApiKey(tempApiKey, tempIaChoice);

    submitButton.innerHTML = 'check_circle';
    submitButton.disabled = false;

    if (isValid) {
        API_KEY = tempApiKey;
        IA_CHOSEN = tempIaChoice;
        
        chatPopup.classList.remove("disabled");
        chatOpenButton.classList.remove("disabled");
        document.body.classList.add("show-chat");
        indexBody.classList.add("hide");
        alert(`✅ Chave validada! Configuração salva: ${IA_CHOSEN.toUpperCase()}`);
    }
};

// Limpa o chat
const clearChat = () => {
    if (confirm("Tem certeza que deseja limpar o chat?")) {
        chatHistory.length = 0;
        const messagesToRemove = chatBody.querySelectorAll(".user-message, .bot-message:not(:first-child)");
        messagesToRemove.forEach(msg => msg.remove());
    }
};

// Eventos
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

messageInput.addEventListener("input", () => {
    // Ajusta a altura do textarea
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;

    // NOVO: Atualiza o contador de caracteres
    const currentLength = messageInput.value.length;
    const maxLength = messageInput.getAttribute("maxlength");
    charCounter.textContent = `${currentLength} / ${maxLength}`;
});

apiForm.addEventListener("submit", handleApiSubmit);
sendMessageButton.addEventListener("click", handleOutgoingMessage);
clearChatButton.addEventListener("click", clearChat);
chatOpenButton.addEventListener("click", () => document.body.classList.toggle("show-chat"));
closeChatBot.addEventListener("click", () => document.body.classList.remove("show-chat"));
