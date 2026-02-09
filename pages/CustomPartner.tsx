
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/ai';
import { storageService } from '../services/storage';
import { ArrowLeft, Camera, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { ClinginessLevel, EmojiUsage, TextingTone } from '../types';

const CustomPartner: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    const result = await aiService.analyzePartnerImage(image);
    setProfile(result);
    setIsAnalyzing(false);
  };

  const handleCreate = () => {
    if (!profile || !image) return;
    // Fix: Using addActivePartner instead of non-existent setActivePartner
    storageService.addActivePartner({
      id: 'custom_' + Date.now(),
      name: profile.suggestedName,
      gender: 'other', // User can change this in editor
      description: profile.bio,
      tags: profile.traits,
      defaultTone: 'sweet',
      defaultEmojiUsage: 'normal',
      defaultClinginess: 'medium',
      interests: ['Art', 'Photography'],
      imageUrl: image,
      nickname: '',
      memories: []
    });
    navigate('/chat');
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      <div className="p-4 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800">Create Custom</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {!image ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-pink-100 rounded-3xl bg-pink-50/30 relative">
            <Camera size={48} className="text-pink-200 mb-4" />
            <p className="text-pink-400 font-bold text-sm">Upload a portrait</p>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square">
              <img src={image} className="w-full h-full object-cover" alt="Custom partner" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
              >
                Change
              </button>
            </div>

            {!profile ? (
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                {isAnalyzing ? "Analyzing Vibes..." : "Analyze with Vision AI"}
              </button>
            ) : (
              <div className="bg-pink-50 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-pink-600 font-bold">
                  <Sparkles size={18} /> Vision Insights
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{profile.suggestedName}</h3>
                  <div className="flex gap-2 mt-2">
                    {profile.traits.map((t: string) => (
                      <span key={t} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-pink-500 shadow-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">"{profile.bio}"</p>
                <button 
                  onClick={handleCreate}
                  className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-pink-600 transition mt-4"
                >
                  Bring them to life
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPartner;
