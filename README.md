DeepBoi - VS Code Chat Extension 💬

DeepBoi is a VS Code extension that integrates DeepSeek AI for interactive chat directly inside your editor.

🚀 Features

Chat with DeepSeek 7B or 14B models directly in VS Code.

Stream responses in real-time.

Dark mode UI for a seamless coding experience.

🛠 Installation

1️⃣ Prerequisites

Before installing, ensure you have:

    VS Code (latest version) installed → Download

    Node.js & npm installed → Download

    Ollama installed → Download

2️⃣ Clone the Repository

    git clone https://github.com/azvali/deepboi.git
    cd deepboi

3️⃣ Install Dependencies

    npm install

4️⃣ Pull the DeepSeek Model

Ensure you have the correct DeepSeek AI model installed:

    ollama pull deepseek-r1:7b

(You can also use deepseek-r1:14b for the larger model.)

5️⃣ Compile the TypeScript Code

    npm run compile

6️⃣ Package & Install the Extension in VS Code

    npx vsce package
    code --install-extension deepboi-0.0.1.vsix


▶️ Running the Extension

1️⃣ Compile the TypeScript Code

    npm run compile

2️⃣ Run the Extension in VS Code

    code --extensionDevelopmentPath=.

This will launch a new VS Code window with the extension loaded.

3️⃣ Start the Chat

    Open Command Palette (Ctrl + Shift + P / Cmd + Shift + P on Mac).

    Search for "Deepest of Bois" and run it.



🔄 Updating & Reinstalling

If you make changes to the extension, recompile and restart:

    npm run compile
    code --extensionDevelopmentPath=.

If needed, uninstall the extension before reinstalling:

    code --uninstall-extension your-name-or-org.deepboi



🛠 Troubleshooting

If the model isn’t found, run:

    ollama list



Ensure you see deepseek-r1:7b or deepseek-r1:14b in the list.

If the extension isn’t starting:

    npm run compile
    code --extensionDevelopmentPath=.





🔗 Credits

Built using VS Code API + Ollama + DeepSeek AI.

UI inspired by modern chat applications.

🎉 Enjoy chatting in VS Code! 🚀🔥

