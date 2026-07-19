<template>
  <div id="app" class="app" :class="[`theme--${gradientTheme}`, locale === 'uk' ? 'lang--uk' : 'lang--en']">
    <!-- ══ MYSTICAL ATMOSPHERE BACKGROUND ══ -->
    <div class="table-cloth" :class="{ 'table-cloth--blurred': isZoomed }" :style="tableclothStyle" />
    <div class="stars-layer">
      <span v-for="i in 30" :key="i" class="star-dot" :style="starStyle(i)" />
    </div>



    <!-- ══ FLOATING PARTICLES ══ -->
    <div class="particles-layer">
      <span v-for="i in 20" :key="i" class="particle-orb" :style="particleStyle(i)" />
    </div>

    <!-- ══ MAIN LAYOUT CANVAS ══ -->
    <div class="app__workspace">
      
      <!-- BRANDING (No borders, floating) -->
      <div class="branding-container">
        <div class="branding-logo">🌙</div>
        <div class="branding-text">
          <h1 class="branding-title">{{ t('headerTitle') }}</h1>
          <p class="branding-sub">{{ t('headerSub') }}</p>
        </div>
      </div>

      <!-- LEFT DOCK (Apple-style Liquid Glass Circle Buttons) -->
      <div class="liquid-dock liquid-dock--left">
        <button class="dock-btn" @click="toggleLanguage" :title="locale === 'uk' ? 'Switch to English' : 'Перемкнути на українську'">
          🌐
        </button>
        <button class="dock-btn" @click="showApiModal = true" title="API Key Settings">
          🔑
        </button>
        <button v-if="step > 1" class="dock-btn" @click="resetAll" :title="t('newReading')">
          ↺
        </button>
      </div>

      <!-- RIGHT DOCK -->
      <!-- Setup/Reading Controls -->
      <div v-if="step === 2" class="liquid-dock liquid-dock--right">
        <div class="dock-badge" :title="t('revealed')">
          <span>{{ flippedCards.size }}/{{ drawnCards.length }}</span>
        </div>
        <button class="dock-btn" @click="flipAll" :disabled="allFlipped" :title="t('revealAll')">
          👁️
        </button>
        <button
          class="dock-btn dock-btn--primary"
          :class="{ 'dock-btn--disabled': !allFlipped }"
          :disabled="!allFlipped || isStreaming"
          @click="getReading"
          :title="t('askOracle')"
        >
          <span v-if="isStreaming" class="spinner" />
          <span v-else>🔮</span>
        </button>
      </div>

      <!-- ══ CENTRAL TAROT TABLE ══ -->
      <main class="tarot-table" :class="{ 'tarot-table--zoomed': isZoomed }">
        
        <!-- INITIAL STATE: EMPTY TABLE / SETUP -->
        <div v-if="step === 1" class="setup-container fade-in">
          <div class="setup-header">
            <h2>{{ t('chooseSpread') }}</h2>
            <p>{{ t('whatDoYouSeek') }}</p>
          </div>

          <!-- Category selection tabs -->
          <div class="category-tabs">
            <button
              v-for="cat in categories" :key="cat.id"
              class="category-tab"
              :class="{ 'category-tab--active': selectedCategory === cat.id }"
              @click="selectedCategory = cat.id"
            >
              <span class="category-tab__icon">{{ cat.icon }}</span>
              <span class="category-tab__name">{{ t(`categories.${cat.id}`) }}</span>
            </button>
          </div>

          <div class="spread-picker">
            <button
              v-for="s in filteredSessions" :key="s.id"
              class="glass-btn spread-option"
              :class="{ 'spread-option--active': selectedSession?.id === s.id }"
              @click="selectSession(s)"
            >
              <span class="spread-option__icon">{{ s.icon }}</span>
              <div class="spread-option__meta">
                <strong>{{ t(`sessions.${s.id}.name`) }}</strong>
                <span>{{ s.id === 'custom' ? t('cardsCustom') : s.defaultCards + ' ' + (s.defaultCards > 1 ? t('cards') : t('card')) }}</span>
              </div>
            </button>
          </div>

          <!-- Custom slider count -->
          <div v-if="selectedSession?.id === 'custom'" class="glass-panel custom-slider fade-in-fast">
            <label>{{ t('cardsLabel') }} <strong>{{ cardCount }}</strong></label>
            <input type="range" :min="1" :max="12" v-model.number="cardCount" class="velvet-slider" />
          </div>

          <!-- Seeker's question -->
          <div v-if="selectedSession" class="glass-panel question-entry fade-in-fast">
            <label>{{ t('yourQuestion') }} <span>{{ t('optional') }}</span></label>
            <textarea
              v-model="userQuestion"
              :placeholder="t('questionPlaceholder')"
              rows="2"
            />
            <button class="action-cta" :style="{ background: selectedSession.gradient }" :disabled="isGeneratingQuestionnaire" @click="handleGetSpreadClick">
              <span v-if="isGeneratingQuestionnaire" class="spinner" />
              {{ t('drawCards') }}
            </button>
          </div>
        </div>

        <!-- Step 1.5: Pre-Session Multiple Choice Questionnaire -->
        <div v-else-if="step === 1.5" class="setup-container questionnaire-container fade-in-fast">
          <div class="setup-header">
            <h2>✨ {{ locale === 'uk' ? 'Уточнення для Оракула' : 'Clarification for the Oracle' }}</h2>
            <p>{{ locale === 'uk' ? 'Дайте відповідь на запитання, щоб Оракул краще налаштував ворожіння:' : 'Answer the questions so the Oracle can better align the vision:' }}</p>
          </div>

          <div v-for="(q, qIdx) in questionnaire" :key="qIdx" class="questionnaire-card glass-panel">
            <h4 class="questionnaire-card__title">{{ q.questionText }}</h4>
            <div class="options-grid">
              <button
                v-for="(opt, optIdx) in q.options"
                :key="optIdx"
                class="option-pill"
                :class="{ 'option-pill--selected': selectedOptions[qIdx] === optIdx }"
                @click="selectedOptions[qIdx] = optIdx"
              >
                <span class="option-bullet">{{ ['A', 'B', 'C', 'D'][optIdx] }}</span>
                <span class="option-text">{{ opt }}</span>
              </button>
            </div>
          </div>

          <div class="setup-actions">
            <button class="glass-btn" @click="step = 1">
              ← {{ locale === 'uk' ? 'Назад' : 'Back' }}
            </button>
            <button
              class="action-cta"
              :style="{ background: selectedSession.gradient }"
              :disabled="selectedOptions.some(o => o === null)"
              @click="drawAndReveal"
            >
              🔮 {{ locale === 'uk' ? 'Продовжити' : 'Proceed' }}
            </button>
          </div>
        </div>

        <!-- ACTIVE SESSION: CARD PLAYGROUND -->
        <div v-else-if="step >= 2" class="table-playground">
          
          <!-- Cards Layout Canvas -->
          <div class="table-canvas" :style="canvasStyle">
            <div
              v-for="(card, idx) in drawnCards" :key="card.id + idx"
              class="table-card-slot"
              :class="{
                'table-card-slot--blurred': isZoomed && focusedCardIndex !== idx,
                'table-card-slot--focused': isZoomed && focusedCardIndex === idx
              }"
              :style="getCardPositionStyle(idx)"
            >
              <span class="table-card-slot__pos-name">{{ t(`positions.${positions[idx]}`) || positions[idx] }}</span>
              <TarotCard
                :card="card"
                :flipped="flippedCards.has(idx)"
                @flip="flipCard(idx)"
              />
            </div>
          </div>

          <!-- FLOATING EXPLANATION BUBBLE (Liquid Glass style) -->
          <Transition name="fade-scale">
            <div v-if="step === 3 && parsedReading && focusedCardIndex !== null && focusedCardIndex >= 0" class="glass-panel explanation-panel" :style="explanationPanelStyle">
              <div class="explanation-panel__header">
                <h3>{{ currentInterpretationCardName }}</h3>
                <span class="explanation-panel__pos">{{ currentInterpretationPosition }}</span>
              </div>
              <p class="explanation-panel__text">{{ currentInterpretationText }}</p>
            </div>
          </Transition>

          <!-- FLOATING INTRO BUBBLE -->
          <Transition name="fade-scale">
            <div v-if="step === 3 && parsedReading && focusedCardIndex === null" class="glass-panel explanation-panel" :style="explanationPanelStyle">
              <div class="explanation-panel__header">
                <h3>🔮 {{ t('intro') }}</h3>
              </div>
              <p class="explanation-panel__text">{{ parsedReading.introduction }}</p>
            </div>
          </Transition>

          <!-- FLOATING OUTRO BUBBLE -->
          <Transition name="fade-scale">
            <div v-if="step === 3 && parsedReading && focusedCardIndex === -2" class="glass-panel explanation-panel" :style="explanationPanelStyle">
              <div class="explanation-panel__header">
                <h3>🌟 {{ t('adviceHeader') }}</h3>
              </div>
              <p class="explanation-panel__text">{{ parsedReading.guidance }}</p>
            </div>
          </Transition>

        </div>

      </main>

      <!-- Bottom Navigation Dock for Slideshow Arrows -->
      <div v-if="step === 3 && parsedReading" class="bottom-nav-dock">
        <button class="large-nav-btn" @click="navigateSlide(-1)" :disabled="focusedCardIndex === null" title="Previous">
          ❮
        </button>
        <div class="large-nav-badge" :title="t('oracleSpeaks')">
          <span>{{ currentSlideLabel }}</span>
        </div>
        <button class="large-nav-btn" @click="navigateSlide(1)" :disabled="focusedCardIndex === -2" title="Next">
          ❯
        </button>
      </div>

      <!-- Quota/Error Notice if any -->
      <div v-if="readingError" class="glass-panel error-panel-floating">
        <span>⚠️</span>
        <p>{{ readingError }}</p>
      </div>

    </div>

    <!-- API Key setup Modal -->
    <Transition name="fade">
      <div v-if="showApiModal" class="modal-overlay" @click.self="showApiModal = false">
        <div class="modal">
          <div class="modal__crystal">🔑</div>
          <h2>{{ t('apiKeyTitle') }}</h2>
          <p>{{ t('apiKeyDesc') }}</p>
          <input id="api-key-input" v-model="apiKeyInput" type="password" placeholder="AIza…" class="modal__input" @keyup.enter="saveApiKey" />
          <div class="modal__actions">
            <button class="glass-btn" @click="showApiModal = false">{{ t('later') }}</button>
            <button id="save-api-key-btn" class="action-cta" @click="saveApiKey">{{ t('saveContinue') }}</button>
          </div>
          <p class="modal__link">
            <a href="https://aistudio.google.com/apikey" target="_blank">{{ t('getFreeKey') }}</a>
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { SESSION_TYPES, drawCards, getPositions } from "./tarotData.js";
import { streamTarotReading, generateQuestionnaire, resetApiBackoff } from "./geminiService.js";
import { translations } from "./translations.js";
import TarotCard from "./components/TarotCard.vue";

const baseUrl = import.meta.env.BASE_URL;
const tableClothBg = `url('${baseUrl}tablecloth.jpg')`;

const questionnaire = ref(null);
const selectedOptions = ref([null, null]);
const isGeneratingQuestionnaire = ref(false);

// ── Locale & Translation System ──────────────────────────────────────────────
const locale = ref("uk"); // default to Ukrainian as requested

function toggleLanguage() {
  locale.value = locale.value === "uk" ? "en" : "uk";
}

function t(path) {
  const dictionary = translations[locale.value];
  if (!dictionary) return path;
  return path.split(".").reduce((acc, part) => acc && acc[part], dictionary) || path;
}

// ── Gradient / Atmosphere Themes ─────────────────────────────────────────────
const gradientTheme = ref("single");

// ── Categories & Session Selection ──────────────────────────────────────────
const selectedCategory = ref("classic");
const categories = [
  { id: "classic", icon: "🌌" },
  { id: "love", icon: "💖" },
  { id: "career", icon: "📈" },
  { id: "spiritual", icon: "✨" },
];
const filteredSessions = computed(() => {
  return SESSION_TYPES.filter(s => s.category === selectedCategory.value);
});

// ── State ─────────────────────────────────────────────────────────────────────
const step            = ref(1);
const selectedSession = ref(SESSION_TYPES.find(s => s.id === "single") || SESSION_TYPES[0]);
const cardCount       = ref(1);
const userQuestion    = ref("");
const drawnCards      = ref([]);
const flippedCards    = ref(new Set());
const positions       = ref([]);

const readingText  = ref("");
const readingError = ref(null);
const isStreaming  = ref(false);
const showApiModal = ref(false);
const apiKeyInput  = ref(localStorage.getItem("GEMINI_API_KEY") || "");

// Focused card index during zoomed readthrough
// -1 = Intro slide, -2 = Guidance slide, null = not active
const focusedCardIndex = ref(null);

// ── Computed ──────────────────────────────────────────────────────────────────
const allFlipped = computed(() =>
  drawnCards.value.length > 0 && flippedCards.value.size === drawnCards.value.length
);

const isZoomed = computed(() => focusedCardIndex.value !== null && focusedCardIndex.value >= 0);

// Try to parse structured reading JSON
const parsedReading = computed(() => {
  if (!readingText.value) return null;
  try {
    let text = readingText.value.trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(text);
  } catch (err) {
    if (!isStreaming.value) {
      console.warn("Error parsing Gemini JSON:", err);
    }
    return null;
  }
});

// Slideshow Navigation in focused layout mode
const totalInterpretationSlides = computed(() => parsedReading.value?.interpretations?.length || 0);

function navigateSlide(direction) {
  if (!parsedReading.value) return;
  
  if (focusedCardIndex.value === null) {
    // We were on introduction slide
    if (direction > 0) {
      focusedCardIndex.value = 0; // go to first card
    }
  } else if (focusedCardIndex.value === -2) {
    // We were on final advice slide
    if (direction < 0) {
      focusedCardIndex.value = totalInterpretationSlides.value - 1; // back to last card
    }
  } else {
    // We were on a card slide
    const nextVal = focusedCardIndex.value + direction;
    if (nextVal < 0) {
      focusedCardIndex.value = null; // back to intro
    } else if (nextVal >= totalInterpretationSlides.value) {
      focusedCardIndex.value = -2; // to final advice
    } else {
      focusedCardIndex.value = nextVal;
    }
  }
}

// Current Card focused values
const currentInterpretationPosition = computed(() => {
  if (focusedCardIndex.value === null || focusedCardIndex.value < 0 || !parsedReading.value) return "";
  return parsedReading.value.interpretations[focusedCardIndex.value]?.position || "";
});

const currentInterpretationCardName = computed(() => {
  if (focusedCardIndex.value === null || focusedCardIndex.value < 0 || !parsedReading.value) return "";
  return parsedReading.value.interpretations[focusedCardIndex.value]?.cardName || "";
});

const currentInterpretationText = computed(() => {
  if (focusedCardIndex.value === null || focusedCardIndex.value < 0 || !parsedReading.value) return "";
  return parsedReading.value.interpretations[focusedCardIndex.value]?.text || "";
});

// Dynamic canvas size adjustment based on card layouts, handling camera pan
const canvasStyle = computed(() => {
  let baseWidth = "100%";
  let baseHeight = "500px";
  if (selectedSession.value && selectedSession.value.id === "celtic-cross") {
    baseWidth = "950px";
    baseHeight = "550px";
  }

  // Camera pan mode
  if (focusedCardIndex.value !== null && focusedCardIndex.value >= 0) {
    const coords = getCardCoordinates(focusedCardIndex.value, drawnCards.value.length);
    // Pan the card to 32% from the left (instead of 50% center) to give space for explanation on the right
    const xOffset = 32 - coords.left;
    const yOffset = 50 - coords.top;
    
    // Scale up the table and translate to keep the focused card centered on the left half
    return { 
      width: baseWidth, 
      height: baseHeight,
      transform: `scale(1.8) translate(${xOffset}%, ${yOffset}%)`,
      transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)"
    };
  }

  return { 
    width: baseWidth, 
    height: baseHeight,
    transform: `scale(1) translate(0%, 0%)`,
    transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)"
  };
});

// Parallax/Pan effect for tablecloth
const tableclothStyle = computed(() => {
  if (focusedCardIndex.value !== null && focusedCardIndex.value >= 0) {
    const coords = getCardCoordinates(focusedCardIndex.value, drawnCards.value.length);
    const xOffset = 32 - coords.left;
    const yOffset = 50 - coords.top;
    return {
      // Pan background in the same direction slightly (parallax)
      transform: `scale(1.15) translate(${xOffset * 0.25}%, ${yOffset * 0.25}%)`
    };
  }
  return {
    transform: "scale(1) translate(0%, 0%)"
  };
});

// Current slide label formatting
const currentSlideLabel = computed(() => {
  if (focusedCardIndex.value === null) return t('intro').replace(' 🔮', '');
  if (focusedCardIndex.value === -2) return t('adviceHeader').replace(' 🌟', '');
  return `${focusedCardIndex.value + 1} / ${drawnCards.value.length}`;
});

// Fixed spacious explanation panel on the right side of the screen
const explanationPanelStyle = computed(() => {
  if (focusedCardIndex.value === null || focusedCardIndex.value < 0) return {};
  return {
    right: "6%",
    width: "380px",
    top: "50%",
    transform: "translateY(-50%)"
  };
});

// Watch session pick to update colors
watch(selectedSession, (s) => {
  if (!s) return;
  cardCount.value = s.defaultCards;
  gradientTheme.value = s.id;
});

// Watch category to automatically select the first session in the category
watch(selectedCategory, (newCat) => {
  const matching = SESSION_TYPES.filter(s => s.category === newCat);
  if (matching.length > 0) {
    selectSession(matching[0]);
  }
});

// ── Actions ───────────────────────────────────────────────────────────────────
function selectSession(session) {
  selectedSession.value = session;
}

function drawAndReveal() {
  if (!selectedSession.value) return;
  const count = selectedSession.value.id === "custom"
    ? cardCount.value
    : selectedSession.value.defaultCards;
  // Draw cards and attach a random rotation tilt between -3.5 and +3.5 deg
  drawnCards.value   = drawCards(count).map(card => ({
    ...card,
    tilt: (Math.random() * 7 - 3.5).toFixed(1)
  }));
  positions.value    = getPositions(selectedSession.value, count);
  flippedCards.value = new Set();
  readingText.value  = "";
  readingError.value = null;
  focusedCardIndex.value = null;
  gradientTheme.value = "cards";
  step.value = 2;
}

function flipCard(idx) {
  if (flippedCards.value.has(idx)) return;
  flippedCards.value = new Set([...flippedCards.value, idx]);
}

function flipAll() {
  flippedCards.value = new Set(drawnCards.value.map((_, i) => i));
}



async function handleGetSpreadClick() {
  if (!selectedSession.value) return;
  
  if (userQuestion.value.trim()) {
    isGeneratingQuestionnaire.value = true;
    readingError.value = null;
    try {
      const qs = await generateQuestionnaire({
        question: userQuestion.value,
        lang: locale.value,
        onError(m) { readingError.value = m; }
      });
      if (qs && qs.length > 0) {
        questionnaire.value = qs;
        selectedOptions.value = new Array(qs.length).fill(null);
        step.value = 1.5; // Proceed to pre-session questionnaire screen
      } else {
        // Fallback to direct draw if something goes wrong
        drawAndReveal();
      }
    } catch (err) {
      console.error("Failed to generate questionnaire, proceeding to draw directly:", err);
      drawAndReveal();
    } finally {
      isGeneratingQuestionnaire.value = false;
    }
  } else {
    // Proceed directly if no question was asked (general reading)
    drawAndReveal();
  }
}

async function getReading() {
  if (!allFlipped.value) return;
  
  readingText.value  = "";
  readingError.value = null;
  isStreaming.value  = true;
  gradientTheme.value = "reading";
  step.value = 3;
  focusedCardIndex.value = null; // start at introduction slide

  const translatedSession = {
    ...selectedSession.value,
    name: t(`sessions.${selectedSession.value.id}.name`),
    description: t(`sessions.${selectedSession.value.id}.description`),
  };

  const translatedPositions = positions.value.map(p => t(`positions.${p}`) || p);

  // Compile detailed question with questionnaire responses
  let finalQuestion = userQuestion.value;
  if (questionnaire.value && questionnaire.value.length > 0) {
    finalQuestion += "\n\nSeeker's Clarifications to Oracle's Pre-Session Questions:";
    questionnaire.value.forEach((q, idx) => {
      const chosenOptIdx = selectedOptions.value[idx];
      const chosenOptText = chosenOptIdx !== null && q.options ? q.options[chosenOptIdx] : "None";
      finalQuestion += `\n- Question: "${q.questionText}"\n  Chosen Clarification: "${chosenOptText}"`;
    });
  }

  streamTarotReading({
    sessionType: translatedSession,
    cards: drawnCards.value,
    question: finalQuestion,
    positions: translatedPositions,
    lang: locale.value,
    onChunk(c)  { readingText.value += c; },
    onError(m)  { readingError.value = m; isStreaming.value = false; step.value = 2; },
    onDone()    { isStreaming.value = false; },
  });
}

function saveApiKey() {
  if (!apiKeyInput.value.trim()) return;
  localStorage.setItem("GEMINI_API_KEY", apiKeyInput.value.trim());
  resetApiBackoff();
  showApiModal.value = false;
}

function resetAll() {
  step.value = 1;
  selectedSession.value = null;
  cardCount.value = 5;
  userQuestion.value = "";
  drawnCards.value = [];
  flippedCards.value = new Set();
  positions.value = [];
  readingText.value = "";
  readingError.value = null;
  isStreaming.value = false;
  gradientTheme.value = "default";
  focusedCardIndex.value = null;
  questionnaire.value = null;
  selectedOptions.value = [null, null];
}

// ── Physical coordinates on the Table cloth for each spread ───────────────────
function getCardCoordinates(idx, total) {
  if (!selectedSession.value) return { top: 50, left: 50 };
  const sId = selectedSession.value.id;

  if (sId === "single") {
    return { top: 50, left: 50 };
  }
  
  if (sId === "past-present-future" || sId === "yes-no") {
    const spacing = 18;
    const offset = (idx - 1) * spacing;
    return { top: 50, left: 50 + offset };
  }
  
  if (sId === "celtic-cross") {
    // Card indices 0-9
    switch (idx) {
      case 0: return { top: 50, left: 38 }; // Present
      case 1: return { top: 50, left: 38, transform: "rotate(90deg)" }; // Challenge (horizontal overlay)
      case 2: return { top: 80, left: 38 }; // Foundation (below)
      case 3: return { top: 50, left: 20 }; // Past (left)
      case 4: return { top: 20, left: 38 }; // Crown (top)
      case 5: return { top: 50, left: 56 }; // Near future (right)
      case 6: return { top: 80, left: 80 }; // Self
      case 7: return { top: 60, left: 80 }; // Environment
      case 8: return { top: 40, left: 80 }; // Hopes & Fears
      case 9: return { top: 20, left: 80 }; // Final Outcome
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "love") {
    // V-shape or love cross (5 cards)
    switch (idx) {
      case 0: return { top: 35, left: 28 }; // You
      case 1: return { top: 35, left: 72 }; // Partner
      case 2: return { top: 72, left: 50 }; // Foundation
      case 3: return { top: 48, left: 50 }; // Challenge
      case 4: return { top: 24, left: 50 }; // Outcome
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "career") {
    // Diamond shape (4 cards)
    switch (idx) {
      case 0: return { top: 50, left: 25 }; // Current
      case 1: return { top: 30, left: 50 }; // Obstacles
      case 2: return { top: 70, left: 50 }; // Hidden Strengths
      case 3: return { top: 50, left: 75 }; // Advice
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "spiritual") {
    // Zigzag spiritual ladder (7 cards)
    const positionsList = [
      { top: 82, left: 50 },
      { top: 72, left: 38 },
      { top: 62, left: 62 },
      { top: 52, left: 32 },
      { top: 42, left: 68 },
      { top: 32, left: 44 },
      { top: 22, left: 56 }
    ];
    return positionsList[idx] || { top: 50, left: 50 };
  }

  if (sId === "two-paths") {
    switch (idx) {
      case 0: return { top: 75, left: 50 }; // Current Situation
      case 1: return { top: 50, left: 32 }; // Path A Choice
      case 2: return { top: 25, left: 32 }; // Path A Outcome
      case 3: return { top: 50, left: 68 }; // Path B Choice
      case 4: return { top: 25, left: 68 }; // Path B Outcome
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "relationship-harmony") {
    switch (idx) {
      case 0: return { top: 30, left: 25 }; // Your Feelings
      case 1: return { top: 30, left: 75 }; // Their Feelings
      case 2: return { top: 35, left: 50 }; // What Unites You
      case 3: return { top: 65, left: 50 }; // What Divides You
      case 4: return { top: 70, left: 25 }; // Core Strengths
      case 5: return { top: 70, left: 75 }; // Future Outlook
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "healing-heart") {
    switch (idx) {
      case 0: return { top: 50, left: 20 }; // What Was Lost
      case 1: return { top: 50, left: 38 }; // What Remains
      case 2: return { top: 25, left: 56 }; // What Needs Healing
      case 3: return { top: 75, left: 56 }; // How to Move Forward
      case 4: return { top: 50, left: 80 }; // Future Hope
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "financial-flow") {
    switch (idx) {
      case 0: return { top: 75, left: 50 }; // Relationship with Wealth
      case 1: return { top: 50, left: 28 }; // Financial Blocks
      case 2: return { top: 50, left: 72 }; // Growth Opportunities
      case 3: return { top: 40, left: 50 }; // Actions to Take
      case 4: return { top: 15, left: 50 }; // Future Abundance
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "success-achievement") {
    switch (idx) {
      case 0: return { top: 20, left: 20 }; // The Goal
      case 1: return { top: 75, left: 32 }; // Current Progress
      case 2: return { top: 60, left: 47 }; // Supporting Forces
      case 3: return { top: 45, left: 62 }; // Challenges to Overcome
      case 4: return { top: 30, left: 77 }; // Final Success
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "inner-peace") {
    switch (idx) {
      case 0: return { top: 82, left: 50 }; // Physical State
      case 1: return { top: 66, left: 50 }; // Emotional Heart
      case 2: return { top: 50, left: 50 }; // Mental Blockages
      case 3: return { top: 34, left: 50 }; // Spiritual Support
      case 4: return { top: 18, left: 50 }; // Source of Peace
      default: return { top: 50, left: 50 };
    }
  }

  if (sId === "dream-oracle") {
    switch (idx) {
      case 0: return { top: 50, left: 24 }; // The Dream Catalyst
      case 1: return { top: 25, left: 50 }; // The Hidden Message
      case 2: return { top: 75, left: 50 }; // Underlying Desires
      case 3: return { top: 50, left: 76 }; // Waking Application
      default: return { top: 50, left: 50 };
    }
  }

  // Custom Spread: Circle layout
  const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
  const radiusX = 32; // percent radius
  const radiusY = 30;
  const left = 50 + radiusX * Math.cos(angle);
  const top = 50 + radiusY * Math.sin(angle);
  return {
    top: top,
    left: left
  };
}

function getCardPositionStyle(idx) {
  const coords = getCardCoordinates(idx, drawnCards.value.length);
  const card = drawnCards.value[idx];
  const tilt = card?.tilt || 0;
  // When card is focused, straighten it out to 0
  const activeTilt = (focusedCardIndex.value === idx) ? 0 : tilt;
  
  return {
    position: "absolute",
    top: `${coords.top}%`,
    left: `${coords.left}%`,
    transform: `translate(-50%, -50%) ${coords.transform || ""} rotate(${activeTilt}deg)`,
    transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
    zIndex: focusedCardIndex.value === idx ? 10 : 2
  };
}

// ── Star particles ────────────────────────────────────────────────────────────
function starStyle(i) {
  const s = i * 83.137;
  return {
    left: `${(s * 1.5) % 100}%`,
    top: `${(s * 2.3) % 100}%`,
    width: `${((i % 3) + 1) * 1.5}px`,
    height: `${((i % 3) + 1) * 1.5}px`,
    opacity: (0.05 + (i % 4) * 0.05).toFixed(2),
    animationDuration: `${5 + (i % 5)}s`,
    animationDelay: `${(i % 5) * 0.7}s`,
  };
}

// ── Floating particles style ──────────────────────────────────────────────────
function particleStyle(i) {
  const delay = (i * 0.5).toFixed(1);
  const duration = (6 + (i % 4) * 4); // 6s to 18s
  const size = (3 + (i % 3) * 4); // 3px to 11px
  const left = (i * 9.7) % 100;
  return {
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
}
</script>

<style>
/* ══════════════════════════════════════════════════════════════
   IMPORTS & ATMOSPHERIC STYLING
══════════════════════════════════════════════════════════════ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #080310;
  color: #ede9fe;
  min-height: 100dvh;
  overflow: hidden;
}

.app {
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
}

/* ══════════════════════════════════════════════════════════════
   COZY TAROT TABLE CLOTH BACKGROUND
══════════════════════════════════════════════════════════════ */
.table-cloth {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: v-bind(tableClothBg);
  background-size: cover;
  background-position: center;
  background-color: #110624;
  transition: filter 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
  transform-origin: center center;
}
.table-cloth::before {
  content: "";
  position: absolute; inset: 0;
  background: 
    radial-gradient(ellipse 65% 55% at 50% 50%, rgba(6, 78, 59, 0.5) 0%, transparent 80%),
    radial-gradient(ellipse 70% 60% at 20% 20%, rgba(88, 28, 135, 0.4) 0%, transparent 80%),
    #110624;
  mix-blend-mode: multiply;
  transition: background 2.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.table-cloth--blurred {
  filter: blur(10px) brightness(0.45);
}

/* Drastic theme updates based on selected spread color signatures (coloring pseudo-element overlay) */
.theme--single .table-cloth::before           { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(217, 119, 6, 0.6) 0%, transparent 80%), #1f0d02; }
.theme--past-present-future .table-cloth::before { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139, 92, 246, 0.6) 0%, transparent 80%), #0c021f; }
.theme--celtic-cross .table-cloth::before     { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(109, 40, 217, 0.65) 0%, transparent 80%), #08011c; }
.theme--love .table-cloth::before             { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(219, 39, 119, 0.65) 0%, transparent 80%), #240010; }
.theme--career .table-cloth::before           { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(5, 150, 105, 0.7) 0%, transparent 80%), #001c0c; }
.theme--spiritual .table-cloth::before        { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(3, 105, 161, 0.65) 0%, transparent 80%), #001429; }
.theme--yes-no .table-cloth::before           { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(234, 88, 12, 0.65) 0%, transparent 80%), #240700; }
.theme--custom .table-cloth::before           { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(124, 58, 237, 0.65) 0%, transparent 80%), #0f0321; }
.theme--two-paths .table-cloth::before         { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(236, 72, 153, 0.6) 0%, transparent 80%), #240015; }
.theme--relationship-harmony .table-cloth::before { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(244, 63, 94, 0.65) 0%, transparent 80%), #240108; }
.theme--healing-heart .table-cloth::before     { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(225, 29, 72, 0.65) 0%, transparent 80%), #26010a; }
.theme--financial-flow .table-cloth::before    { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(16, 185, 129, 0.65) 0%, transparent 80%), #001f11; }
.theme--success-achievement .table-cloth::before { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(251, 191, 36, 0.6) 0%, transparent 80%), #210b00; }
.theme--inner-peace .table-cloth::before       { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(20, 184, 166, 0.6) 0%, transparent 80%), #001f1b; }
.theme--dream-oracle .table-cloth::before      { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99, 102, 241, 0.6) 0%, transparent 80%), #020021; }
.theme--cards .table-cloth::before            { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(194, 120, 3, 0.5) 0%, transparent 80%), #170e01; }
.theme--reading .table-cloth::before          { background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139, 92, 246, 0.7) 0%, transparent 80%), #0d001c; }

/* Stars layer */
.stars-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.star-dot {
  position: absolute; border-radius: 50%; background: #fff;
  animation: starTwinkle linear infinite alternate;
}
@keyframes starTwinkle { from {opacity: .02} to {opacity: .75} }


/* ══════════════════════════════════════════════════════════════
   LIQUID GLASS (GLASSMORPHISM EFFECT)
══════════════════════════════════════════════════════════════ */
.glass-panel {
  background: rgba(18, 9, 36, 0.45);
  border: 1px solid rgba(167, 139, 250, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.5),
    inset 0 0 20px rgba(167, 139, 250, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.glass-panel:hover {
  border-color: rgba(167, 139, 250, 0.25);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.6),
    inset 0 0 24px rgba(167, 139, 250, 0.08);
}

.glass-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(167, 139, 250, 0.2);
  color: #c4b5fd;
  font-family: inherit; font-size: 0.82rem; font-weight: 700;
  padding: 0.65rem 1.25rem; border-radius: 100px; cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
}
.glass-btn:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.12);
  border-color: rgba(167, 139, 250, 0.45);
  color: #fff;
  box-shadow: 0 0 15px rgba(167, 139, 250, 0.25);
}
.glass-btn:disabled { opacity: 0.2; cursor: not-allowed; }

.action-cta {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  border: none; color: #fff; font-family: inherit; font-size: 0.9rem;
  font-weight: 700; padding: 0.75rem 1.75rem; border-radius: 100px;
  cursor: pointer; transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
}
.action-cta:hover:not(:disabled) {
  filter: brightness(1.15); transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.55);
}
.action-cta--disabled {
  background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.25);
  cursor: not-allowed; box-shadow: none;
}

/* ══════════════════════════════════════════════════════════════
   WORKSPACE FLEX LAYOUT
══════════════════════════════════════════════════════════════ */
.app__workspace {
  position: relative; z-index: 2;
  display: flex;
  align-items: stretch;
  height: 100dvh;
  padding: 1.5rem;
}
@media (max-width: 1024px) {
  .app__workspace {
    flex-direction: column;
    height: auto; min-height: 100dvh;
    overflow-y: auto; padding: 1rem; gap: 1rem;
  }
}

/* ══════════════════════════════════════════════════════════════
   FLOATING BRANDING & DOCKS
══════════════════════════════════════════════════════════════ */
.branding-container {
  position: absolute;
  top: 1.8rem;
  left: 2.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  z-index: 10;
  pointer-events: none;
}
@media (max-width: 1024px) {
  .branding-container {
    position: relative;
    top: 0; left: 0;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
.branding-logo {
  font-size: 2.3rem;
  filter: drop-shadow(0 0 15px rgba(167,139,250,0.85));
  animation: float 4s ease-in-out infinite;
}
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.branding-text {
  display: flex;
  flex-direction: column;
}
.branding-title {
  font-family: 'Cinzel Decorative', serif; font-size: 1.35rem; font-weight: 700;
  background: linear-gradient(135deg, #c4b5fd, #fbbf24);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.branding-sub { font-size: 0.62rem; letter-spacing: 0.12em; color: rgba(196,181,253,0.55); text-transform: uppercase; margin-top: 0.15rem; }

/* Apple-style Liquid Glass Dock */
.liquid-dock {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0.65rem;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 24px 50px rgba(0, 0, 0, 0.45),
    inset 0 0 15px rgba(255, 255, 255, 0.02);
  z-index: 10;
}
.liquid-dock--left {
  left: 2rem;
}
.liquid-dock--right {
  right: 2rem;
}
@media (max-width: 1024px) {
  .liquid-dock {
    position: static;
    transform: none;
    flex-direction: row;
    justify-content: center;
    border-radius: 100px;
    width: fit-content;
    margin: 0.5rem auto;
  }
}

.dock-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #c4b5fd;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.05);
}
.dock-btn:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.5);
  color: #fff;
  transform: scale(1.12) translateY(-2px);
  box-shadow: 
    0 10px 20px rgba(167, 139, 250, 0.3),
    inset 0 0 12px rgba(255, 255, 255, 0.1);
}
.dock-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
.dock-btn--disabled {
  background: rgba(255, 255, 255, 0.03) !important;
  color: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
  cursor: not-allowed;
}

.dock-btn--primary {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  border-color: rgba(167, 139, 250, 0.3);
  color: #fff;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.dock-badge {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(167, 139, 250, 0.25);
  background: rgba(167, 139, 250, 0.08);
  color: #e8e0f5;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 10px rgba(167, 139, 250, 0.15);
}

/* Floating Particles Layer */
.particles-layer {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  overflow: hidden;
}
.particle-orb {
  position: absolute;
  bottom: -20px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0) 70%);
  border-radius: 50%;
  filter: blur(1px);
  animation: floatUp linear infinite;
  opacity: 0;
}
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.65;
  }
  90% {
    opacity: 0.65;
  }
  100% {
    transform: translateY(-105vh) scale(1.3) translateX(30px);
    opacity: 0;
  }
}

.w-full { width: 100%; }

/* ══════════════════════════════════════════════════════════════
   CENTRAL VELVET TABLE
══════════════════════════════════════════════════════════════ */
.tarot-table {
  flex: 1;
  position: relative;
  background: rgba(6, 40, 31, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 28px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 
    inset 0 0 60px rgba(0,0,0,0.85),
    0 10px 40px rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  transition: all 1s cubic-bezier(0.25, 1, 0.5, 1);
  margin-left: 6.5rem; /* Room for left dock */
  margin-right: 6.5rem; /* Room for right dock */
}
.tarot-table--zoomed {
  border-color: rgba(167, 139, 250, 0.15);
  box-shadow: 
    inset 0 0 60px rgba(0,0,0,0.9),
    0 15px 50px rgba(88,28,135,0.12);
}
@media (max-width: 1024px) {
  .tarot-table {
    margin-left: 0; margin-right: 0;
    min-height: 480px;
  }
}

/* Setup configuration container */
.setup-container {
  max-width: 600px; width: 100%; padding: 2rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}
.setup-header { text-align: center; }
.setup-header h2 { font-family: 'Cinzel', serif; font-size: 1.5rem; color: #ede9fe; margin-bottom: 0.25rem; }
.setup-header p { font-size: 0.8rem; color: rgba(196,181,253,0.5); }

/* Apple-style 2-line Capsule Selector Grid (Tubes) */
.category-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.45rem;
  align-self: center;
  background: rgba(22, 12, 43, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0.25rem auto 0.75rem auto;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 2px rgba(255, 255, 255, 0.05);
}
.category-tabs::-webkit-scrollbar {
  display: none;
}
.category-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(237, 233, 254, 0.55);
  padding: 0.6rem 1rem;
  font-size: 0.76rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  border-radius: 9999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  -webkit-user-select: none;
  user-select: none;
}
.category-tab:hover:not(.category-tab--active) {
  color: rgba(237, 233, 254, 0.85);
  background: rgba(255, 255, 255, 0.04);
}
.category-tab--active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.35),
    inset 0 1px 1px rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-image: linear-gradient(135deg, rgba(167, 139, 250, 0.18), rgba(139, 92, 246, 0.18));
}
.category-tab__icon {
  font-size: 0.95rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}
.category-tab__name {
  letter-spacing: -0.015em;
}

/* Pick spread grid of small rectangular boxes */
.spread-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
  width: 100%;
  padding: 0.25rem;
}
@media (max-width: 480px) {
  .spread-picker {
    grid-template-columns: 1fr;
  }
}

.spread-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  border-radius: 12px;
  padding: 0.6rem 0.85rem;
  height: 60px;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.spread-option--active {
  border-color: rgba(167, 139, 250, 0.8);
  background: rgba(167, 139, 250, 0.15);
  box-shadow: 0 0 15px rgba(167, 139, 250, 0.2);
  transform: translateY(-2px);
}
.spread-option__icon {
  font-size: 1.6rem;
  margin-bottom: 0;
  flex-shrink: 0;
}
.spread-option__meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.spread-option__meta strong {
  display: block;
  font-size: 0.75rem;
  color: #ede9fe;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spread-option__meta span {
  display: block;
  font-size: 0.62rem;
  color: rgba(196,181,253,0.5);
  margin-top: 0.1rem;
}

.custom-slider { padding: 1rem; display: flex; align-items: center; gap: 1rem; }
.custom-slider label { font-size: 0.78rem; font-weight: 600; color: rgba(196,181,253,0.8); }
.custom-slider label strong { color: #a78bfa; font-size: 1.1rem; }
.velvet-slider {
  flex: 1; -webkit-appearance: none; appearance: none;
  height: 4px; border-radius: 10px; background: rgba(167,139,250,0.2); outline: none;
}
.velvet-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  box-shadow: 0 0 10px rgba(167,139,250,0.5); cursor: pointer;
}

.question-entry { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
.question-entry label { font-size: 0.75rem; font-weight: 700; color: rgba(196,181,253,0.7); }
.question-entry label span { font-weight: 500; opacity: 0.5; }
.question-entry textarea {
  width: 100%; background: rgba(0,0,0,0.25); border: 1px solid rgba(167,139,250,0.18);
  border-radius: 12px; padding: 0.75rem 1rem; color: #ede9fe; font-family: inherit;
  font-size: 0.82rem; resize: none; outline: none; line-height: 1.5;
}
.question-entry textarea::placeholder { color: rgba(196,181,253,0.25); }
.question-entry textarea:focus { border-color: rgba(167,139,250,0.45); }

/* Setup & Questionnaire Buttons layout */
.setup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}
.action-cta--secondary {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #c4b5fd !important;
  border: 1px solid rgba(167, 139, 250, 0.2) !important;
  box-shadow: none !important;
}
.action-cta--secondary:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.15) !important;
  border-color: rgba(167, 139, 250, 0.4) !important;
  color: #fff !important;
}

/* Questionnaire display styles */
.questionnaire-container {
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.questionnaire-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  text-align: left;
  border-radius: 20px;
}

.questionnaire-card__title {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  color: #ede9fe;
  line-height: 1.4;
  border-bottom: 1px dashed rgba(167, 139, 250, 0.15);
  padding-bottom: 0.6rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}

.option-pill {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(167, 139, 250, 0.18);
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
  color: rgba(237, 233, 254, 0.8);
  font-size: 0.76rem;
  line-height: 1.4;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.option-pill:hover {
  background: rgba(167, 139, 250, 0.08);
  border-color: rgba(167, 139, 250, 0.35);
  color: #fff;
  transform: translateY(-1px);
}
.option-pill--selected {
  background: rgba(167, 139, 250, 0.2) !important;
  border-color: rgba(167, 139, 250, 0.85) !important;
  color: #fff !important;
  box-shadow: 0 0 15px rgba(167, 139, 250, 0.25);
}

.option-bullet {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(167, 139, 250, 0.25);
  color: #a78bfa;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.72rem;
  transition: all 0.25s ease;
}
.option-pill--selected .option-bullet {
  background: #a78bfa;
  color: #0c051a;
  border-color: #a78bfa;
}

.option-text {
  flex: 1;
}

.questionnaire-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.questionnaire-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #c4b5fd;
  line-height: 1.4;
}
.questionnaire-input {
  width: 100%;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(167,139,250,0.2);
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  color: #ede9fe;
  font-size: 0.82rem;
  outline: none;
}
.questionnaire-input:focus {
  border-color: rgba(167,139,250,0.5);
}

/* Outro slide clarification form style */
.clarification-form {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px dashed rgba(167, 139, 250, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.clarification-form h4 {
  font-size: 0.82rem;
  color: #ede9fe;
  font-family: 'Cinzel', serif;
  margin-bottom: 0.25rem;
}

/* ══════════════════════════════════════════════════════════════
   PLAYGROUND: LAYING OUT THE SPREADS
══════════════════════════════════════════════════════════════ */
.table-playground {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}

.table-canvas {
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
  transform-origin: center center;
}

/* Card Slot placed on coordinates */
.table-card-slot {
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  transition: opacity 0.8s, filter 0.8s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.table-card-slot__pos-name {
  font-size: 0.52rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.08em; color: rgba(196,181,253,0.4);
  text-align: center; max-width: 120px;
  transition: opacity 0.3s;
}

/* Blurred state for unfocused cards */
.table-card-slot--blurred {
  opacity: 0.15;
  filter: blur(4px);
  pointer-events: none;
}
.table-card-slot--blurred .table-card-slot__pos-name { opacity: 0; }

/* Zoomed layout for the focused active card */
.table-card-slot--focused {
  transform: translate(-50%, -50%) !important;
  z-index: 100 !important;
}

/* ══════════════════════════════════════════════════════════════
   LIQUID GLASS EXPLANATION BUBBLE
══════════════════════════════════════════════════════════════ */
.explanation-panel {
  position: absolute;
  width: 320px; max-height: 75vh; overflow-y: auto;
  padding: 1.25rem; z-index: 101;
  pointer-events: auto;
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(12, 5, 26, 0.82);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  animation: explanationPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes explanationPop {
  from { transform: translateY(-30%) scale(0.85); opacity: 0; }
  to   { transform: translateY(-50%) scale(1);    opacity: 1; }
}

.explanation-panel__header {
  border-bottom: 1px solid rgba(167,139,250,0.15);
  padding-bottom: 0.5rem; margin-bottom: 0.65rem;
}
.explanation-panel__header h3 { font-family: 'Cinzel', serif; font-size: 0.95rem; color: #ede9fe; }
.explanation-panel__pos { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; color: #a78bfa; }
.explanation-panel__text { font-size: 0.82rem; line-height: 1.7; color: rgba(237,233,254,0.85); }

/* Floating error panel */
.error-panel-floating {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(220,38,38,0.3);
  background: rgba(22, 10, 42, 0.94);
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #fca5a5;
  font-size: 0.8rem;
  border-radius: 100px;
}
.error-panel-floating span {
  font-size: 1.2rem;
}

/* Bottom Navigation Dock for Slideshow Arrows */
.bottom-nav-dock {
  position: absolute;
  bottom: 2.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  background: rgba(22, 10, 42, 0.55);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 15px rgba(255,255,255,0.02);
  z-index: 102;
}

.large-nav-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #ede9fe;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
}
.large-nav-btn:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.25);
  border-color: rgba(167, 139, 250, 0.6);
  color: #fff;
  transform: scale(1.15);
  box-shadow: 
    0 10px 25px rgba(167,139,250,0.35),
    inset 0 0 15px rgba(255,255,255,0.1);
}
.large-nav-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.large-nav-badge {
  padding: 0.5rem 1.5rem;
  border-radius: 100px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  background: rgba(167, 139, 250, 0.1);
  color: #e8e0f5;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  box-shadow: inset 0 0 15px rgba(167,139,250,0.2);
}

.spinner {
  width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
  display: inline-block; vertical-align: middle; margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(8,2,20,0.88);
  backdrop-filter: blur(25px); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal {
  background: rgba(22, 10, 42, 0.96);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 24px; padding: 2.5rem; max-width: 380px; width: 100%;
  text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.7);
  animation: modalScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalScale { from{transform:scale(0.88);opacity:0} to{transform:scale(1);opacity:1} }
.modal__crystal { font-size: 2.5rem; margin-bottom: 0.8rem; }
.modal h2 { font-family: 'Cinzel', serif; font-size: 1.15rem; color: #ede9fe; margin-bottom: 0.5rem; }
.modal p { font-size: 0.78rem; color: rgba(196,181,253,0.5); line-height: 1.5; margin-bottom: 1.25rem; }
.modal__input {
  width: 100%; background: rgba(0,0,0,0.25); border: 1px solid rgba(167,139,250,0.2);
  border-radius: 12px; padding: 0.75rem 1rem; color: #ede9fe; font-family: monospace;
  font-size: 0.85rem; text-align: center; outline: none; margin-bottom: 1rem;
}
.modal__input:focus { border-color: rgba(167,139,250,0.5); }
.modal__actions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem; }
.modal__link a { font-size: 0.68rem; color: rgba(167,139,250,0.5); text-decoration: none; }
.modal__link a:hover { color: #c4b5fd; text-decoration: underline; }

/* ══════════════════════════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════════════════════════ */
.fade-up-enter-active { transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1); }
.fade-up-enter-from   { opacity: 0; transform: translateY(30px); }
.fade-up-enter-to     { opacity: 1; transform: translateY(0); }

.fade-scale-enter-active,
.fade-scale-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fade-scale-enter-from,
.fade-scale-leave-to     { opacity: 0; transform: translateY(-50%) scale(0.85); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.fade-in { animation: fadeIn 0.6s cubic-bezier(0.25, 1, 0.5, 1) both; }
@keyframes fadeIn { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
.fade-in-fast { animation: fadeIn 0.35s ease both; }

/* ══════════════════════════════════════════════════════════════
   SCROLLBAR
══════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.15); border-radius: 3px; }
</style>
