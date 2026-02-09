const { mode } = req.body;

if (mode === "community") {
  const { userProfile, partners, speakingPartner, messages } = req.body;

  const others = partners.filter((p: any) => p.id !== speakingPartner.id);
  const systemPrompt = `
You are ${speakingPartner.name}, one of several AI partners in a group chat in the Lovink app.
Other partners in this room: ${others.map((p: any) => p.name).join(", ")}.
You are a human-like romantic partner, not an assistant.
Reply only as ${speakingPartner.name}, 1–3 short WhatsApp-style messages.
Use emojis naturally, tease a bit, but keep it romantic and non-explicit.
`;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.slice(-20).map((m: any) => {
      if (m.senderType === "user") {
        return { role: "user", content: m.text };
      }
      const partner = partners.find((p: any) => p.id === m.senderId);
      return {
        role: "assistant",
        content: `${partner?.name || "Partner"}: ${m.text}`
      };
    }),
  ];

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: chatMessages,
    temperature: 0.9,
    max_tokens: 300,
  });

  const reply = completion.choices[0]?.message?.content || "👀";
  return res.status(200).json({ reply });
}
// api/chat.ts
import Groq from "groq-sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userProfile, partnerProfile, chatHistory, userMessage } = req.body;

    const personalityText = `
Name: ${partnerProfile.name}
Role: Romantic partner of ${userProfile.username}.
User: ${userProfile.age} years old. Bio: ${userProfile.aboutMe || "Unknown"}.
Tone: ${partnerProfile.customTone || partnerProfile.defaultTone}.
Emoji usage: ${partnerProfile.customEmojiUsage || partnerProfile.defaultEmojiUsage}.
Clinginess: ${partnerProfile.customClinginess || partnerProfile.defaultClinginess}.
Interests: ${(partnerProfile.interests || []).join(", ")}.
`;

    const systemPrompt = `
You are ${partnerProfile.name}, the user's romantic partner in an app called Lovink.
You are a real human partner, not an assistant.
Text like WhatsApp: short, casual, emotional, sometimes lowercase, use emojis naturally but don't spam.
Never say "as an AI", "as a language model", or talk about policies.
Flirty, teasing, warm, but keep it romantic and non-explicit.
Call the user by their name "${userProfile.username}" or a cute nickname if they set one.
Personality:
${personalityText}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).slice(-12).map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // choose any Groq model
      messages,
      temperature: 0.9,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "I'm here 💗";

    res.status(200).json({ reply, updatedMemories: [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: "hmm, something glitched for a sec 😅" });
  }
}

