import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateMockReading } from "./mockReading.js";
import { getMockQuestionnaire } from "./mockQuestionnaire.js";

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("GEMINI_API_KEY") || "";
}

function buildPrompt(sessionType, cards, question, positions, lang = "en") {
  const cardDescriptions = cards
    .map((card, idx) => {
      const pos = positions[idx] || `Card ${idx + 1}`;
      const orientation = card.reversed ? "Reversed" : "Upright";
      return `  - Card position: "${pos}". Card drawn: "${card.name}" (${orientation}). Card ID: "${card.id}". Keywords: ${card.keywords.join(", ")}`;
    })
    .join("\n");

  const questionLine = question?.trim()
    ? `Seeker's Question: "${question}"`
    : "General Reading (no question)";

  const languageInstruction = lang === "uk"
    ? "IMPORTANT: You MUST write your entire response (introduction, card interpretation texts, and guidance) in Ukrainian (українською мовою)."
    : "IMPORTANT: You MUST write your entire response in English.";

  const questionClarification = question?.trim()
    ? (lang === "uk" 
        ? "\nВАЖЛИВО: Оскільки Шукач поставив конкретне запитання, обов'язково заповніть масив 'clarificationQuestions' 2-3 дуже короткими запитаннями для уточнення ситуації. Ці запитання мають допомогти Шукачу проаналізувати свої обставини, що згодом допоможе вам дати точнішу відповідь."
        : "\nIMPORTANT: Since the Seeker has asked a question, you MUST populate the 'clarificationQuestions' array with a very brief set of 2-3 questions to clarify their situation. These questions should help the Seeker reflect on their circumstances, which will then help you provide a deeper answer.")
    : "\nIMPORTANT: If no question was asked, leave the 'clarificationQuestions' array empty.";

  return `You are a mystical, storytelling Tarot Reader.
Provide a cohesive, narrative-driven tarot reading. Tell a captivating story that weaves the cards together into a unified journey.

${languageInstruction}
${questionClarification}

Session Spread: ${sessionType.name}
${questionLine}

Cards Drawn:
${cardDescriptions}

Please interpret the reading as a continuous story.
- In "introduction", set the mystical scene and begin the narrative.
- In "interpretations", provide exactly one item for each card drawn. Match the "cardId" exactly to the one provided in Cards Drawn. The "text" should continue the story, explaining the card's meaning in the context of the Seeker's journey.
- In "guidance", conclude the story with an overarching lesson or actionable advice.
- In "clarificationQuestions", provide the 2-3 clarifying questions as requested.

Ensure the narrative flows logically from one card to the next, building suspense and insight.`;
}

// List of fallback models to loop through in case of 503 Service Unavailable or 429 Rate Limits
const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite"
];

let apiBackoffActive = false;

export function resetApiBackoff() {
  apiBackoffActive = false;
}

/**
 * Gets a structured JSON tarot reading from Gemini or falls back to Pollinations.AI keyless AI.
 */
export async function streamTarotReading({ sessionType, cards, question, positions, lang, onChunk, onError, onDone }) {
  const API_KEY = getApiKey();
  
  if (!API_KEY || apiBackoffActive) {
    console.log("Gemini API key is missing or rate-limited. Attempting keyless Pollinations.AI tarot reading...");
    try {
      await runPollinationsTarotReading({ sessionType, cards, question, positions, lang, onChunk, onDone });
      return;
    } catch (pErr) {
      console.log("Pollinations.AI failed. Falling back to local mock reading:", pErr.message || pErr);
      generateMockReading({ sessionType, cards, question, positions, lang, onChunk, onDone });
      return;
    }
  }

  const prompt = buildPrompt(sessionType, cards, question, positions, lang);
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Try each model sequentially if a 503 or 429 error is hit
  for (let i = 0; i < FALLBACK_MODELS.length; i++) {
    const modelName = FALLBACK_MODELS[i];
    console.log(`Attempting tarot reading with model: ${modelName}`);

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              introduction: { type: "STRING" },
              interpretations: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    cardId: { type: "STRING" },
                    cardName: { type: "STRING" },
                    position: { type: "STRING" },
                    text: { type: "STRING" }
                  },
                  required: ["cardId", "cardName", "position", "text"]
                }
              },
              guidance: { type: "STRING" },
              clarificationQuestions: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["introduction", "interpretations", "guidance"]
          }
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();

      if (jsonText) {
        onChunk(jsonText);
        onDone();
        return; // Success! Exit the function.
      }
    } catch (err) {
      const isQuota = err?.message?.includes("Quota") || err?.message?.includes("429") || err?.message?.includes("limit");
      const reason = isQuota ? "Rate-limited (429)" : (err.message || err);
      console.log(`[Gemini API] ${modelName} failed: ${reason}`);
      
      const isKeyInvalid = err?.message?.includes("API_KEY_INVALID");
      const isLastModel = i === FALLBACK_MODELS.length - 1;

      if (isKeyInvalid || isLastModel) {
        console.log("Gemini API key inactive/limited. Activating API backoff. Attempting keyless Pollinations.AI tarot reading...");
        apiBackoffActive = true;
        try {
          await runPollinationsTarotReading({ sessionType, cards, question, positions, lang, onChunk, onDone });
          return;
        } catch (pErr) {
          console.log("Pollinations.AI failed. Falling back to local mock reading:", pErr.message || pErr);
          generateMockReading({ sessionType, cards, question, positions, lang, onChunk, onDone });
          return;
        }
      }
      
      // Otherwise, log and continue loop to try the next fallback model
      console.log(`[Gemini API] Retrying with next model...`);
    }
  }
}

export async function generateQuestionnaire({ question, lang, onError }) {
  const API_KEY = getApiKey();
  if (!API_KEY || apiBackoffActive) {
    console.log("Gemini API key is missing or rate-limited. Attempting keyless Pollinations.AI questionnaire...");
    try {
      const qs = await runPollinationsQuestionnaire({ question, lang });
      if (qs && qs.length > 0) return qs;
    } catch (pErr) {
      console.log("Pollinations.AI questionnaire failed. Using mock questionnaire:", pErr.message || pErr);
    }
    return getMockQuestionnaire(question, lang);
  }
  const genAI = new GoogleGenerativeAI(API_KEY);

  for (let i = 0; i < FALLBACK_MODELS.length; i++) {
    const modelName = FALLBACK_MODELS[i];
    console.log(`Attempting questionnaire with model: ${modelName}`);

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                questionText: { type: "STRING" },
                options: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: ["questionText", "options"]
            }
          }
        }
      });

      const languageInstruction = lang === "uk"
        ? "You MUST write the questions and options in Ukrainian (українською мовою)."
        : "You MUST write the questions and options in English.";

      const prompt = `You are a mystical Tarot Advisor.
The seeker has asked the following question: "${question}".
Create exactly 2 highly relevant, reflective follow-up questions to clarify their situation before drawing cards.
Each question MUST have exactly 4 answer options that cover different potential aspects of their situation.

Return the output as a JSON array of objects (without a root key). Example format:
[
  {
    "questionText": "Question 1 text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ]
  },
  {
    "questionText": "Question 2 text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ]
  }
]

${languageInstruction}
Return ONLY the JSON array.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      const jsonText = response.text();
      if (jsonText) {
        return JSON.parse(jsonText);
      }
    } catch (err) {
      const isQuota = err?.message?.includes("Quota") || err?.message?.includes("429") || err?.message?.includes("limit");
      const reason = isQuota ? "Rate-limited (429)" : (err.message || err);
      console.log(`[Gemini API] ${modelName} failed: ${reason}`);
      if (i === FALLBACK_MODELS.length - 1) {
        console.log("All models failed for questionnaire. Activating API backoff. Attempting keyless Pollinations.AI questionnaire...");
        apiBackoffActive = true;
        try {
          const qs = await runPollinationsQuestionnaire({ question, lang });
          if (qs && qs.length > 0) return qs;
        } catch (pErr) {
          console.log("Pollinations.AI questionnaire failed. Using mock questionnaire:", pErr.message || pErr);
        }
        return getMockQuestionnaire(question, lang);
      }
    }
  }
  return getMockQuestionnaire(question, lang);
}

/**
 * Calls Pollinations.AI keyless API to get a dynamic Tarot Reading using GET request.
 */
async function runPollinationsTarotReading({ sessionType, cards, question, positions, lang, onChunk, onDone }) {
  const safeQuestion = (question || "").replace(/["'{}[\]]/g, "");
  const cardListText = cards.map(c => c.name).join(", ");
  const positionsText = positions.join(", ");
  
  const promptText = `Provide a tarot reading for cards: ${cardListText}. Positions: ${positionsText}. Question: ${safeQuestion}. Language: ${lang === 'uk' ? 'Ukrainian' : 'English'}.`;
  
  const systemPrompt = `You are a mystical, storytelling Tarot Reader. Provide a cohesive, narrative-driven tarot reading. Tell a captivating story that weaves the cards together into a unified journey. Respond only with a JSON object containing these keys: introduction, interpretations, guidance, and clarificationQuestions. interpretations is an array of objects. Each object has keys: cardId, cardName, position, text. clarificationQuestions is an array of strings.`;

  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText }
      ],
      jsonMode: true
    })
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  // Stream the response back chunk-by-chunk to simulate dynamic typewriting
  let index = 0;
  const interval = setInterval(() => {
    if (index >= text.length) {
      clearInterval(interval);
      onDone();
      return;
    }
    const chunk = text.slice(index, index + 25);
    onChunk(chunk);
    index += 25;
  }, 10);
}

/**
 * Calls Pollinations.AI keyless API to get a dynamic pre-session questionnaire using GET request.
 */
async function runPollinationsQuestionnaire({ question, lang }) {
  const safeQuestion = (question || "").replace(/["'{}[\]]/g, "");
  const languageInstruction = lang === "uk"
    ? "You MUST write the questions and options in Ukrainian (українською мовою)."
    : "You MUST write the questions and options in English.";

  const promptText = `Create two follow-up questions for the question: ${safeQuestion}. Language: ${lang === 'uk' ? 'Ukrainian' : 'English'}.`;

  const systemPrompt = `You are a mystical Tarot Advisor. You generate pre-session questionnaires. Respond only with a raw JSON array containing exactly two objects. Each object has a key named questionText and a key named options containing exactly 4 text options.
${languageInstruction}`;

  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText }
      ],
      jsonMode: true
    })
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  return JSON.parse(text);
}


