import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Simple emoji-only checker
  const isEmojiOnly = useCallback((text?: string): boolean => {
    if (!text) return true;
    const trimmed = text.trim();
    if (!trimmed) return true;
    const emojiPattern =
      /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s\t\n\r]+$/u;
    return emojiPattern.test(trimmed);
  }, []);

  // auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // initial: only 1 partner greets ONCE on desktop, never on mobile
  useEffect(() => {
    if (isMobile) return;
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

      const clean = (response.reply || '').replace(/👀/g, '').trim();
      if (!clean) {
        setIsTyping(false);
        return;
      }

      const aiMsg: CommunityMessage = {
        id: Date.now().toString(),
        senderType: 'partner',
        senderId: partner.id,
        text: clean,
        timestamp: Date.now(),
      };
      storageService.addCommunityMessage(aiMsg);
      setIsTyping(false);
      onUpdate();
    };

    start();
  }, [data.userProfile, partners.length, isMobile]);

  // interval: natural replies only after recent user message
  useEffect(() => {
    if (isMobile) return;
    if (!data.userProfile || partners.length === 0) return;

    const interval = setInterval(async () => {
      if (isTyping) return;

      const currentMessages = storageService.getCommunityMessages();
      if (currentMessages.length === 0) return;

      const last = currentMessages[currentMessages.length - 1];

      // Only react if last message was from user
      if (!last || last.senderType !== 'user') return;

      // Only if last message is recent (e.g. last 40s)
      const now = Date.now();
      if (now - last.timestamp > 40_000) return;

      // Skip emoji-only messages
      if (isEmojiOnly(last.text)) return;

      // Decide how many partners reply (0–3) for natural feel
      const chance = Math.random();
      let maxReplies = 0;
      if (chance < 0.45) maxReplies = 1;       // 45% -> 1 reply
      else if (chance < 0.8) maxReplies = 2;   // 35% -> 2 replies
      else maxReplies = 3;                     // 20% -> 3 replies

      if (maxReplies === 0) return;

      const shuffled = [...partners].sort(() => Math.random() - 0.5);
      const responders = shuffled.slice(0, Math.min(maxReplies, partners.length));

      setIsTyping(true);

      for (const partner of responders) {
        const response = await aiService.communityChat({
          userProfile: data.userProfile!,
          partners,
          speakingPartner: partner,
          messages: currentMessages,
        });

        const clean = (response.reply || '').replace(/👀/g, '').trim();
        if (!clean || isEmojiOnly(clean)) continue;

        const aiMsg: CommunityMessage = {
          id: (Date.now() + Math.random()).toString(),
          senderType: 'partner',
          senderId: partner.id,
          text: clean,
          timestamp: Date.now(),
        };

        storageService.addCommunityMessage(aiMsg);
        onUpdate();
      }

      setIsTyping(false);
    }, 5000); // check every 5s

    return () => clearInterval(interval);
  }, [data.userProfile, partners.length, isTyping, isMobile, isEmojiOnly]);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isTyping || !data.userProfile || partners.length === 0) return;

    const userMsg: CommunityMessage = {
      id: Date.now().toString(),
      senderType: 'user',
      senderId: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };
    storageService.addCommunityMessage(userMsg);
    setInput('');
    onUpdate();

    const lower = textToSend.toLowerCase();

    // check if it's a question to everyone
    const broadcast =
      lower.includes('you all') ||
      lower.includes('all of you') ||
      lower.includes('everyone');

    // Base responders list
    let primary: ActivePartner | undefined = partners.find(p =>
      lower.includes(p.name.toLowerCase()),
    );
    if (!primary) {
      primary = partners[Math.floor(Math.random() * partners.length)];
    }

    let responders: ActivePartner[] = [];

    if (broadcast) {
      // 2–4 responders for explicit broadcast
      const shuffled = [...partners].sort(() => Math.random() - 0.5);
      const max = Math.min(4, partners.length);
      const min = Math.min(2, partners.length);
      const total = Math.max(min, Math.floor(Math.random() * max) + 1);
      responders = shuffled.slice(0, total);
    } else {
      // Normal: 1–2 responders max
      responders = [primary!];
      const chance = Math.random();
      if (chance < 0.3 && partners.length > 1) {
        const extra = partners
          .filter(p => p.id !== primary!.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 1);
        responders.push(...extra);
      }
    }

    setIsTyping(true);

    for (const p of responders) {
      const response = await aiService.communityChat({
        userProfile: data.userProfile!,
        partners,
        speakingPartner: p,
        messages: [...messages, userMsg],
      });

      const clean = (response.reply || '').replace(/👀/g, '').trim();
      if (!clean || isEmojiOnly(clean)) continue;

      const aiMsg: CommunityMessage = {
        id: (Date.now() + Math.random()).toString(),
        senderType: 'partner',
        senderId: p.id,
        text: clean,
        timestamp: Date.now(),
      };
      storageService.addCommunityMessage(aiMsg);
      onUpdate();
    }

    setIsTyping(false);
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden ${
        isDark ? 'bg-slate-950' : 'bg-slate-50'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center gap-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-50'
        }`}
      >
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
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm shadow ${
                  isUser
                    ? 'bg-pink-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-white text-slate-800'
                }`}
              >
                {!isUser && partner && (
                  <div className="text-[10px] font-bold mb-1 opacity-70">{partner.name}</div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-3 rounded-2xl flex gap-1.5 shadow-md border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'
              }`}
            >
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className={`p-4 border-t ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex items-center gap-2 rounded-[28px] px-4 py-3 border w-full flex-wrap">
          <input
            className={`chat-input flex-1 bg-transparent py-1 text-base focus:outline-none font-bold ${
              isDark ? 'text-white' : 'text-black'
            }`}
            placeholder="Say something to the room..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (window.innerWidth <= 768) {
                  e.preventDefault(); // mobile: don't send
                } else {
                  e.preventDefault();
                  handleSend(); // desktop: send
                }
              }
            }}
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
