# Frontend Documentation for Agents

## 🏗 Architecture
The frontend is a single-page application (SPA) built with React and Vite.

### Key Directories
- **`src/components`**: Reusable UI components.
- **`src/pages`**: Page-level components corresponding to routes.
- **`src/features`**: Feature-specific logic and state.
- **`src/hooks`**: Custom React hooks.
- **`src/assets`**: Static assets (images, icons).

## 🛠 Tech Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: SCSS/Sass with PostCSS (Autoprefixer, CSSNano).
- **State Management**: Zustand (Global state), TanStack Query (Server state).
- **Routing**: React Router DOM.
- **UI Libraries**:
    - `@tonconnect/ui-react`: GRAM wallet connection.
    - `@dnd-kit`: Drag and drop functionality.
    - `react-lottie`: Lottie animations.

## 💻 Development Flow
### Commands
All commands should be run from the `frontend` directory (though `make` commands in root are preferred for full stack).

```bash
# Install dependencies
npm install  # or yarn

# Start development server
npm run dev

# Build for production
npm run build
```

### Code Style
- **Linting**: ESLint with TypeScript support.
- **Formatting**: Prettier.
- **Strictness**: TypeScript strict mode should be enabled.

## 🎨 UI/UX Guidelines
- Use CSS Modules or standard BEM-like classes in SCSS files.
- Animations should be smooth; prefer Lottie for complex illustrations.
- Ensure components are responsive and clean.
