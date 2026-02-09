
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageData } from '../types';
import { User, Heart, MessageCircle, LogOut, Sparkles, TrendingUp, Compass, Moon, Sun } from 'lucide-react';
import { CHARACTER_TEMPLATES } from '../constants';

interface Props {
  data: LocalStorageData;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const Dashboard: React.FC<Props> = ({ data, onLogout, onToggleTheme }) => {
  const navigate = useNavigate();
  const userGender = data.userProfile?.gender || 'female';
  const isDark = data.userProfile?.theme === 'dark';
  
  const suggestedCompanions = CHARACTER_TEMPLATES.filter(c => {
    if (userGender === 'male') return c.gender === 'female';
    if (userGender === 'female') return c.gender === 'male';
    return true;
  }).slice(0, 4);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden transition-colors ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-6 flex justify-between items-center border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-50'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 overflow-hidden border border-pink-200">
            {data.userProfile?.profilePic ? (
              <img src={data.userProfile.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-pink-500 font-bold uppercase">
                {data.userProfile?.username.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>For You, {data.userProfile?.username}</h2>
            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Discovery Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className={`p-2 rounded-full ${isDark ? 'text-yellow-400 bg-slate-800' : 'text-slate-400 bg-gray-100'}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-400 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-1">Unleash Boldness</h3>
            <p className="text-xs text-white/90 max-w-[200px]">Real connections with companions who aren't afraid to tease.</p>
            <button 
              onClick={() => navigate('/gallery')}
              className="mt-5 bg-white text-pink-600 px-6 py-2.5 rounded-full text-xs font-black hover:scale-105 transition transform active:scale-95"
            >
              BROWSE COMPANIONS
            </button>
          </div>
          <Sparkles className="absolute -bottom-2 -right-2 text-white/10 w-40 h-40" />
        </div>

        {/* Featured Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-pink-500" />
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Daily Recommendations</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {suggestedCompanions.map(p => (
              <div 
                key={p.id}
                onClick={() => navigate(`/gallery`)}
                className={`group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg transform transition hover:-translate-y-1 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}
              >
                <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-black tracking-wide">{p.name}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[8px] bg-pink-500/30 backdrop-blur-md px-1.5 py-0.5 rounded-full font-bold">{p.tags[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Simulation */}
        <section className={`rounded-3xl p-5 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-indigo-50/50 border border-indigo-100'}`}>
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-indigo-900'}`}>Real-Time Discovery</h3>
             </div>
             <span className="text-[10px] font-bold text-indigo-400 uppercase">342 Online</span>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
             {suggestedCompanions.map(p => (
               <div key={p.id + 'live'} className="flex-shrink-0 flex flex-col items-center gap-2">
                 <div className="relative">
                   <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                 </div>
                 <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{p.name}</p>
               </div>
             ))}
           </div>
        </section>
      </div>

      {/* Navigation Bar */}
      <div className={`p-4 border-t flex justify-around items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 backdrop-blur-lg
        ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-gray-100'}`}>
        <button onClick={() => navigate('/dashboard')} className="text-pink-500 flex flex-col items-center gap-1 transition-transform active:scale-90">
          <Compass size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Explore</span>
        </button>
        <button onClick={() => navigate('/gallery')} className={`${isDark ? 'text-slate-500' : 'text-slate-300'} hover:text-pink-500 flex flex-col items-center gap-1 transition-transform active:scale-90`}>
          <Heart size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Gallery</span>
        </button>
        <button onClick={() => navigate('/messages')} className={`${isDark ? 'text-slate-500' : 'text-slate-300'} hover:text-pink-500 flex flex-col items-center gap-1 transition-transform active:scale-90`}>
          <MessageCircle size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Chats</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className={`${isDark ? 'text-slate-500' : 'text-slate-300'} hover:text-pink-500 flex flex-col items-center gap-1 transition-transform active:scale-90`}>
          <User size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">You</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
