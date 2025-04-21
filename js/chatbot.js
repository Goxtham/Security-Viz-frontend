const GEMINI_API_KEY = 'AIzaSyBrK0B3Vf1_ijv3U90GiaNwomdRCEtK7QQ';

async function sendMessage(message) {
    try {
        const contextualizedMessage = `You are a security and cryptography expert assistant. Please answer the following question about security algorithms, cryptography, or related topics: ${message}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: contextualizedMessage }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.message.includes('API Error')) {
            return 'I apologize, but I encountered an API error. Please try again in a moment.';
        } else if (error.message.includes('Invalid response format')) {
            return 'I received an unexpected response format. Please try asking your question differently.';
        } else {
            return 'I apologize, but I encountered a technical issue. Please try again.';
        }
    }
}

function appendMessage(message, isUser) {
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleUserInput() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim();

    if (message) {
        appendMessage(message, true);
        inputField.value = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading';
        loadingDiv.innerHTML = `<div class="loading-spinner" style="width:20px;height:20px;margin:0;display:inline-block;"></div><span style="margin-left:10px;">Processing your question...</span>`;
        document.getElementById('chat-messages').appendChild(loadingDiv);

        try {
            const response = await sendMessage(message);
            document.getElementById('chat-messages').removeChild(loadingDiv);
            appendMessage(response, false);
        } catch (error) {
            document.getElementById('chat-messages').removeChild(loadingDiv);
            appendMessage('I apologize, but I encountered an error. Please try asking your question again.', false);
            console.error('Chat error:', error);
        }
    }
}

window.handleUserInput = handleUserInput;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chat-messages')) {
        const initialMessage = `Hello! I'm your AI security assistant. I can help you understand:\n- Cryptographic algorithms (AES, DES, RSA, SHA-256, Blowfish)\n- Quantum cryptography\n- Key strength and security concepts\n- Algorithm comparisons\n\nFeel free to ask any questions about these topics!`;
        appendMessage(initialMessage, false);
    }
});
