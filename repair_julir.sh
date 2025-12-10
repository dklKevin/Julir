#!/bin/bash

echo "🛠️  Starting Julir Repair..."

# 1. Clean up old mess
echo "🗑️  Deleting broken dependencies..."
rm -rf node_modules package-lock.json package.json

# 2. Re-initialize project
echo "📦  Re-initializing project..."
npm init -y > /dev/null

# 2.1 FIX: Add the missing scripts
echo "📜  Configuring scripts..."
npm pkg set type="module"
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="vite preview"

# 3. Install React and Vite basics
echo "⬇️  Installing React, Vite, and Lucide..."
npm install react react-dom lucide-react
npm install -D vite @types/react @types/react-dom @vitejs/plugin-react typescript

# 4. Install Tailwind CSS v3 (The Fix)
echo "🎨  Installing compatible Tailwind CSS (v3)..."
npm install -D tailwindcss@3.4.17 postcss autoprefixer

# 5. Generate Config Files
echo "⚙️  Regenerating configuration files..."

# tailwind.config.js
cat > tailwind.config.js <<EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# postcss.config.js
cat > postcss.config.js <<EOF
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# vite.config.ts
cat > vite.config.ts <<EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
EOF

# index.html (Ensure it points to main.tsx)
cat > index.html <<EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Julir</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# 6. Ensure CSS has directives
echo "📝  Updating CSS..."
mkdir -p src
cat > src/index.css <<EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 7. Ensure main.tsx exists (Entry point)
if [ ! -f src/main.tsx ]; then
cat > src/main.tsx <<EOF
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
fi

echo "✅  Repair Complete!"
echo "------------------------------------------------"
echo "👉  Run this command now: npm run dev"
echo "------------------------------------------------"