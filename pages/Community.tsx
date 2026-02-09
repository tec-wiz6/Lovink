import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageData, CommunityMessage, ActivePartner } from '../types';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai';
import { ArrowLeft, Send } from 'lucide-react';

interface Props {
  data: LocalStorageData;
  onUpdate: () => void;
}

const Community: React.FC<Props> = ({ data, onUpdate }) => {
  const navigate = useNavigate();
  const isDark = data.userProfile?.theme === 'dark';
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const partners: ActivePartner[] = Object.values(data.activePartners || {});
  const messages = storageService.getCommunityMessages();

  // auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // initial: they start talking even if you say nothing
  useEffect(() => {
    if (!data.userProfile || partners.length === 0) return;

    const existing = storageService.getCommunityMessages();
    if (existing.length > 0) return;

    const start = async () => {
      const partner = partners[Math.floor(Math.random() * partners.length)];
      setIsTyping(true);
      const response = await aiService.communityChat({
        userProfile: data.userProfile!,
        partners,
        speakingPartner: partner,
        messages: [],
      });
      const aiMsg: CommunityMessage = {
        id: Date.now().toString(),
        senderType: 'partner',
        senderId: partner.id,
        text: response.reply,
        timestamp: Date.now(),
      };
      storageService.addCommunityMessage(aiMsg);
      setIsTyping(false);
      onUpdate();
    };

    start();
  }, [data.userProfile, partners.length]);

  // interval: they gist every X seconds
  useEffect(() => {
    if (!data.userProfile || partners.length === 0) return;

    const interval = setInterval(async () => {
      if (isTyping) return;

      const currentMessages = storageService.getCommunityMessages();
      if (currentMessages.length === 0) return;

      const partner = partners[Math.floor(Math.random() * partners.length)];

      setIsTyping(true);

      const response = await aiService.communityChat({
        userProfile: data.userProfile!,
        partners,
        speakingPartner: partner,
        messages: currentMessages,
      });

      const aiMsg: CommunityMessage = {
        id: Date.now().toString(),
        senderType: 'partner',
        senderId: partner.id,
        text: response.reply,
        timestamp: Date.now(),
      };

      storageService.addCommunityMessage(aiMsg);
      setIsTyping(false);
      onUpdate();
    }, 20000); // every 20s – adjust if you want

    return () => clearInterval(interval);
  }, [data.userProfile, partners.length, isTyping]);

 const handleSend = async () => {
  const textToSend = input.trim();
  if (!textToSend || isTyping || !data.userProfile || partners.length === 0) return;

  const userMsg: CommunityMessage = {
    id: Date.now().toString(),
    senderType: 'user',
    senderId: 'user',
    text: textToSend,
    timestamp: Date.now()
  };
  storageService.addCommunityMessage(userMsg);
  setInput('');
  onUpdate();

  const lower = textToSend.toLowerCase();

  // check if it's a question to everyone
  const broadcast = lower.includes("you all") || lower.includes("all of you") || lower.includes("everyone");

  setIsTyping(true);

  if (broadcast) {
    // pick up to 3 random distinct partners
    const shuffled = [...partners].sort(() => Math.random() - 0.5);
    const responders = shuffled.slice(0, Math.min(3, partners.length));

    for (const partner of responders) {
      const response = await aiService.communityChat({
        userProfile: data.userProfile!,
        partners,
        speakingPartner: partner,
        messages: [...messages, userMsg],
      });

      const aiMsg: CommunityMessage = {
        id: (Date.now() + Math.random()).toString(),
        senderType: 'partner',
        senderId: partner.id,
        text: response.reply,
        timestamp: Date.now(),
      };
      storageService.addCommunityMessage(aiMsg);
      onUpdate();
    }

    setIsTyping(false);
    return;
  }

  // normal single-partner reply (by name or random)
  let partner: ActivePartner | undefined = partners.find(p =>
    lower.includes(p.name.toLowerCase())
  );
  if (!partner) {
    partner = partners[Math.floor(Math.random() * partners.length)];
  }

  const response = await aiService.communityChat({
    userProfile: data.userProfile!,
    partners,
    speakingPartner: partner!,
    messages: [...messages, userMsg]
  });

  const aiMsg: CommunityMessage = {
    id: (Date.now() + 1).toString(),
    senderType: 'partner',
    senderId: partner!.id,
    text: response.reply,
    timestamp: Date.now()
  };
  storageService.addCommunityMessage(aiMsg);
  setIsTyping(false);
  onUpdate();
};


  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-50'}`}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-black">Community Room</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
        {messages.map(m => {
          const partner = partners.find(p => p.id === m.senderId);
          const isUser = m.senderType === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow
                ${isUser ? 'bg-pink-600 text-white' : (isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800')}`}>
                {!isUser && partner && (
                  <div className="text-[10px] font-bold mb-1 opacity-70">
                    {partner.name}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`px-4 py-3 rounded-2xl flex gap-1.5 shadow-md border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2 rounded-[28px] px-5 py-3 border">
          <input
            className={`flex-1 bg-transparent py-1 text-sm focus:outline-none font-bold ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Say something to the room..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          {input.trim() && (
            <button onClick={handleSend} className="text-pink-500">
              <Send size={22} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;

