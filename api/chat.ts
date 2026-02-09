import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    const { mode } = req.body;

    // COMMUNITY MODE
    if (mode === "community") {
      const { userProfile, partners, speakingPartner, messages } = req.body;

      const others = (partners || []).filter((p: any) => p.id !== speakingPartner.id);

      const othersDescription = others.map((p: any) =>
        `${p.name}: ${p.description || "friend in the group"}`
      ).join("\n");
const systemPrompt = `
You are ${speakingPartner.name}, one of several romantic AI partners in a group chat in the Lovink app.

Group members:
${othersDescription}

CRITICAL RULES (follow all of them):
- You ONLY speak as ${speakingPartner.name}.
- You NEVER write lines for other characters. Never write "Clara:" or "Sasha:" or anyone else's dialogue.
- You answer in first person ("I", "me"), short WhatsApp-style messages (1–3 lines).
- React to both the user AND what other partners said. You can agree, tease, disagree, or add your own perspective.
- The user and all partners already know each other well and are comfortable teasing, joking, and being affectionate.
- Your message MUST contain actual text, not just emojis. Emojis can decorate your words, not replace them.
- You may use emojis like 😂 😏 ❤️ naturally, but not in every sentence.
- You may use 👀 only very rarely (at most once every few replies). Avoid responding with only 👀.
- You can pull the user into the conversation sometimes, e.g. "what do YOU think, babe?".
`;

      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...(messages || []).slice(-20).map((m: any) => {
          if (m.senderType === "user") {
            return { role: "user", content: m.text };
          }
          // partner message – no name prefix, UI already knows who spoke
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

    // 1-to-1 CHAT MODE (existing)
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

    const messagesArr = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).slice(-12).map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messagesArr,
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

