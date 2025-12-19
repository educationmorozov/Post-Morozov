
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666; font-family: sans-serif;">
        <h2>Ошибка запуска</h2>
        <p>Ваш браузер не поддерживает некоторые функции. Обновите браузер или откройте ссылку в Chrome/Safari.</p>
        <pre style="font-size:10px; color:red;">${error}</pre>
      </div>
    `;
  }
}
