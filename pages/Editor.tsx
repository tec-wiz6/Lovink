
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ActivePartner, TextingTone, EmojiUsage, ClinginessLevel } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Save, Sparkles, Trash2 } from 'lucide-react';

interface Props {
  data: any; // Add data prop to find partner
  onSave: () => void;
}

const Editor: React.FC<Props> = ({ data, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const partnerId = new URLSearchParams(location.search).get('id');
  const partner = partnerId ? data.activePartners[partnerId] : null;

  if (!partner) return null;

  const [form, setForm] = useState({
    nickname: partner.nickname || '',
    tone: partner.customTone || partner.defaultTone,
    emoji: partner.customEmojiUsage || partner.defaultEmojiUsage,
    clinginess: partner.customClinginess || partner.defaultClinginess,
    interests: partner.customInterests || partner.interests
  });

  const handleSave = () => {
    storageService.updatePartner(partner.id, {
      nickname: form.nickname,
      customTone: form.tone,
      customEmojiUsage: form.emoji,
      customClinginess: form.clinginess,
      customInterests: form.interests
    });
    onSave();
    navigate(-1);
  };

  const handleDelete = () => {
    if (confirm("End this connection? Your history will be lost.")) {
      storageService.removePartner(partner.id);
      onSave();
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-pink-50 h-full overflow-hidden">
      <div className="p-4 flex items-center gap-4 bg-white border-b">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800 flex-1">Profile Design</h1>
        <button onClick={handleSave} className="bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
          <Save size={16} /> Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <label className="block text-xs font-bold text-pink-700 uppercase mb-3 tracking-widest flex items-center gap-2">
            <Sparkles size={14} /> Identity
          </label>
          <div className="bg-white p-4 rounded-3xl shadow-sm space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Nickname for you</p>
              <input 
                className="w-full p-3 rounded-xl border border-pink-100 bg-pink-50/20"
                placeholder="Darling, Babe..."
                value={form.nickname}
                onChange={e => setForm({...form, nickname: e.target.value})}
              />
            </div>
          </div>
        </section>

        <section>
          <label className="block text-xs font-bold text-pink-700 uppercase mb-3 tracking-widest">Texting Style</label>
          <div className="grid grid-cols-2 gap-3">
            {(['sweet', 'teasing', 'chaotic', 'formal', 'shy', 'confident'] as TextingTone[]).map(t => (
              <button
                key={t}
                onClick={() => setForm({...form, tone: t})}
                className={`p-3 rounded-2xl text-[11px] font-bold capitalize border-2
                  ${form.tone === t ? 'border-pink-500 bg-pink-500 text-white shadow-md' : 'border-white bg-white text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-xs font-bold text-pink-700 uppercase mb-3 tracking-widest">Emoji Intensity</label>
          <div className="bg-white p-2 rounded-2xl shadow-sm flex gap-1">
            {(['few', 'normal', 'heavy'] as EmojiUsage[]).map(e => (
              <button
                key={e}
                onClick={() => setForm({...form, emoji: e})}
                className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize
                  ${form.emoji === e ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400'}`}
              >
                {e === 'few' ? 'Minimal' : e}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-4 border-t border-pink-100">
          <button 
            onClick={handleDelete}
            className="w-full bg-white text-red-500 py-4 rounded-2xl font-bold border-2 border-red-50 hover:bg-red-50 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> End Connection
          </button>
        </section>
      </div>
    </div>
  );
};

export default Editor;
