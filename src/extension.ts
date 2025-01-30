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
            body {
                font-family: 'Segoe UI', sans-serif;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: #1e1e1e;
                color: white;
            }
            h2 {
                text-align: center;
                margin-bottom: 15px;
                font-size: 1.5rem;
            }
            .chat-container {
                width: 90%;
                max-width: 600px;
                background: #252526;
                padding: 15px;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                border: 1px solid #444;
                height: 400px;
                overflow-y: auto;
                scrollbar-width: thin;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            .message {
                padding: 12px 15px;
                border-radius: 18px;
                max-width: 75%;
                word-wrap: break-word;
                line-height: 1.5;
                font-size: 14px;
                opacity: 1;
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
                gap: 10px;
                margin-top: 10px;
                width: 100%;
                max-width: 600px;
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
            }
            button {
                padding: 12px 15px;
                border: none;
                background-color: #0078d7;
                color: white;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
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
				scrollToBottom(); // Auto-scroll to the latest response
			}
		});

		function addMessage(text, className) {
			const messageDiv = document.createElement("div");
			messageDiv.className = "message " + className;
			messageDiv.innerHTML = marked.parse(text);
			chatContainer.appendChild(messageDiv);
			scrollToBottom(); // Ensure it scrolls down
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
