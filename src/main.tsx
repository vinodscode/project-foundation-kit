
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a container that will force the app to take full width
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.style.maxWidth = "100%";
  rootElement.style.padding = "0";
  rootElement.style.width = "100%";
  rootElement.style.margin = "0";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.width = "100%";
  document.body.style.maxWidth = "100vw";
  document.body.style.overflowX = "hidden";
  
  // Add a CSS rule to ensure all containing elements are full width
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root { 
      width: 100% !important; 
      max-width: 100vw !important; 
      margin: 0 !important; 
      padding: 0 !important; 
      overflow-x: hidden;
    }
    .container {
      width: 100% !important;
      max-width: 1400px !important;
      margin: 0 auto !important;
    }
  `;
  document.head.appendChild(style);
}

createRoot(rootElement!).render(<App />);
