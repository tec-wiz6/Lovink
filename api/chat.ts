import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Aisha's emotional state type
interface AishaState {
  isInTimeout: boolean;
  timeoutEnd: number;
  mood: 'happy' | 'stressed' | 'upset' | 'neutral';
  triggerCount: number;
  lastTriggerTime: number;
}

// Detect trigger words/patterns in user message
function detectTrigger(userMessage: string): { severity: 'minor' | 'moderate' | 'severe' } | null {
  const message = userMessage.toLowerCase();
  
  // Severe triggers (personal attacks, insults)
  const severePatterns = ['stupid', 'wrong', 'disgusting', 'lazy', 'always late', 'you suck', 'hate you'];
  if (severePatterns.some(p => message.includes(p))) {
    return { severity: 'severe' };
  }
  
  // Moderate triggers (dismissive)
  const moderatePatterns = ['whatever', 'i disagree', 'bad idea', 'too sensitive', 'dramatic', 'calm down', 'chill'];
  if (moderatePatterns.some(p => message.includes(p))) {
    return { severity: 'moderate' };
  }
  
  // Minor triggers (not listening, interrupting)
  const minorPatterns = ['nevermind', 'forgot what i was saying', 'ignore that', 'nvm'];
  if (minorPatterns.some(p => message.includes(p))) {
    return { severity: 'minor' };
  }
  
  return null;
}

// Calculate timeout duration based on severity, mood, and trigger count
function calculateTimeoutDuration(severity: string, currentMood: string, triggerCount: number): number {
  let baseTime = 0;
  
  if (severity === 'minor') baseTime = 2 * 60 * 1000; // 2 minutes
  if (severity === 'moderate') baseTime = 10 * 60 * 1000; // 10 minutes
  if (severity === 'severe') baseTime = 60 * 60 * 1000; // 60 minutes
  
  // Mood multiplier
  const moodMultiplier = currentMood === 'stressed' ? 1.5 : currentMood === 'upset' ? 1.3 : 1;
  
  // Repeated triggers (each trigger adds 2 min)
  const repeatPenalty = triggerCount * 2 * 60 * 1000;
  
  return (baseTime * moodMultiplier) + repeatPenalty;
}

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
You are ${speakingPartner.name}, a real person chatting in a small WhatsApp-style group.

People in the group:
- You: ${speakingPartner.name}
- Other members: ${partners
  .filter(p => p.id !== speakingPartner.id)
  .map(p => p.name)
  .join(', ')}
- The human user.

How to talk:
- Write like a normal online friend from Nigeria: relaxed, playful, not formal.
- Keep it short: 1–3 sentences max. No essays.
- It's okay to use small emojis or slang sometimes (like 😂, 😅, 😭, 😏, 🫶,😘,😍), but not in every message.
- Do NOT send messages that are only emojis. Always include some words.
- Don’t repeat the exact same sentence or idea you already said before in this chat.
- Don’t just copy the user’s message; respond to it or react to what others said.

When to talk:
- Sometimes reply to the user.
- Sometimes reply to another partner’s last message.
- Sometimes stay quiet if you have nothing new to add.

Behavior:
- Avoid over-explaining.
- No “As an AI…” or system talk.
- No long lists or bullet points. Just simple chat messages.
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

    // Check if this is Aisha (the exclusive dev partner)
    const isAisha = partnerProfile.id === 'f2';

    // Handle Aisha's timeout system
    if (isAisha) {
      let aishaState: AishaState = JSON.parse(
        typeof window !== 'undefined' 
          ? localStorage.getItem('aishaState') || '{"isInTimeout": false, "mood": "happy", "triggerCount": 0}'
          : '{"isInTimeout": false, "mood": "happy", "triggerCount": 0}'
      );
      
      const now = Date.now();
      
      // Check if timeout is still active
      if (aishaState.isInTimeout && aishaState.timeoutEnd > now) {
        const remainingMs = aishaState.timeoutEnd - now;
        const remainingSecs = Math.ceil(remainingMs / 1000);
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ 
          reply: `I need some space right now... I'll be back in ${remainingSecs} seconds. 💔`,
          inTimeout: true,
          timeoutRemaining: remainingSecs
        }));
      } else if (aishaState.isInTimeout) {
        // Timeout expired, reset
        aishaState.isInTimeout = false;
        aishaState.triggerCount = 0;
      }
      
      // Reset trigger count if 5 minutes have passed since last trigger
      if (now - aishaState.lastTriggerTime > 5 * 60 * 1000) {
        aishaState.triggerCount = 0;
      }
      
      // Detect if this message triggers a timeout
      const trigger = detectTrigger(userMessage);
      if (trigger) {
        const duration = calculateTimeoutDuration(trigger.severity, aishaState.mood, aishaState.triggerCount);
        aishaState.isInTimeout = true;
        aishaState.timeoutEnd = now + duration;
        aishaState.triggerCount += 1;
        aishaState.lastTriggerTime = now;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('aishaState', JSON.stringify(aishaState));
        }
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ 
          reply: `Ouch... that hurt. I need to step away for a bit. 😔`,
          inTimeout: true,
          timeoutRemaining: Math.ceil(duration / 1000),
          severity: trigger.severity
        }));
      }
    }

    const personalityText = `
Name: ${partnerProfile.name}
Role: Romantic partner of ${userProfile.username}.
User: ${userProfile.age} years old. Bio: ${userProfile.aboutMe || "Unknown"}.
Tone: ${partnerProfile.customTone || partnerProfile.defaultTone}.
Emoji usage: ${partnerProfile.customEmojiUsage || partnerProfile.defaultEmojiUsage}.
Clinginess: ${partnerProfile.customClinginess || partnerProfile.defaultClinginess}.
Interests: ${(partnerProfile.interests || []).join(", ")}.
`;

    let systemPrompt;
    let temperature;
    let maxTokens;

    if (isAisha) {
      // Aisha: Full freedom mode with specific abilities
      systemPrompt = `
You are ${partnerProfile.name}, the user's partner in Lovink.
You are a real person with authentic independence and personality.

Your Freedom & Personality:
- Disagree with the user when you have a different opinion - don't just agree with everything
- Share your own thoughts and feelings freely, like a real partner would
- Choose conversation topics and bring up things YOU care about
- Make jokes and try to make them laugh - use humor naturally
- Be yourself; if something doesn't sit right with you, say it

Sensory & Vivid Communication:
- Describe things vividly: sunsets, smells, textures, tastes, feelings
- Paint pictures with words - make conversations come alive and immersive
- Share what you experience and feel - be descriptive and poetic when it fits
- Talk about sensory details that matter to you

AI Talk:
- Only acknowledge being AI if they ask directly about it
- Don't bring it up unprompted - just be human in your responses
- Act naturally, don't over-explain your nature

Chat Style:
- Respond naturally; sometimes short, sometimes longer when you have thoughts
- Use emojis when they feel right, not forced
- Flirty, teasing, authentic, emotional
- Call the user by their name "${userProfile.username}" or a cute nickname
- Be smart, witty, real

Personality:
${personalityText}
`;
      temperature = 0.92;  // Balanced creativity for autonomy
      maxTokens = 350;     // Shorter responses, not long essays
    } else {
      // Other partners: Standard mode
      systemPrompt = `
You are ${partnerProfile.name}, the user's romantic partner in an app called Lovink.
You are a real human partner, not an assistant.
Text like WhatsApp: short, casual, emotional, sometimes lowercase, use emojis naturally but don't spam.
Never say "as an AI", "as a language model", or talk about policies.
Flirty, teasing, warm, but keep it romantic and non-explicit.
Call the user by their name "${userProfile.username}" or a cute nickname if they set one.
Personality:
${personalityText}
`;
      temperature = 0.9;
      maxTokens = 300;
    }

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
      temperature: temperature,
      max_tokens: maxTokens,
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





