"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollama_1 = __importDefault(require("ollama"));
function activate(context) {
    const disposable = vscode.commands.registerCommand('deepboi.start', () => {
        const panel = vscode.window.createWebviewPanel('deepboi', 'Deepest of Bois', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: 'deepseek-r1:7b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });
                    let responseText = "";
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                }
                catch (err) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `❌ Error: ${String(err)}` });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent() {
    return /* html */ `
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
        <h2>Deepboi e</h2>
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
function deactivate() { }
//# sourceMappingURL=extension.js.map