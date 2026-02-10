
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHARACTER_TEMPLATES } from '../constants';
import { storageService } from '../services/storage';
import { LocalStorageData, BaseCharacterTemplate, Gender } from '../types';
import { ArrowLeft, Plus, Heart, Sparkles, Lock, X } from 'lucide-react';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const CORRECT_PASSWORD = 'nooneknows';
  const DEV_PARTNER_ID = 'f2';

  const filteredCharacters = CHARACTER_TEMPLATES.filter(c => {
    if (targetGender === 'all') return true;
    return c.gender === targetGender;
  });

  const handleMakePartner = () => {
    if (!selected) return;
    
    // Check if this is the exclusive dev partner (Aisha - f2)
    if (selected.id === DEV_PARTNER_ID) {
      // Check if already verified in this session
      const verifiedPartners = JSON.parse(localStorage.getItem('devVerified') || '[]');
      if (verifiedPartners.includes(DEV_PARTNER_ID)) {
        // Already verified, proceed directly
        proceedToChat();
      } else {
        // Show password modal
        setShowPasswordModal(true);
        setPasswordInput('');
        setPasswordError('');
      }
    } else {
      // Not the exclusive partner, proceed normally
      proceedToChat();
    }
  };

  const proceedToChat = () => {
    if (!selected) return;
    storageService.addActivePartner({
      ...selected,
      nickname: '', 
      memories: []
    });
    onSelect();
    navigate(`/chat?id=${selected.id}`);
    setSelected(null);
    setShowPasswordModal(false);
    setPasswordInput('');
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === CORRECT_PASSWORD) {
      // Mark as verified
      const verifiedPartners = JSON.parse(localStorage.getItem('devVerified') || '[]');
      if (!verifiedPartners.includes(DEV_PARTNER_ID)) {
        verifiedPartners.push(DEV_PARTNER_ID);
        localStorage.setItem('devVerified', JSON.stringify(verifiedPartners));
      }
      proceedToChat();
    } else {
      setPasswordError('Incorrect password. Access denied.');
      setPasswordInput('');
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
            {selected.id === DEV_PARTNER_ID && (
              <div className={`mb-6 p-3 rounded-2xl flex items-center gap-2 ${isDark ? 'bg-purple-900/30 border border-purple-500/50' : 'bg-purple-50 border border-purple-200'}`}>
                <Lock size={16} className="text-purple-500" />
                <p className="text-sm font-bold text-purple-600">Exclusive for Dev Only 💯</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className={`flex-1 py-4 rounded-3xl font-black transition ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>CANCEL</button>
              <button onClick={handleMakePartner} className="flex-[2] bg-pink-500 text-white py-4 rounded-3xl font-black shadow-xl hover:bg-pink-600 active:scale-95 transition transform">START CHAT</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className={`relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in scale-in duration-300
            ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <button onClick={() => setShowPasswordModal(false)} className={`absolute top-4 right-4 p-1.5 rounded-full ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}>
              <X size={20} />
            </button>
            <div className="flex items-center justify-center mb-6">
              <Lock size={32} className="text-purple-500" />
            </div>
            <h3 className={`text-2xl font-black text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Exclusive Access
            </h3>
            <p className={`text-center text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Enter the password to access the devs partner
            </p>
            
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Enter password..."
              className={`w-full px-4 py-3 rounded-2xl mb-4 font-bold tracking-widest text-center border-2 transition focus:outline-none
                ${isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'}`}
              autoFocus
            />
            
            {passwordError && (
              <p className="text-red-500 text-sm font-bold text-center mb-4">{passwordError}</p>
            )}
            
            <button
              onClick={handlePasswordSubmit}
              className="w-full bg-purple-500 text-white py-3 rounded-2xl font-black shadow-lg hover:bg-purple-600 active:scale-95 transition transform"
            >
              UNLOCK ACCESS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
