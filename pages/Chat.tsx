
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocalStorageData, Message, ActivePartner } from '../types';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai';
import { MOCK_LIVE_USERS } from '../constants';
import { ArrowLeft, Send, MoreVertical, ShieldCheck, Flame } from 'lucide-react';

interface Props {
  data: LocalStorageData;
  onUpdate: () => void;
}

const Chat: React.FC<Props> = ({ data, onUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = data.userProfile?.theme === 'dark';
  const searchParams = new URLSearchParams(location.search);
  const partnerId = searchParams.get('id');
  const isLive = searchParams.get('live') === 'true';

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  let partner = partnerId ? data.activePartners[partnerId] : null;
  
  if (!partner && isLive && partnerId) {
    const template = MOCK_LIVE_USERS.find(u => u.id === partnerId);
    if (template) {
      partner = { ...template, nickname: '', memories: [] } as ActivePartner;
    }
  }

  const messages = partnerId ? storageService.getMessagesForPartner(partnerId) : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (partnerId && partner && !data.activePartners[partnerId]) {
      storageService.addActivePartner(partner);
      onUpdate();
    }
    
    if (messages.length === 0 && partner) {
      const startConversation = async () => {
        setIsTyping(true);
        const res = await aiService.chat({
          userProfile: data.userProfile!,
          partnerProfile: partner!,
          chatHistory: [],
          userMessage: "I'm here."
        });
        const msg: Message = {
          id: Date.now().toString(),
          partnerId: partner!.id,
          sender: 'partner',
          text: res.reply,
          timestamp: Date.now(),
          type: 'text'
        };
        storageService.addMessage(msg);
        setIsTyping(false);
        onUpdate();
      };
      startConversation();
    }
  }, [partnerId]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping || !partner) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      partnerId: partner.id,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      type: 'text'
    };

    storageService.addMessage(userMsg);
    if (!textOverride) setInput('');
    onUpdate();

    setIsTyping(true);
    
    const response = await aiService.chat({
      userProfile: data.userProfile!,
      partnerProfile: partner,
      chatHistory: [...messages, userMsg],
      userMessage: textToSend
    });

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      partnerId: partner.id,
      sender: 'partner',
      text: response.reply,
      timestamp: Date.now(),
      type: 'text'
    };

    storageService.addMessage(aiMsg);
    setIsTyping(false);
    onUpdate();
  };

  if (!partner) return null;

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-3 shadow-md z-10 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-50'}`}>
        <button onClick={() => navigate(-1)} className={`p-2 rounded-full ${isDark ? 'text-white hover:bg-slate-800' : 'text-black hover:bg-gray-100'}`}>
          <ArrowLeft size={24} />
        </button>
        <div className="relative">
          <img src={partner.imageUrl} className="w-10 h-10 rounded-full object-cover border-2 border-pink-400" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className={`font-black truncate leading-none mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{partner.name}</h2>
          <div className="flex items-center gap-1">
            <Flame size={10} className="text-orange-500 fill-orange-500" />
            <span className="text-[8px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full uppercase font-black tracking-widest">Connection Hot</span>
          </div>
        </div>
        <button onClick={() => navigate(`/editor?id=${partner?.id}`)} className="p-2 text-gray-400">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-10 custom-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-lg
              ${m.sender === 'user' 
                ? 'bg-pink-600 text-white rounded-tr-none' 
                : (isDark ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700' : 'bg-white text-slate-800 rounded-tl-none border border-pink-50')}`}
            >
              {m.text}
              <div className={`text-[8px] mt-2 flex justify-end opacity-40 font-bold`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`px-4 py-3 rounded-2xl flex gap-1.5 shadow-md border animate-pulse ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 border-t z-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className={`flex items-center gap-2 rounded-[28px] px-5 py-3 transition-all border
          ${isDark ? 'bg-slate-800 border-slate-700 focus-within:border-pink-500/50' : 'bg-gray-100 border-transparent focus-within:bg-white focus-within:border-pink-300'}`}>
          <input 
            className={`flex-1 bg-transparent py-1 text-sm focus:outline-none font-bold ${isDark ? 'text-white' : 'text-black'}`}
            placeholder={`Tease ${partner.name}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          {input.trim() && (
            <button onClick={() => handleSend()} className="text-pink-500 transition-transform active:scale-90">
              <Send size={22} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
