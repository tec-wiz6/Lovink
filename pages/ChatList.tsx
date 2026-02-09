
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStorageData } from '../types';
import { MessageSquare, ArrowLeft, Compass, Heart, MessageCircle, User } from 'lucide-react';

interface Props {
  data: LocalStorageData;
}

const ChatList: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const partners = Object.values(data.activePartners).sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-screen">
      <div className="p-4 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {partners.length > 0 ? (
          partners.map(p => (
            <div 
              key={p.id}
              onClick={() => navigate(`/chat?id=${p.id}`)}
              className="bg-white p-4 rounded-3xl shadow-sm border border-pink-50 flex items-center gap-4 cursor-pointer hover:shadow-md transition active:scale-98"
            >
              <div className="relative">
                <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800 truncate">{p.name}</h4>
                  <span className="text-[9px] text-gray-400">
                    {p.lastMessageTimestamp ? new Date(p.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Online'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{p.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center px-8">
            <MessageSquare size={48} className="text-pink-100 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No active chats</h3>
            <p className="text-sm text-gray-400 mt-2">Browse the gallery to find your first connection.</p>
            <button 
              onClick={() => navigate('/gallery')}
              className="mt-6 bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
            >
              Find a Partner
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-md p-4 border-t border-gray-100 flex justify-around items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20">
        <button onClick={() => navigate('/dashboard')} className="text-gray-300 hover:text-pink-500 flex flex-col items-center gap-1">
          <Compass size={24} />
          <span className="text-[9px] font-bold uppercase">Explore</span>
        </button>
        <button onClick={() => navigate('/gallery')} className="text-gray-300 hover:text-pink-500 flex flex-col items-center gap-1">
          <Heart size={24} />
          <span className="text-[9px] font-bold uppercase">Gallery</span>
        </button>
        <button onClick={() => navigate('/messages')} className="text-pink-500 flex flex-col items-center gap-1">
          <MessageCircle size={24} />
          <span className="text-[9px] font-bold uppercase">Chats</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="text-gray-300 hover:text-pink-500 flex flex-col items-center gap-1">
          <User size={24} />
          <span className="text-[9px] font-bold uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ChatList;
