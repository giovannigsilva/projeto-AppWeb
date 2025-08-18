// Ajustado por Daniella Nunes DESENVOLVE 3_5
// Seleciona os elementos principais da interface do chat
const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const chatBotToggle = document.querySelector("#chat-toggle");
const closeChatBot = document.querySelector("#close-chat");

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

// Histórico do chat
const chatHistory = [];

// Armazena mensagem do usuário
const userData = { message: null };
const initialInputHeight = messageInput.scrollHeight;

// Cria dinamicamente um elemento de mensagem
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
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

        if (IA_CHOSEN === "gemini") {
            // Gemini espera o histórico em outro formato
            const geminiHistory = chatHistory.map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            }));

            url = `${GEMINI_URL}?key=${API_KEY}`;
            requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: geminiHistory })
            };

        } else if (IA_CHOSEN === "openai") {
            // OpenAI usa outro formato (chat/completions)
            const openaiHistory = chatHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            url = OPENAI_URL;
            requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: openaiHistory
                })
            };

        } else {
            throw new Error("Selecione uma IA válida (Gemini ou OpenAI).");
        }

        const response = await fetch(url, requestOptions);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "Erro na API");

        let apiResponseText = "";

        if (IA_CHOSEN === "gemini") {
            apiResponseText = data.candidates[0].content.parts[0].text.trim();
        } else if (IA_CHOSEN === "openai") {
            apiResponseText = data.choices[0].message.content.trim();
        }

        messageElement.innerText = apiResponseText;

        // Adiciona resposta ao histórico
        chatHistory.push({
            role: "assistant",
            content: apiResponseText
        });

    } catch (error) {
        console.error(error);
        messageElement.innerText = "❌ " + error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
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
    messageInput.dispatchEvent(new Event("input"));

    // Mensagem do usuário
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Mensagem de carregamento
    setTimeout(() => {
        const messageContent = `
            <svg class="bot-avatar" width="35" height="35" viewBox="0 0 1024 1024">
                <circle cx="50%" cy="50%" r="16" fill="#707ce7"/>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        generateBotResponse(incomingMessageDiv);
    }, 500);
};

// Envio com Enter
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

// Ajuste altura do input
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
});

// Captura chave da API e IA escolhida
apiForm.addEventListener("submit", (e) => {
    e.preventDefault();
    API_KEY = apiInput.value.trim();
    IA_CHOSEN = iaSelect.value;

    if (!API_KEY || !IA_CHOSEN) {
        alert("Por favor, insira a chave da API e selecione uma IA.");
        return;
    }
    alert(`✅ Configuração salva: ${IA_CHOSEN.toUpperCase()}`);
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

// Botão de enviar
sendMessageButton.addEventListener("click", handleOutgoingMessage);

// Abrir/fechar chat
chatBotToggle.addEventListener("click", () => {
    document.body.classList.toggle("show-chat");
});
closeChatBot.addEventListener("click", () => {
    document.body.classList.remove("show-chat");
});