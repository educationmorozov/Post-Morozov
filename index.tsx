
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Критическая ошибка: элемент #root не найден.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Ошибка при запуске React приложения:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666;">
        <h2>Что-то пошло не так</h2>
        <p>Пожалуйста, обновите страницу или попробуйте зайти через другой браузер.</p>
      </div>
    `;
  }
}
