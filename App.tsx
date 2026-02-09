
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { storageService } from './services/storage';
import { LocalStorageData, Theme, UserProfile } from './types';

// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Editor from './pages/Editor';
import Chat from './pages/Chat';
import CustomPartner from './pages/CustomPartner';
import ChatList from './pages/ChatList';

const App: React.FC = () => {
  const [data, setData] = useState<LocalStorageData>(storageService.getData());
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('register');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [theme, setTheme] = useState<Theme>(data.userProfile?.theme || 'light');

  useEffect(() => {
    const stored = storageService.getData();
    setData(stored);
    if (stored.userProfile) {
      setView('login');
      setTheme(stored.userProfile.theme || 'light');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (data.userProfile) {
      const updated: UserProfile = { ...data.userProfile, theme: newTheme };
      storageService.setUser(updated, data.auth!);
      refreshData();
    }
  };

  const refreshData = () => {
    setData(storageService.getData());
  };

  if (!isLoaded) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen max-w-md mx-auto shadow-xl relative overflow-hidden flex flex-col border-x transition-colors duration-300
      ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'}`}>
      <HashRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              isSessionActive ? <Navigate to="/dashboard" /> : (
                view === 'login' 
                  ? <Login onLogin={() => { refreshData(); setIsSessionActive(true); }} onSwitchToRegister={() => setView('register')} onToggleTheme={toggleTheme} theme={theme} /> 
                  : <Onboarding onComplete={() => { refreshData(); setView('login'); }} onToggleTheme={toggleTheme} theme={theme} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={isSessionActive ? <Dashboard data={data} onLogout={() => setIsSessionActive(false)} onToggleTheme={toggleTheme} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/gallery" 
            element={isSessionActive ? <Gallery data={data} onSelect={refreshData} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/messages" 
            element={isSessionActive ? <ChatList data={data} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/custom-partner" 
            element={isSessionActive ? <CustomPartner /> : <Navigate to="/" />} 
          />
          <Route 
            path="/editor" 
            element={isSessionActive ? <Editor data={data} onSave={refreshData} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/chat" 
            element={isSessionActive ? <Chat data={data} onUpdate={refreshData} /> : <Navigate to="/" />} 
          />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
