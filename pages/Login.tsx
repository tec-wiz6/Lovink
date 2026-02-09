
import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { Theme } from '../types';
import { Heart, Lock, Moon, Sun } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}

const Login: React.FC<Props> = ({ onLogin, onSwitchToRegister, onToggleTheme, theme }) => {
  const isDark = theme === 'dark';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const data = storageService.getData();
    
    if (data.userProfile?.username === username && data.auth?.passwordHash === 'mock_hash_' + password) {
      onLogin();
    } else {
      setError('Invalid username or password on this device.');
    }
  };

  return (
    <div className={`flex-1 p-8 flex flex-col justify-center transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-pink-50 text-gray-900'}`}>
      <div className="absolute top-6 right-6">
        <button 
          onClick={onToggleTheme} 
          className={`p-2 rounded-full shadow-md transition-all ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-400'}`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Heart className="text-pink-500 fill-pink-500 w-16 h-16 animate-pulse" />
        </div>
        <h1 className={`brand-font text-6xl ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Lovink</h1>
        <p className={`${isDark ? 'text-pink-300/60' : 'text-pink-400'} text-sm mt-2 font-medium`}>Welcome back, love.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <input 
            required
            className={`w-full p-4 rounded-2xl border transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 font-bold ${isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white/80 border-pink-100 text-gray-700'}`}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="relative">
          <input 
            required
            type="password"
            className={`w-full p-4 rounded-2xl border transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 font-bold ${isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white/80 border-pink-100 text-gray-700'}`}
            placeholder="Local Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-xs text-center font-bold px-2">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-pink-600 transition-all active:scale-95"
        >
          Unlock My Heart
        </button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={onSwitchToRegister}
          className={`text-sm font-bold transition-colors ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-400 hover:text-pink-600'}`}
        >
          Don't have an account? Create one
        </button>
      </div>

      <div className="mt-12 flex flex-col items-center opacity-40">
        <Lock size={16} className={`${isDark ? 'text-slate-500' : 'text-pink-300'}`} />
        <p className={`text-[10px] uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-pink-400'}`}>Local Authentication Only</p>
      </div>
    </div>
  );
};

export default Login;
