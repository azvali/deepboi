import * as vscode from 'vscode';
import ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand('deepboi.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'deepboi',
            'Deepest of Bois',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';

                try {
                    const streamResponse = await ollama.chat({
                        model: 'deepseek-r1:7b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });

                    let responseText = "";
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                } catch (err) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `❌ Error: ${String(err)}` });
                }
            }
        });

    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return /* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deep VS Code Extension</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', sans-serif;
                display: flex;
                flex-direction: column;
                height: 100vh;
                background-color: #1e1e1e;
                color: white;
                overflow: hidden;
            }
            h2 {
                text-align: center;
                padding: 10px;
                font-size: 1.5rem;
                background: #252526;
                border-bottom: 1px solid #444;
            }
            .chat-container {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                padding: 15px;
                background: #252526;
                border-top: 1px solid #444;
                scrollbar-width: thin;
            }
            .message {
                padding: 12px 15px;
                border-radius: 18px;
                max-width: 75%;
                word-wrap: break-word;
                line-height: 1.5;
                font-size: 14px;
                margin-bottom: 10px;
            }
            .user-message {
                background-color: #0078d7;
                color: white;
                align-self: flex-end;
                text-align: right;
                border-bottom-right-radius: 4px;
            }
            .bot-message {
                background-color: #333;
                color: #ddd;
                align-self: flex-start;
                text-align: left;
                border-bottom-left-radius: 4px;
            }
            .input-container {
                display: flex;
                padding: 10px;
                background: #1e1e1e;
                border-top: 1px solid #444;
            }
            textarea {
                flex: 1;
                padding: 10px;
                border: 1px solid #555;
                background: #252526;
                color: white;
                font-size: 16px;
                border-radius: 5px;
                resize: none;
                outline: none;
                height: 40px;
            }
            button {
                padding: 12px 15px;
                border: none;
                background-color: #0078d7;
                color: white;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                margin-left: 10px;
            }
            button:hover {
                background-color: #005ea6;
            }
        </style>
    </head>
    <body>
        <h2>Deepboi</h2>
        <div class="chat-container" id="chat"></div>
        <div class="input-container">
            <textarea id="prompt" rows="2" placeholder="Ask something..."></textarea>
            <button id="askBtn">Ask</button>
        </div>

        <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById("chat");
        const userInput = document.getElementById("prompt");
        const askButton = document.getElementById("askBtn");
        let lastBotMessage = null;

        askButton.addEventListener("click", function() {
            const text = userInput.value.trim();
            if (text === "") return;

            addMessage(text, "user-message");
            userInput.value = "";
            vscode.postMessage({ command: 'chat', text });

            lastBotMessage = addMessage("**Thinking...**", "bot-message");
        });

        window.addEventListener('message', event => {
            const { command, text } = event.data;
            if (command === 'chatResponse' && lastBotMessage) {
                lastBotMessage.innerHTML = marked.parse(text);
                scrollToBottom(); // Auto-scroll to latest response
            }
        });

        function addMessage(text, className) {
            const messageDiv = document.createElement("div");
            messageDiv.className = "message " + className;
            messageDiv.innerHTML = marked.parse(text);
            chatContainer.appendChild(messageDiv);
            scrollToBottom();
            return messageDiv;
        }

        function scrollToBottom() {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
        </script>
    </body>
    </html>
    `;
}


export function deactivate() {}
