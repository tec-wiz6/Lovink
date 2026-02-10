
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHARACTER_TEMPLATES } from '../constants';
import { storageService } from '../services/storage';
import { LocalStorageData, BaseCharacterTemplate, Gender } from '../types';
import { ArrowLeft, Plus, Heart, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  data: LocalStorageData;
  onSelect: () => void;
}

const Gallery: React.FC<Props> = ({ data, onSelect }) => {
  const navigate = useNavigate();
  const userGender = data.userProfile?.gender || 'female';
  const isDark = data.userProfile?.theme === 'dark';
  
  // Male users see Females (6 options), Female users see Males (6 options).
  const targetGender = userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : 'all';
  
  const [selected, setSelected] = useState<BaseCharacterTemplate | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordVisible, setShowPasswordVisible] = useState(false);

  const filteredCharacters = CHARACTER_TEMPLATES.filter(c => {
    if (targetGender === 'all') return true;
    return c.gender === targetGender;
  });

  const handleMakePartner = () => {
    if (!selected) return;
    storageService.addActivePartner({
      ...selected,
      nickname: '', 
      memories: []
    });
    onSelect();
    navigate(`/chat?id=${selected.id}`);
  };

  const submitPassword = () => {
    if (!selected) return;
    if (passwordValue === 'nooneknows') {
      const key = `dev_partner_unlocked_${selected.id}`;
      localStorage.setItem(key, 'true');
      setShowPasswordPrompt(false);
      setShowPasswordVisible(false);
      handleMakePartner();
    } else {
      setPasswordError('Incorrect password — access denied');
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className={`p-4 flex items-center gap-4 sticky top-0 z-10 border-b shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-full hover:bg-opacity-10 ${isDark ? 'text-white hover:bg-white' : 'text-black hover:bg-black'}`}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`font-black text-xl flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>The Collection</h1>
        <button onClick={() => navigate('/custom-partner')} className="bg-pink-500 text-white p-2.5 rounded-full shadow-lg">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        <div className={`px-2 py-1 flex items-center gap-2 mb-2`}>
           <Sparkles size={14} className="text-pink-500" />
           <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
             Selected {targetGender === 'male' ? 'Gentlemen' : 'Ladies'} for you
           </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCharacters.map(char => (
            <div 
              key={char.id}
              onClick={() => setSelected(char)}
              className={`rounded-[32px] p-5 flex gap-5 cursor-pointer transition-all border-2 group
                ${selected?.id === char.id 
                  ? 'border-pink-500 shadow-xl scale-[1.02]' 
                  : (isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-transparent hover:shadow-md')}`}
            >
              <div className="relative flex-shrink-0">
                <img src={char.imageUrl} className="w-24 h-24 rounded-3xl object-cover shadow-lg group-hover:scale-105 transition" alt={char.name} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{char.name}</h3>
                  <span className="text-[8px] bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full uppercase font-black">Online</span>
                </div>
                <p className={`text-xs italic line-clamp-2 leading-snug mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  "{char.description}"
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {char.tags.slice(0, 2).map(tag => (
                    <span key={tag} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{tag}</span>
                  ))}
                </div>
                  {/* card note / badge */}
                  {('cardNote' in char) && (
                    // @ts-ignore - cardNote is an optional extra property from constants
                    <div className={`mt-3 inline-block text-[11px] font-black px-2 py-1 rounded-full ${isDark ? 'bg-pink-900/20 text-pink-300 border border-pink-800' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>{(char as any).cardNote}</div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-end p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className={`relative w-full max-w-sm mx-auto rounded-[48px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300
            ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex gap-6 mb-8 items-center">
              <img src={selected.imageUrl} className="w-24 h-24 rounded-[32px] object-cover shadow-2xl" />
              <div className="flex flex-col">
                <h2 className="text-3xl font-black">{selected.name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-pink-500 text-[10px] font-black uppercase tracking-widest">Active Now</p>
                </div>
              </div>
            </div>
            <p className={`text-sm leading-relaxed mb-8 italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              "{selected.description}"
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className={`flex-1 py-4 rounded-3xl font-black transition ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>CANCEL</button>
              <button onClick={() => {
                // if selected is the dev-only partner (id f2) require password
                if (selected?.id === 'f2') {
                  const key = `dev_partner_unlocked_${selected.id}`;
                  if (localStorage.getItem(key) === 'true') {
                    handleMakePartner();
                  } else {
                    setPasswordValue('');
                    setPasswordError('');
                    setShowPasswordPrompt(true);
                  }
                } else {
                  handleMakePartner();
                }
              }} className="flex-[2] bg-pink-500 text-white py-4 rounded-3xl font-black shadow-xl hover:bg-pink-600 active:scale-95 transition transform">START CHAT</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordPrompt && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordPrompt(false)} />
          <div className={`relative w-full max-w-md mx-auto rounded-3xl p-6 shadow-2xl transform transition duration-200 ${isDark ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-gray-900 border border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-to-tr from-pink-500 to-pink-400 text-white">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg">Exclusive partner</h3>
                <p className="text-xs opacity-80">Enter the password to access this partner.</p>
              </div>
            </div>

            <p className="text-sm mb-4 italic opacity-75">This partner is exclusive for the dev💯.</p>

            <div className="mb-4">
              <div className="relative">
                <input
                  type={showPasswordVisible ? 'text' : 'password'}
                  value={passwordValue}
                  onChange={e => { setPasswordValue(e.target.value); setPasswordError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') submitPassword(); }}
                  autoFocus
                  aria-label="Developer partner password"
                  placeholder="Enter password"
                  className={`w-full pr-12 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-400 transition ${isDark ? 'bg-slate-800 border-slate-700 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-900 shadow-sm'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordVisible(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-sm opacity-90 hover:opacity-100"
                  aria-label={showPasswordVisible ? 'Hide password' : 'Show password'}
                >
                  {showPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <div className="text-xs text-red-500 mt-2">{passwordError}</div>}
              <div className="text-[11px] mt-2 opacity-70">Password will be remembered on this device.</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPasswordPrompt(false)} className={`flex-1 py-3 rounded-lg font-black transition border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}>Cancel</button>
              <button onClick={() => submitPassword()} className="flex-[2] bg-gradient-to-tr from-pink-500 to-pink-600 text-white py-3 rounded-lg font-black shadow-lg hover:scale-105 transform transition">Unlock 🔓</button>
            </div>
          </div>
        </div>
      )}

      {/* helper: password submit logic */}
      
    </div>
  );
};

export default Gallery;
