
import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { Gender, Theme } from '../types';
import { Heart, Camera, ArrowRight, Moon, Sun } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}

const Onboarding: React.FC<Props> = ({ onComplete, onToggleTheme, theme }) => {
  const isDark = theme === 'dark';
  const [form, setForm] = useState({
    username: '',
    password: '',
    gender: 'female' as Gender,
    age: 21,
    aboutMe: '',
    profilePic: ''
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({...form, profilePic: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.setUser(
      {
        username: form.username,
        gender: form.gender,
        age: form.age,
        aboutMe: form.aboutMe,
        profilePic: form.profilePic,
        createdAt: Date.now(),
        theme: theme
      },
      { passwordHash: 'mock_hash_' + form.password }
    );
    onComplete();
  };

  return (
    <div className={`flex-1 p-8 flex flex-col justify-center overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-pink-50 text-gray-900'}`}>
      <div className="absolute top-6 right-6">
        <button 
          onClick={onToggleTheme} 
          className={`p-2 rounded-full shadow-md transition-all ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-400'}`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Heart className="text-pink-500 fill-pink-500 w-12 h-12" />
        </div>
        <h1 className={`brand-font text-5xl mb-2 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Lovink</h1>
        <p className={`${isDark ? 'text-pink-300/60' : 'text-pink-400'} text-sm italic`}>Connect with bold AI Companions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-10">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className={`w-24 h-24 rounded-full border-4 shadow-xl overflow-hidden relative group transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-pink-100 border-white'}`}>
            {form.profilePic ? (
              <img src={form.profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className={`flex items-center justify-center h-full ${isDark ? 'text-slate-600' : 'text-pink-300'}`}>
                <Camera size={32} />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImage}
            />
          </div>
          <span className={`text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-pink-400' : 'text-pink-500'}`}>Upload Profile</span>
        </div>

        <div>
          <label className={`block text-[10px] font-black uppercase mb-1 tracking-widest ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Username</label>
          <input 
            required
            className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:border-pink-400 font-bold placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-pink-100 text-black'}`}
            placeholder="What do we call you?"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className={`block text-[10px] font-black uppercase mb-1 tracking-widest ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>I am a</label>
            <select 
              className={`w-full p-4 rounded-2xl border-2 font-bold appearance-none transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-pink-100 text-black'}`}
              value={form.gender}
              onChange={e => setForm({...form, gender: e.target.value as Gender})}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="w-24">
            <label className={`block text-[10px] font-black uppercase mb-1 tracking-widest ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Age</label>
            <input 
              type="number"
              min="18"
              required
              className={`w-full p-4 rounded-2xl border-2 font-bold transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-pink-100 text-black'}`}
              value={form.age}
              onChange={e => setForm({...form, age: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div>
          <label className={`block text-[10px] font-black uppercase mb-1 tracking-widest ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Bio</label>
          <textarea 
            className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:border-pink-400 h-24 font-bold placeholder-gray-400 transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-pink-100 text-black'}`}
            placeholder="Tell us what you're into..."
            value={form.aboutMe}
            onChange={e => setForm({...form, aboutMe: e.target.value})}
          />
        </div>

        <div>
          <label className={`block text-[10px] font-black uppercase mb-1 tracking-widest ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Passcode</label>
          <input 
            required
            type="password"
            className={`w-full p-4 rounded-2xl border-2 font-bold transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-pink-100 text-black'}`}
            placeholder="Keep it private"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-pink-600 text-white py-4 mt-4 rounded-2xl font-black shadow-2xl hover:bg-pink-700 transition flex items-center justify-center gap-2 transform active:scale-95"
        >
          ENTER LOVINK <ArrowRight size={20} strokeWidth={3} />
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
