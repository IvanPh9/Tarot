<template>
  <div class="reading" :class="{ 'reading--streaming': isStreaming }">
    <!-- ══ HEADER ══ -->
    <div class="reading__header">
      <div class="reading__icon-wrap">
        <span class="reading__icon">🔮</span>
      </div>
      <div>
        <h2 class="reading__title">{{ t('oracleSpeaks') }}</h2>
        <div class="reading__status">
          <span class="status-dot" :class="isStreaming ? 'status-dot--live' : 'status-dot--done'" />
          <span>{{ isStreaming ? t('channeling') : t('readingComplete') }}</span>
        </div>
      </div>
    </div>

    <!-- ══ LOADING STATE ══ -->
    <div v-if="isStreaming && !parsedData" class="reading__shimmer">
      <div class="shimmer-line" v-for="i in 5" :key="i" :style="{width: [82,66,91,55,75][i-1]+'%'}" />
    </div>

    <!-- ══ ERROR STATE ══ -->
    <div v-else-if="error" class="reading__error">
      <span>⚠️</span>
      <div>
        <strong>{{ t('oracleUnavailable') }}</strong>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- ══ INTERACTIVE SLIDESHOW ══ -->
    <div v-else-if="parsedData" class="slideshow">
      
      <!-- SLIDE 0: INTRODUCTION -->
      <div v-if="slideIndex === 0" class="slide fade-in-slide">
        <div class="intro-slide">
          <div class="intro-slide__orb">🔮</div>
          <h3 class="intro-slide__heading">{{ t('intro') }}</h3>
          <p class="intro-slide__text">{{ parsedData.introduction }}</p>
        </div>
      </div>

      <!-- CARD INTERPRETATION SLIDES (1 to N) -->
      <div v-else-if="slideIndex > 0 && slideIndex <= totalInterpretationSlides" class="slide fade-in-slide">
        <div class="card-slide">
          
          <!-- Left side: Card Preview -->
          <div class="card-slide__card-column">
            <span class="card-slide__position">{{ currentInterpretation?.position || '' }}</span>
            
            <div class="card-preview" :class="{ 'card-preview--reversed': matchedCard?.reversed }">
              <div class="card-preview__inner">
                <img
                  v-if="matchedCard?.image"
                  :src="matchedCard.image"
                  :alt="matchedCard.name"
                  class="card-preview__img"
                />
                <div v-else class="card-preview__fallback">
                  <span class="card-preview__fallback-emoji">✨</span>
                  <span class="card-preview__fallback-name">{{ matchedCard?.name || currentInterpretation?.cardName }}</span>
                </div>
                
                <!-- Reversed Ribbon Indicator -->
                <div v-if="matchedCard?.reversed" class="card-preview__reversed-badge">
                  ↕ {{ locale === 'uk' ? 'Перевернута' : 'Reversed' }}
                </div>
              </div>
            </div>
            
            <h4 class="card-slide__card-name">
              {{ currentInterpretation?.cardName }}
              <span v-if="matchedCard?.reversed" class="card-slide__reversed-label">
                ({{ locale === 'uk' ? 'Перевернута' : 'Reversed' }})
              </span>
            </h4>
          </div>

          <!-- Right side: Interpretation Text -->
          <div class="card-slide__text-column">
            <p class="card-slide__explanation">{{ currentInterpretation?.text }}</p>
          </div>

        </div>
      </div>

      <!-- SLIDE N+1: CORE GUIDANCE / OUTRO -->
      <div v-else-if="slideIndex === totalSlides - 1" class="slide fade-in-slide">
        <div class="guidance-slide">
          <div class="guidance-slide__icon">🌟</div>
          <h3 class="guidance-slide__heading">{{ t('adviceHeader') }}</h3>
          <p class="guidance-slide__text">{{ parsedData.guidance }}</p>
        </div>
      </div>

      <!-- ══ NAVIGATION CONTROLS ══ -->
      <div class="slideshow__nav">
        <!-- Progress Indicators -->
        <div class="slideshow__dots">
          <button
            v-for="sIdx in totalSlides" :key="sIdx"
            class="slideshow__dot"
            :class="{ 'slideshow__dot--active': slideIndex === sIdx - 1 }"
            @click="slideIndex = sIdx - 1"
            :aria-label="`Go to slide ${sIdx}`"
          />
        </div>

        <div class="slideshow__buttons">
          <button
            class="slide-btn"
            :disabled="slideIndex === 0"
            @click="prevSlide"
          >
            {{ t('prev') }}
          </button>
          
          <button
            class="slide-btn slide-btn--primary"
            @click="nextSlide"
          >
            {{ slideIndex === totalSlides - 1 ? t('newReading') : slideIndex === totalSlides - 2 ? t('finish') : t('next') }}
          </button>
        </div>
      </div>

    </div>

    <!-- ══ FALLBACK FOR RAW TEXT RESPONSE ══ -->
    <div v-else-if="fullText" class="reading__body">
      <div class="reading__text" v-html="renderedRaw" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { translations } from "../translations.js";

const props = defineProps({
  fullText:    { type: String,  default: "" },
  isStreaming: { type: Boolean, default: false },
  error:       { type: String,  default: null },
  drawnCards:  { type: Array,   default: () => [] },
  locale:      { type: String,  default: "uk" }
});

const emit = defineEmits(["reset-reading"]);

const slideIndex = ref(0);

// Helper for local translations inside ReadingPanel
function t(key) {
  return translations[props.locale]?.[key] || key;
}

// Reset slideshow index if reading resets or loading starts
watch(() => props.isStreaming, (newStreaming) => {
  if (newStreaming) slideIndex.value = 0;
});
watch(() => props.fullText, () => {
  slideIndex.value = 0;
});

// Robust JSON parser: extracts content between first { and last }
const parsedData = computed(() => {
  if (!props.fullText) return null;
  try {
    let text = props.fullText.trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(text);
    console.log("ReadingPanel parsed JSON successfully:", parsed);
    return parsed;
  } catch (err) {
    if (!props.isStreaming) {
      console.warn("JSON parsing error on Gemini output:", err, props.fullText);
    }
    return null;
  }
});

// Render raw text fallback helper
const renderedRaw = computed(() => {
  let t = props.fullText;
  if (!t) return "";
  t = t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  t = t.replace(/^## (.+)$/gm, '<h3 class="r-h3">$1</h3>');
  t = t.replace(/^# (.+)$/gm,  '<h2 class="r-h2">$1</h2>');
  t = t.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");
  t = t.replace(/^---+$/gm, '<hr class="r-hr" />');
  t = t.replace(/\n\n+/g, '</p><p class="r-p">');
  t = `<p class="r-p">${t}</p>`;
  t = t.replace(/\n/g, "<br>");
  return t;
});

// Slide counts
const totalInterpretationSlides = computed(() => {
  return parsedData.value?.interpretations?.length || 0;
});

const totalSlides = computed(() => {
  if (!parsedData.value) return 0;
  const count = 1 + totalInterpretationSlides.value + 1;
  console.log("ReadingPanel totalSlides computed:", count, "interpretations:", totalInterpretationSlides.value);
  return count;
});

// Get data for current card slide
const currentInterpretation = computed(() => {
  if (!parsedData.value || !parsedData.value.interpretations || slideIndex.value === 0 || slideIndex.value > totalInterpretationSlides.value) {
    return null;
  }
  return parsedData.value.interpretations[slideIndex.value - 1] || null;
});

// Get the card drawn in the spread for the current slide index
const matchedCard = computed(() => {
  if (!props.drawnCards || slideIndex.value < 1 || slideIndex.value > totalInterpretationSlides.value) {
    return null;
  }
  return props.drawnCards[slideIndex.value - 1] || null;
});

// Navigation handlers
function nextSlide() {
  console.log("nextSlide clicked. Current index:", slideIndex.value, "Total slides:", totalSlides.value);
  if (slideIndex.value < totalSlides.value - 1) {
    slideIndex.value++;
    console.log("Advanced slideIndex to:", slideIndex.value);
  } else {
    console.log("At last slide, emitting reset-reading");
    emit("reset-reading");
  }
}

function prevSlide() {
  console.log("prevSlide clicked. Current index:", slideIndex.value);
  if (slideIndex.value > 0) {
    slideIndex.value--;
    console.log("Reduced slideIndex to:", slideIndex.value);
  }
}
</script>

<style scoped>
.reading {
  background: rgba(20, 8, 42, 0.6);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 24px;
  padding: 2.25rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  transition: border-color 0.3s ease;
}
.reading--streaming { border-color: rgba(167, 139, 250, 0.45); }

/* Top border gradient animation */
.reading::before {
  content: "";
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #7c3aed, #fbbf24, #ec4899, #7c3aed);
  background-size: 300% 100%;
  animation: bar-shift 4s linear infinite;
}
@keyframes bar-shift { to { background-position: 300% 0; } }

/* Header */
.reading__header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 2rem; padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.reading__icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.reading__icon { font-size: 1.6rem; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

.reading__title {
  font-family: 'Cinzel', serif;
  font-size: 1.15rem; font-weight: 700; color: #e8e0f5;
  margin: 0 0 0.15rem;
}
.reading__status {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.72rem; color: rgba(196,181,253,0.5); font-weight: 600;
}
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.status-dot--live { background: #a78bfa; animation: pulse 1.1s ease-in-out infinite; }
.status-dot--done { background: #34d399; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

/* Shimmer loader */
.reading__shimmer { display: flex; flex-direction: column; gap: 0.8rem; }
.shimmer-line {
  height: 14px; border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(167,139,250,0.08) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

/* Error box */
.reading__error {
  display: flex; gap: 1rem; align-items: flex-start;
  background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 16px; padding: 1.25rem; color: #fca5a5; font-size: 0.875rem;
}
.reading__error strong { display: block; margin-bottom: 0.2rem; color: #f87171; }

/* Slideshow */
.slideshow {
  display: flex; flex-direction: column; min-height: 280px;
}

.slide {
  flex: 1; display: flex; align-items: center; justify-content: center;
}
.fade-in-slide {
  animation: slideFadeIn 0.45s cubic-bezier(0.25, 1, 0.5, 1) both;
}
@keyframes slideFadeIn {
  from { opacity: 0; transform: scale(0.97) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Slide 0: Intro Slide Layout */
.intro-slide {
  text-align: center; max-width: 600px; padding: 1.5rem 0;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.intro-slide__orb {
  font-size: 3rem; filter: drop-shadow(0 0 20px rgba(167,139,250,0.7));
  animation: float 4s ease-in-out infinite;
}
.intro-slide__heading {
  font-family: 'Cinzel', serif; font-size: 1.3rem; color: #c4b5fd;
}
.intro-slide__text {
  font-size: 0.95rem; line-height: 1.8; color: rgba(232, 224, 245, 0.85);
  font-style: italic;
}

/* Slide 1 to N: Card Slide Layout */
.card-slide {
  display: grid; grid-template-columns: 180px 1fr; gap: 2.25rem; width: 100%; align-items: center;
}
@media (max-width: 640px) {
  .card-slide { grid-template-columns: 1fr; text-align: center; gap: 1.5rem; }
}

.card-slide__card-column {
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.card-slide__position {
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.12em; color: #a78bfa;
}
.card-slide__card-name {
  font-family: 'Cinzel', serif; font-size: 0.9rem; color: #e8e0f5; text-align: center;
}
.card-slide__reversed-label { font-size: 0.75rem; color: #ef4444; font-weight: normal; margin-left: 0.2rem; }

/* Custom Mini Card Preview */
.card-preview {
  width: 110px; aspect-ratio: 2/3.4; border-radius: 10px;
  overflow: hidden; border: 1.5px solid rgba(167,139,250,0.3);
  background: #120a22; box-shadow: 0 10px 24px rgba(0,0,0,0.5);
  transition: transform 0.4s ease, border-color 0.3s;
}
.card-preview:hover { transform: translateY(-4px) scale(1.03); border-color: rgba(167,139,250,0.6); }

.card-preview__inner { width: 100%; height: 100%; position: relative; }
.card-preview__img { width: 100%; height: 100%; object-fit: cover; object-position: top; }

.card-preview--reversed .card-preview__img { transform: rotate(180deg); }

.card-preview__fallback {
  width: 100%; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; background: linear-gradient(160deg,#1a0835,#0d0215); gap: 0.4rem;
}
.card-preview__fallback-emoji { font-size: 2.2rem; filter: drop-shadow(0 0 8px rgba(167,139,250,0.6)); }
.card-preview__fallback-name { font-size: 0.48rem; color: rgba(196,181,253,0.5); text-align: center; padding: 0 0.3rem; }

.card-preview__reversed-badge {
  position: absolute; top: 4px; right: 4px; background: rgba(220,38,38,0.9);
  color: #fff; font-size: 0.48rem; font-weight: 700; padding: 0.1rem 0.25rem; border-radius: 4px;
}

.card-slide__text-column {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 18px; padding: 1.5rem; min-height: 160px;
  display: flex; align-items: center;
}
.card-slide__explanation {
  font-size: 0.95rem; line-height: 1.85; color: rgba(232, 224, 245, 0.88);
}

/* Slide N+1: Guidance Slide Layout */
.guidance-slide {
  text-align: center; max-width: 600px; padding: 1.5rem 0;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.guidance-slide__icon {
  font-size: 3rem; filter: drop-shadow(0 0 20px rgba(251,191,36,0.7));
  animation: float 4s ease-in-out infinite;
}
.guidance-slide__heading {
  font-family: 'Cinzel', serif; font-size: 1.3rem; color: #fbbf24;
}
.guidance-slide__text {
  font-size: 0.95rem; line-height: 1.8; color: rgba(232, 224, 245, 0.88);
}

/* Navigation footer */
.slideshow__nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 2.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06);
}
@media (max-width: 480px) {
  .slideshow__nav { flex-direction: column; gap: 1.25rem; }
}

.slideshow__dots { display: flex; gap: 0.45rem; }
.slideshow__dot {
  width: 8px; height: 8px; border-radius: 50%; border: none;
  background: rgba(167, 139, 250, 0.2); cursor: pointer;
  transition: all 0.25s ease;
}
.slideshow__dot--active {
  background: #a78bfa; transform: scale(1.3);
  box-shadow: 0 0 8px rgba(167,139,250,0.8);
}

.slideshow__buttons { display: flex; gap: 0.75rem; }

.slide-btn {
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(196,181,253,0.85); font-family: inherit; font-size: 0.82rem; font-weight: 700;
  padding: 0.55rem 1.25rem; border-radius: 100px; cursor: pointer;
  transition: all 0.2s ease;
}
.slide-btn:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.15); border-color: rgba(167,139,250,0.4); color: #c4b5fd;
}
.slide-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.slide-btn--primary {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  border: none; color: #fff; box-shadow: 0 4px 12px rgba(88,28,135,0.3);
}
.slide-btn--primary:hover:not(:disabled) {
  filter: brightness(1.15); transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(88,28,135,0.45);
}
</style>
