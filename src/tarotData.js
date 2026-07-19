// ============================================================
// Local Rider-Waite-Smith card images (public/cards/)
// ============================================================

// ── Major Arcana image map ─────────────────────────────────────────────────
const MAJOR_IMGS = [
  "/cards/00-TheFool.png",
  "/cards/01-TheMagician.png",
  "/cards/02-TheHighPriestess.png",
  "/cards/03-TheEmpress.png",
  "/cards/04-TheEmperor.png",
  "/cards/05-TheHierophant.png",
  "/cards/06-TheLovers.png",
  "/cards/07-TheChariot.png",
  "/cards/08-Strength.png",
  "/cards/09-TheHermit.png",
  "/cards/10-WheelOfFortune.png",
  "/cards/11-Justice.png",
  "/cards/12-TheHangedMan.png",
  "/cards/13-Death.png",
  "/cards/14-Temperance.png",
  "/cards/15-TheDevil.png",
  "/cards/16-TheTower.png",
  "/cards/17-TheStar.png",
  "/cards/18-TheMoon.png",
  "/cards/19-TheSun.png",
  "/cards/20-Judgement.png",
  "/cards/21-TheWorld.png",
];

// ── Minor Arcana image map ─────────────────────────────────────────────────
const SUIT_FILENAMES = {
  Wands:     ["Wands01","Wands02","Wands03","Wands04","Wands05","Wands06","Wands07",
               "Wands08","Wands09","Wands10","Wands11","Wands12","Wands13","Wands14"],
  Cups:      ["Cups01","Cups02","Cups03","Cups04","Cups05","Cups06","Cups07",
               "Cups08","Cups09","Cups10","Cups11","Cups12","Cups13","Cups14"],
  Swords:    ["Swords01","Swords02","Swords03","Swords04","Swords05","Swords06","Swords07",
               "Swords08","Swords09","Swords10","Swords11","Swords12","Swords13","Swords14"],
  Pentacles: ["Pentacles01","Pentacles02","Pentacles03","Pentacles04","Pentacles05","Pentacles06","Pentacles07",
               "Pentacles08","Pentacles09","Pentacles10","Pentacles11","Pentacles12","Pentacles13","Pentacles14"],
};

function minorImg(suit, rankIndex) {
  return `/cards/${SUIT_FILENAMES[suit][rankIndex]}.png`;
}

// ============================================================
// Full 78-Card Tarot Deck Data
// ============================================================

export const MAJOR_ARCANA = [
  { id: 0,  name: "The Fool",           keywords: ["beginnings", "innocence", "spontaneity", "free spirit"] },
  { id: 1,  name: "The Magician",       keywords: ["power", "skill", "concentration", "action"] },
  { id: 2,  name: "The High Priestess", keywords: ["intuition", "mystery", "inner knowledge", "stillness"] },
  { id: 3,  name: "The Empress",        keywords: ["femininity", "beauty", "nature", "abundance"] },
  { id: 4,  name: "The Emperor",        keywords: ["authority", "structure", "control", "fatherhood"] },
  { id: 5,  name: "The Hierophant",     keywords: ["tradition", "conformity", "morality", "ethics"] },
  { id: 6,  name: "The Lovers",         keywords: ["love", "harmony", "relationships", "choices"] },
  { id: 7,  name: "The Chariot",        keywords: ["direction", "control", "willpower", "victory"] },
  { id: 8,  name: "Strength",           keywords: ["strength", "courage", "patience", "compassion"] },
  { id: 9,  name: "The Hermit",         keywords: ["soul-searching", "introspection", "inner guidance", "solitude"] },
  { id: 10, name: "Wheel of Fortune",   keywords: ["change", "cycles", "fate", "luck"] },
  { id: 11, name: "Justice",            keywords: ["justice", "fairness", "truth", "cause and effect"] },
  { id: 12, name: "The Hanged Man",     keywords: ["sacrifice", "release", "martyrdom", "new perspectives"] },
  { id: 13, name: "Death",              keywords: ["endings", "change", "transformation", "transition"] },
  { id: 14, name: "Temperance",         keywords: ["balance", "moderation", "patience", "purpose"] },
  { id: 15, name: "The Devil",          keywords: ["shadow self", "attachment", "addiction", "restriction"] },
  { id: 16, name: "The Tower",          keywords: ["chaos", "awakening", "sudden change", "revelation"] },
  { id: 17, name: "The Star",           keywords: ["hope", "faith", "purpose", "renewal"] },
  { id: 18, name: "The Moon",           keywords: ["illusion", "fear", "the unconscious", "confusion"] },
  { id: 19, name: "The Sun",            keywords: ["joy", "success", "celebration", "positivity"] },
  { id: 20, name: "Judgement",          keywords: ["judgement", "rebirth", "inner calling", "absolution"] },
  { id: 21, name: "The World",          keywords: ["completion", "integration", "accomplishment", "travel"] },
].map((card, i) => ({
  ...card,
  suit: null,
  image: MAJOR_IMGS[i],
}));

const SUITS = [
  { name: "Wands",     element: "Fire",  theme: "passion, creativity, career",       color: "#dc6b2f" },
  { name: "Cups",      element: "Water", theme: "emotions, relationships, intuition", color: "#3b82f6" },
  { name: "Swords",    element: "Air",   theme: "intellect, conflict, truth",          color: "#6366f1" },
  { name: "Pentacles", element: "Earth", theme: "material world, money, stability",    color: "#16a34a" },
];

const MINOR_VALUES = [
  { rank: "Ace",    keywords: ["new beginnings", "raw potential", "seed"] },
  { rank: "Two",    keywords: ["balance", "duality", "partnership"] },
  { rank: "Three",  keywords: ["expansion", "growth", "creativity"] },
  { rank: "Four",   keywords: ["stability", "rest", "consolidation"] },
  { rank: "Five",   keywords: ["conflict", "challenge", "change"] },
  { rank: "Six",    keywords: ["harmony", "communication", "progress"] },
  { rank: "Seven",  keywords: ["assessment", "reflection", "perseverance"] },
  { rank: "Eight",  keywords: ["movement", "action", "quick change"] },
  { rank: "Nine",   keywords: ["near-completion", "resilience", "strength"] },
  { rank: "Ten",    keywords: ["completion", "fulfillment", "culmination"] },
  { rank: "Page",   keywords: ["curiosity", "messages", "youthful energy"] },
  { rank: "Knight", keywords: ["action", "adventure", "moving forward"] },
  { rank: "Queen",  keywords: ["authority", "nurturing", "mastery"] },
  { rank: "King",   keywords: ["leadership", "mastery", "control"] },
];

export const MINOR_ARCANA = SUITS.flatMap(suit =>
  MINOR_VALUES.map((value, rankIdx) => ({
    id: `${value.rank}-of-${suit.name}`.toLowerCase().replace(/ /g, "-"),
    name: `${value.rank} of ${suit.name}`,
    keywords: [...value.keywords, suit.element.toLowerCase(), suit.theme.split(",")[0].trim()],
    suit: suit.name,
    element: suit.element,
    suitColor: suit.color,
    image: minorImg(suit.name, rankIdx),
  }))
);

export const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// ============================================================
// Session Types
// ============================================================
export const SESSION_TYPES = [
  // --- CLASSIC ---
  {
    id: "single",
    name: "Single Card",
    description: "One card to guide your day or answer a quick question.",
    icon: "🃏",
    minCards: 1, maxCards: 1, defaultCards: 1,
    positions: ["The Message"],
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    gradColors: ["#f59e0b", "#d97706"],
    category: "classic",
  },
  {
    id: "past-present-future",
    name: "Past · Present · Future",
    description: "Explore the timeline of your situation across three cards.",
    icon: "⏳",
    minCards: 3, maxCards: 3, defaultCards: 3,
    positions: ["Past", "Present", "Future"],
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    gradColors: ["#8b5cf6", "#6d28d9"],
    category: "classic",
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    description: "The classic 10-card spread for deep insight into complex situations.",
    icon: "✝️",
    minCards: 10, maxCards: 10, defaultCards: 10,
    positions: [
      "The Present", "The Challenge", "The Foundation",
      "The Recent Past", "The Crown (Potential)", "The Near Future",
      "Your Attitude", "External Influences", "Hopes & Fears", "The Outcome",
    ],
    gradient: "linear-gradient(135deg, #7c3aed, #4c1d95)",
    gradColors: ["#7c3aed", "#4c1d95"],
    category: "classic",
  },
  {
    id: "yes-no",
    name: "Yes or No",
    description: "Get a direct yes/no answer from a quick 3-card draw.",
    icon: "🎯",
    minCards: 3, maxCards: 3, defaultCards: 3,
    positions: ["Consideration 1", "Consideration 2", "The Answer"],
    gradient: "linear-gradient(135deg, #f97316, #c2410c)",
    gradColors: ["#f97316", "#c2410c"],
    category: "classic",
  },
  {
    id: "two-paths",
    name: "Two Paths",
    description: "Compare two alternative options and their likely outcomes.",
    icon: "🔀",
    minCards: 5, maxCards: 5, defaultCards: 5,
    positions: ["Current Situation", "Path A Choice", "Path A Outcome", "Path B Choice", "Path B Outcome"],
    gradient: "linear-gradient(135deg, #f59e0b, #ec4899)",
    gradColors: ["#f59e0b", "#ec4899"],
    category: "classic",
  },
  {
    id: "custom",
    name: "Custom Spread",
    description: "Choose your own number of cards for a freeform reading.",
    icon: "✨",
    minCards: 1, maxCards: 12, defaultCards: 5,
    positions: null,
    gradient: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    gradColors: ["#a78bfa", "#7c3aed"],
    category: "classic",
  },

  // --- LOVE & RELATIONSHIPS ---
  {
    id: "love",
    name: "Love Reading",
    description: "Dive into your romantic life with a focused 5-card spread.",
    icon: "💕",
    minCards: 5, maxCards: 5, defaultCards: 5,
    positions: ["You", "Your Partner / Situation", "The Foundation", "The Challenge", "The Outcome"],
    gradient: "linear-gradient(135deg, #ec4899, #be185d)",
    gradColors: ["#ec4899", "#be185d"],
    category: "love",
  },
  {
    id: "relationship-harmony",
    name: "Relationship Harmony",
    description: "Examine the emotional dynamics and connection between two people.",
    icon: "🤝",
    minCards: 6, maxCards: 6, defaultCards: 6,
    positions: ["Your Feelings", "Their Feelings", "What Unites You", "What Divides You", "Core Strengths", "Future Outlook"],
    gradient: "linear-gradient(135deg, #f43f5e, #be123c)",
    gradColors: ["#f43f5e", "#be123c"],
    category: "love",
  },
  {
    id: "healing-heart",
    name: "Healing Heart",
    description: "Find guidance for healing, closure, and moving forward.",
    icon: "❤️‍🩹",
    minCards: 5, maxCards: 5, defaultCards: 5,
    positions: ["What Was Lost", "What Remains", "What Needs Healing", "How to Move Forward", "Future Hope"],
    gradient: "linear-gradient(135deg, #fda4af, #e11d48)",
    gradColors: ["#fda4af", "#e11d48"],
    category: "love",
  },

  // --- CAREER & SUCCESS ---
  {
    id: "career",
    name: "Career & Finance",
    description: "Clarity on work, money, and ambition across 4 cards.",
    icon: "💼",
    minCards: 4, maxCards: 4, defaultCards: 4,
    positions: ["Current Situation", "Obstacles", "Hidden Strengths", "Advice"],
    gradient: "linear-gradient(135deg, #059669, #065f46)",
    gradColors: ["#059669", "#065f46"],
    category: "career",
  },
  {
    id: "financial-flow",
    name: "Financial Flow",
    description: "Uncover money blocks, growth opportunities, and financial advice.",
    icon: "💰",
    minCards: 5, maxCards: 5, defaultCards: 5,
    positions: ["Relationship with Wealth", "Financial Blocks", "Growth Opportunities", "Actions to Take", "Future Abundance"],
    gradient: "linear-gradient(135deg, #10b981, #047857)",
    gradColors: ["#10b981", "#047857"],
    category: "career",
  },
  {
    id: "success-achievement",
    name: "Success & Achievement",
    description: "Map out the path to achieving a specific goal or milestone.",
    icon: "🏆",
    minCards: 5, maxCards: 5, defaultCards: 5,
    positions: ["The Goal", "Current Progress", "Supporting Forces", "Challenges to Overcome", "Final Success"],
    gradient: "linear-gradient(135deg, #fbbf24, #b45309)",
    gradColors: ["#fbbf24", "#b45309"],
    category: "career",
  },

  // --- SPIRITUAL & MIND ---
  {
    id: "spiritual",
    name: "Spiritual Path",
    description: "Connect with your higher self and soul journey.",
    icon: "🔮",
    minCards: 7, maxCards: 7, defaultCards: 7,
    positions: ["Your Soul", "Your Shadow", "Your Gift", "Your Challenge", "The Lesson", "Your Guide", "Your Destination"],
    gradient: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    gradColors: ["#0ea5e9", "#0369a1"],
    category: "spiritual",
  },
  {
    id: "inner-peace",
    name: "Inner Peace",
    description: "Assess your mind, body, and emotions for harmony and peace.",
    icon: "🧘",
    minCards: 5, maxCards: 5, defaultCards: 5,
    positions: ["Physical State", "Emotional Heart", "Mental Blockages", "Spiritual Support", "Source of Peace"],
    gradient: "linear-gradient(135deg, #14b8a6, #0f766e)",
    gradColors: ["#14b8a6", "#0f766e"],
    category: "spiritual",
  },
  {
    id: "dream-oracle",
    name: "Dream Oracle",
    description: "Interpret the hidden symbols and messages of your dreams.",
    icon: "🌙",
    minCards: 4, maxCards: 4, defaultCards: 4,
    positions: ["The Dream Catalyst", "The Hidden Message", "Underlying Desires", "Waking Application"],
    gradient: "linear-gradient(135deg, #6366f1, #312e81)",
    gradColors: ["#6366f1", "#312e81"],
    category: "spiritual",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
export function drawCards(count) {
  const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    reversed: Math.random() > 0.7,
  }));
}

export function getPositions(sessionType, cardCount) {
  if (sessionType.positions) return sessionType.positions;
  return Array.from({ length: cardCount }, (_, i) => `Card ${i + 1}`);
}
