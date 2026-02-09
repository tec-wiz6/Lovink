import { UserProfile, ActivePartner, Message, Memory, CommunityMessage } from '../types';

export const aiService = {
  chat: async (params: {
    userProfile: UserProfile;
    partnerProfile: ActivePartner;
    chatHistory: Message[];
    userMessage: string;
  }): Promise<{ reply: string; updatedMemories?: Memory[] }> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error("Chat failed");
      }

      const data = await res.json();
      return {
        reply: data.reply || "hey, i'm here 💕",
        updatedMemories: data.updatedMemories || [],
      };
    } catch (error) {
      console.error("Chat API error:", error);
      return { reply: "signal is dropping... come closer 💖" };
    }
  },

  communityChat: async (params: {
    userProfile: UserProfile;
    partners: ActivePartner[];
    speakingPartner: ActivePartner;
    messages: CommunityMessage[];
  }): Promise<{ reply: string }> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "community",
          userProfile: params.userProfile,
          partners: params.partners,
          speakingPartner: params.speakingPartner,
          messages: params.messages,
        }),
      });

      if (!res.ok) {
        throw new Error("Community chat failed");
      }

      const data = await res.json();
      return { reply: data.reply || "..." };
    } catch (error) {
      console.error("Community Chat API error:", error);
      return { reply: "group chat glitched for a sec 😅" };
    }
  },

  analyzePartnerImage: async (base64Image: string): Promise<{ suggestedName: string; traits: string[]; bio: string }> => {
    // temporary dummy; you can wire a vision route later
    return {
      suggestedName: "Mystery Partner",
      traits: ["Deep", "Caring", "Playful"],
      bio: "Waiting to get to know you better.",
    };
  }
};
