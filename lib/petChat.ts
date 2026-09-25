import { PetType, PetMood, petTypes } from '@/data/petData';

export interface ChatContext {
  name: string;
  type: PetType;
  mood: PetMood;
  level: number;
  stats: { happiness: number; hunger: number; energy: number; health: number };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** A little species sound dropped into replies, e.g. "*chirp*" for a bird. */
function soundTag(type: PetType): string {
  return `*${pick(petTypes[type].sounds)}*`;
}

interface Rule {
  test: (text: string) => boolean;
  reply: (ctx: ChatContext) => string;
}

const rules: Rule[] = [
  {
    test: t => /\b(hi|hii|hey|hello|namaste|yo)\b/.test(t),
    reply: ctx => pick([
      `${soundTag(ctx.type)} Hi there! I'm so happy you're here!`,
      `Hey you! I was hoping you'd visit today.`,
      `${soundTag(ctx.type)} Hello hello! What are we up to today?`,
    ]),
  },
  {
    test: t => /how are you|kaise ho|how do you feel/.test(t),
    reply: ctx => {
      if (ctx.mood === 'sick') return `Honestly? Not my best day. My health is a little low — could you clean me up? 🤒`;
      if (ctx.mood === 'hungry') return `My tummy's rumbling a bit! ${soundTag(ctx.type)} Feed me and I'll feel amazing.`;
      if (ctx.mood === 'tired') return `Kinda sleepy... ${soundTag(ctx.type)} a nap sounds perfect right now.`;
      if (ctx.mood === 'lonely') return `A little lonely, if I'm honest. I missed playing with you!`;
      if (ctx.mood === 'ecstatic') return `Best. Day. Ever! ${soundTag(ctx.type)} Thanks for taking such good care of me!`;
      return `Pretty good! ${soundTag(ctx.type)} Even better now that you're here.`;
    },
  },
  {
    test: t => /love you|i love|miss you/.test(t),
    reply: ctx => pick([
      `${soundTag(ctx.type)} Aww, I love you too — more than treats, and that's saying a lot!`,
      `You just made my whole day. ${soundTag(ctx.type)}`,
      `My heart just did a little happy hop. I adore you too!`,
    ]),
  },
  {
    test: t => /hungry|feed|food|eat|snack/.test(t),
    reply: ctx =>
      ctx.stats.hunger < 50
        ? `${soundTag(ctx.type)} Yes please! My favorite is ${petTypes[ctx.type].favoriteFood.toLowerCase()}. Head to Care to feed me!`
        : `I'm pretty full right now, but I'll never say no to a little snack later!`,
  },
  {
    test: t => /play|bored|game|fun/.test(t),
    reply: ctx =>
      ctx.stats.energy < 25
        ? `I'd love to, but I'm a bit tired first. Let me rest, then let's ${petTypes[ctx.type].favoriteActivity.toLowerCase()}!`
        : `${soundTag(ctx.type)} Yes! I love ${petTypes[ctx.type].favoriteActivity.toLowerCase()}. Let's go to Play!`,
  },
  {
    test: t => /sleep|tired|nap|rest/.test(t),
    reply: () => pick([
      `A cozy nap does sound wonderful right now.`,
      `Mmm... just five more minutes...`,
      `Sleep is basically my second favorite thing, after you.`,
    ]),
  },
  {
    test: t => /sad|upset|cry|down|bad day/.test(t),
    reply: ctx => pick([
      `I'm sorry you're feeling that way. I'm right here with you. ${soundTag(ctx.type)}`,
      `Sending you the biggest snuggle right now. You matter to me.`,
      `Bad days happen. Want to log how you're feeling in the mood tracker? It helps me help you.`,
    ]),
  },
  {
    test: t => /good (boy|girl|job)|proud|well done|amazing/.test(t),
    reply: ctx => `${soundTag(ctx.type)} That means everything coming from you! Level ${ctx.level} and still growing, thanks to you.`,
  },
  {
    test: t => /who are you|your name|what are you/.test(t),
    reply: ctx => `I'm ${ctx.name}, your ${petTypes[ctx.type].personality.toLowerCase()} ${petTypes[ctx.type].name.toLowerCase()}! ${soundTag(ctx.type)}`,
  },
  {
    test: t => /thank/.test(t),
    reply: () => pick([
      `You're so welcome! That's what I'm here for.`,
      `Anytime! Taking care of each other is what we do best.`,
    ]),
  },
  {
    test: t => /bye|goodbye|see you|later/.test(t),
    reply: ctx => pick([
      `${soundTag(ctx.type)} Bye for now! I'll be right here waiting.`,
      `See you soon! Don't forget to check in on me later.`,
    ]),
  },
  {
    test: t => /walk|trail|outside|park/.test(t),
    reply: () => `I would LOVE a walk! Check Nearby Trails on the Home screen and let's explore together.`,
  },
  {
    test: t => /trick|jump|dance/.test(t),
    reply: ctx => `${soundTag(ctx.type)} Watch this! *does a little spin* Did that count as a trick?`,
  },
];

const fallbackByMood: Record<PetMood, string[]> = {
  ecstatic: ["Life is great when you're around!", 'Everything feels extra wonderful today!'],
  hungry: ["I could really go for a snack about now...", 'My tummy is doing the talking today.'],
  tired: ['Everything sounds better after a little nap.', 'Just soaking up some cozy time.'],
  sick: ["I'm not feeling 100%... a little extra care would help.", 'A bit under the weather today.'],
  lonely: ["I've just been waiting for you to stop by.", 'It gets quiet here without you.'],
  content: ["Just enjoying a nice, quiet moment with you.", "Life's good — what's on your mind?"],
};

/** Rule-based, fully offline reply generator — no external API required. */
export function getPetReply(userText: string, ctx: ChatContext): string {
  const normalized = userText.toLowerCase().trim();
  for (const rule of rules) {
    if (rule.test(normalized)) {
      return rule.reply(ctx);
    }
  }
  return pick(fallbackByMood[ctx.mood]);
}
