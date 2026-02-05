# 🛠️ SkillForge AI

**The Ultimate AI Agent Skillset Architect.**

SkillForge AI is a high-performance workspace designed to transform high-level ideas into production-ready, installable toolkits for AI agents. Built with the latest Gemini models, it handles everything from architectural design to type-safe code generation and NPX packaging.

[![Version](https://img.shields.io/badge/version-1.1.0-indigo)](https://github.com/your-repo/skillforge)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%203-orange)](https://ai.google.dev/)

---

## 🚀 Key Features

- **💡 Idea to Blueprint**: Instant generation of 4-6 high-precision skills based on a single sentence description.
- **🎙️ Conversational Refinement**: Use **Gemini Live (Audio)** to talk to a dedicated Forge Agent to refine your tool schemas in real-time.
- **📦 NPX-Ready Exports**: One-click export to a structured `.zip` package containing `index.ts`, `package.json`, and `README.md`.
- **⚡ Dynamic Dispatcher**: Every exported package includes a `executeSkill` engine that LLMs can call dynamically.
- **🛡️ Type-Safe Validation**: Built-in runtime schema validation for all tool parameters to prevent agent hallucinations.
- **🔌 Protocol Agnostic**: Native support for **MCP (Model Context Protocol)**, Cursor, Claude Code, and Antigravity.
- **🎨 Batch Engineering**: Select multiple skills to update descriptions or toggle parameter requirements in bulk.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, ESM modules.
- **Intelligence**: Google Gemini 3 Pro (for reasoning) & Gemini 2.5 Flash (for Live API).
- **Packaging**: JSZip for on-the-fly bundle generation.
- **Deployment**: Optimized for serverless or static hosting (Vercel/Netlify).

---

## 🏁 Getting Started

### Prerequisites

- A [Google AI Studio API Key](https://aistudio.google.com/app/apikey).
- Node.js 18+ for local development.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/skillforge-ai.git
   cd skillforge-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Launch Workspace**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture

### Generated Package Structure
When you export a skillset, SkillForge generates a professional Node.js package:

```text
my-agent-skills/
├── index.ts        # Universal entry point with ToolManifest and ExecuteSkill
├── package.json    # NPX configuration and dependencies
└── README.md       # Auto-generated documentation for your tools
```

### The Universal Dispatcher
The generated `index.ts` isn't just a list of functions; it's an engine. It includes a `toolManifest` that IDEs like **Cursor** use to understand your tools, and an `executeSkill` function that handles:
- JSON parameter validation.
- Runtime error logging.
- Performance telemetry (execution time tracking).

---

## 🤖 IDE Integration

### Using with Cursor / Windsurf
Add your generated package to your project and update your `.cursorrules`:
```json
{
  "rules": "The environment has access to the @forge/my-toolkit. Execute tools via: npx my-toolkit <name> --args='{...}'"
}
```

### Using with Claude Code
Inject your skills as an MCP server:
```bash
npm install -g @skillforge/mcp-bridge
mcp-bridge register ./path/to/your/forged-package
```

---

## 🤝 Contributing

We welcome contributions to the Forge! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by the **SkillForge AI** team. Empowering the next generation of autonomous agents.