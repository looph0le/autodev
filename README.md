<div align="center">

# ⚡ autodev

**Autonomous SDLC Orchestration Engine**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini API](https://img.shields.io/badge/Powered%20by-Gemini-blue?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

A powerful, AI-driven automation CLI that manages your Software Development Life Cycle (SDLC) end-to-end. Let language models autonomously execute development tasks, make commits, and orchestrate complex build workflows.

</div>

---

## ✨ Features

- **🤖 Autonomous Execution**: Create, run, and approve complex development tasks through dedicated AI agents.
- **🛠️ Task Management**: Track the state of tasks (Backlog, In Progress, Completed) effortlessly.
- **Git Native**: Seamlessly integrates with your GitHub/Git workflow, automatically creating branches and committing work as it progresses.
- **🧠 Gemini Powered**: Built squarely on Google's powerful Gemini models for high-quality, intelligent code generation and contextual problem-solving.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or later)
- An active Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/looph0le/autodev.git
   cd autodev
   ```

2. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

3. **Link globally:**
   ```bash
   npm link
   ```
   *You can now trigger the CLI using the `autodev` command from anywhere.*

### Configuration

AutoDev requires a Gemini API key to run. You can configure it in your environment:

```bash
# Add this to your ~/.zshrc or ~/.bashrc
export GEMINI_API_KEY="your-api-key-here"
```
*(Alternatively, you can just place a `.env` file containing `GEMINI_API_KEY=...` in the directory you plan to use `autodev` in).*

---

## 🛠️ Usage

Use the global `autodev` command to orchestrate workflows directly from your terminal.

```bash
autodev <command> [options]
```

### Core Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `init` | Initialize an AutoDev project tracking system in your repository. | `autodev init` |
| `task:create` | Add a new autonomous task to the backlog. | `autodev task:create "Migrate Auth" -d "Move from JWT to Sessions"` |
| `task:list` | View all known tasks and their current states. | `autodev task:list` |
| `task:status` | View detailed logs and specific states of a tracked task. | `autodev task:status <task-id>` |
| `task:run` | Start the autonomous AI execution of a specific task. | `autodev task:run <task-id>` |
| `task:approve`| Approve an AI's task workflow to mark it as complete. | `autodev task:approve <task-id>` |

---

## 🏗 Architecture 

AutoDev stores local orchestration data gracefully within `autodev.db` ensuring that execution contexts survive restarts. The AI agents are specifically scoped to parse tasks and manage code seamlessly without breaking existing logic loops.

## 📄 License

This project is open-source and available under the ISC License.

<div align="center">
  <i>Built with ❤️ for fully autonomous developer workflows.</i>
</div>
