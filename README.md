# On Device AI Use Cases

A web-based demo for running Generative AI and Machine Learning use cases directly in the browser using on-device models. This project leverages MediaPipe's GenAI Tasks to provide a chat interface powered by a local LLM (Large Language Model), with no server-side inference required.

## Features
- Load and run a local LLM model (e.g., Gemma 3B) in the browser
- Chat interface with markdown and code formatting
- On-device inference using WebAssembly (WASM) and GPU acceleration
- No data leaves your device

## Demo
![screenshot](screenshot.png) <!-- Add a screenshot if available -->

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/ranjanmadhu/on-device-ai-usecases.git
   cd on-device-ai-usecases
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Download or place the required model file (e.g., `gemma3-1b-it-int4.task`) in the `models/` directory. (See [MediaPipe GenAI Tasks documentation](https://developers.google.com/mediapipe/solutions/genai/llm_inference/web_js) for details.)

### Running the App
Start the development server:
```bash
npm run dev
```
Open your browser and navigate to the local address shown (usually http://localhost:5173).

### Build for Production
```bash
npm run build
```

## Project Structure
- `index.html` – Main HTML file
- `src/` – Source TypeScript files
  - `index.ts` – Main app logic and UI
  - `gen_ai_media_pipe/media-pipe.inference.ts` – MediaPipe LLM inference service
  - `markdown-formatter.ts` – Markdown and code formatting utilities
- `models/` – Place your `.task` model files here
- `style.css`, `loading-popup.css` – App styles

## Technologies Used
- [MediaPipe Tasks GenAI](https://www.npmjs.com/package/@mediapipe/tasks-genai)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (for development/build)
- [Markdown-it](https://github.com/markdown-it/markdown-it) and [highlight.js](https://highlightjs.org/) for chat formatting

## License
MIT

## Acknowledgements
- [MediaPipe GenAI Tasks](https://developers.google.com/mediapipe/solutions/genai/llm_inference/web_js)
- [Gemma Model](https://ai.google.dev/gemma)

---

Feel free to open issues or pull requests for improvements!
