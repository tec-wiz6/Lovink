import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Vercel will pass (req, res) in Node runtime
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    const { mode } = req.body;

    if (mode === "community") {
      const { userProfile, partners, speakingPartner, messages } = req.body;

      const others = (partners || []).filter((p: any) => p.id !== speakingPartner.id);
      const systemPrompt = `
You are ${speakingPartner.name}, one of several romantic AI partners in a group chat in the Lovink app.
Other partners in this room: ${others.map((p: any) => p.name).join(", ")}.
You are a human-like romantic partner, not an assistant.
Reply only as ${speakingPartner.name}, 1–3 short WhatsApp-style messages.
Use emojis naturally, tease a bit, but keep it romantic and non-explicit.
`;

     const chatMessages = [
  { role: "system", content: systemPrompt },
  ...(messages || []).slice(-20).map((m: any) => {
    if (m.senderType === "user") {
      return { role: "user", content: m.text };
    }
    return {
      role: "assistant",
      content: m.text,
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ reply }));
    }

    // 1-to-1 chat (default)
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
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.9,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "I'm here 💗";

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ reply, updatedMemories: [] }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ reply: "hmm, something glitched for a sec 😅" }));
  }
}

