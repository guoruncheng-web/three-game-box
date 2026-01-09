import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { GameHome } from './components/GameHome';
import { ToastProvider, toastStyles } from './components/Toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // 注册 Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW 注册成功:', registration.scope);
          })
          .catch((error) => {
            console.log('SW 注册失败:', error);
          });
      });
    }
  }, []);

  return (
    <ToastProvider>
      {isLoggedIn ? (
        <GameHome onLogout={() => setIsLoggedIn(false)} />
      ) : showRegister ? (
        <RegisterPage
          onRegister={() => setIsLoggedIn(true)}
          onBackToLogin={() => setShowRegister(false)}
        />
      ) : (
        <LoginPage
          onLogin={() => setIsLoggedIn(true)}
          onShowRegister={() => setShowRegister(true)}
        />
      )}
      
      <style>{toastStyles}</style>
    </ToastProvider>
  );
}