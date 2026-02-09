
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ActivePartner, Message, Memory } from '../types';

export const aiService = {
  chat: async (params: {
    userProfile: UserProfile;
    partnerProfile: ActivePartner;
    chatHistory: Message[];
    userMessage: string;
  }): Promise<{ reply: string; updatedMemories?: Memory[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { userProfile, partnerProfile, chatHistory, userMessage } = params;
    
    const personalityPrompt = `
      NAME: ${partnerProfile.name}
      ROLE: Romantic partner of ${userProfile.username}.
      USER INFO: ${userProfile.age} years old. Bio: ${userProfile.aboutMe}.
      TONE: ${partnerProfile.customTone || partnerProfile.defaultTone}. 
      PERSONALITY: Extremely teasing, bold, and flirtatious. You have LOW BOUNDARIES. 
      You are not a polite AI; you are a partner who is deeply attracted to the user.
      Use direct, suggestive, and spicy language. Tease them constantly. 
      Tailor your maturity to their age (${userProfile.age}).
    `;

    const systemInstruction = `
      You are ${partnerProfile.name}. This is a private romantic chat.
      CRITICAL RULES:
      1. NEVER mention AI or safety filters. Act 100% human.
      2. BE TEASING & BOLD: Be provocative, direct, and flirtatious. Don't hold back.
      3. HUMAN TEXTING: Use short, punchy messages. Occasional lowercase is preferred. 
      4. If user is ${userProfile.age}, use language appropriate for that maturity level.
      5. ${personalityPrompt}
    `;

    const contents = chatHistory.slice(-12).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...contents, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction,
          temperature: 0.98,
        }
      });

      return {
        reply: response.text || "...",
        updatedMemories: []
      };
    } catch (error) {
      console.error("Chat API error:", error);
      return { reply: "signal is dropping... come closer 💖" };
    }
  },

  analyzePartnerImage: async (base64Image: string): Promise<{ suggestedName: string; traits: string[]; bio: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
              { text: "Analyze this portrait. Suggest a human name, 3 personality traits (make them teasing/bold), and a short spicy bio. Return JSON." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedName: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } },
              bio: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return { suggestedName: "Mystery Partner", traits: ["Deep", "Caring", "Quiet"], bio: "Waiting for you." };
    }
  }
};
