<template>
  <div
    class="card"
    :class="{ 'card--flipped': flipped, 'card--reversed': card?.reversed && flipped }"
    @click="$emit('flip')"
    role="button"
    :aria-label="card ? card.name : 'Tarot card (face down)'"
  >
    <div class="card__inner">
      <!-- ── BACK ── -->
      <div class="card__back">
        <img :src="baseUrl + 'cards/CardBacks.png'" alt="Card back" class="card__back-img" />
      </div>

      <!-- ── FRONT ── -->
      <div class="card__front" v-if="card">
        <!-- Image -->
        <div class="card__img-wrap">
          <img
            v-if="card.image && !imgErr"
            :src="card.image"
            :alt="card.name"
            class="card__img"
            loading="lazy"
            @error="imgErr = true"
          />
          <div v-else class="card__img-fallback">
            <span class="card__fallback-emoji">{{ fallbackEmoji }}</span>
            <span class="card__fallback-name">{{ shortName }}</span>
          </div>

          <!-- Reversed tag -->
          <div v-if="card.reversed" class="card__reversed-tag">↕</div>
        </div>

        <!-- Footer -->
        <div class="card__footer">
          <div class="card__name">{{ card.name }}</div>
          <div class="card__sub">{{ cardSub }}</div>
        </div>
      </div>
    </div>

    <div v-if="!flipped" class="card__tap-hint">tap</div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const baseUrl = import.meta.env.BASE_URL;

const props = defineProps({
  card: { type: Object, default: null },
  flipped: { type: Boolean, default: false },
});
defineEmits(["flip"]);

const imgErr = ref(false);

const SUIT_EMOJIS = { Wands: "🔥", Cups: "💧", Swords: "⚔️", Pentacles: "🌿" };
const fallbackEmoji = computed(() =>
  props.card?.suit ? SUIT_EMOJIS[props.card.suit] : "✨"
);

const shortName = computed(() => {
  if (!props.card) return "";
  return props.card.name.replace("The ", "");
});

const cardSub = computed(() => {
  if (!props.card) return "";
  if (props.card.suit === null) return "Major Arcana";
  return props.card.suit;
});
</script>

<style scoped>
.card {
  width: 120px;
  flex-shrink: 0;
  cursor: pointer;
  perspective: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  transition: transform 0.2s ease;
}
.card:hover { transform: translateY(-10px); }

@media (min-width: 640px) { .card { width: 140px; } }
@media (max-width: 480px) { 
  .card { width: 70px; gap: 0.2rem; }
  .card__name { font-size: 0.5rem; }
  .card__sub { font-size: 0.4rem; }
  .card:hover { transform: translateY(-5px); }
}

.card__inner {
  width: 100%; aspect-ratio: 2 / 3.4;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
}
.card--flipped .card__inner    { transform: rotateY(180deg); }
.card--reversed .card__inner   { transform: rotateY(180deg) rotateZ(180deg); }

/* ── BACK ───────────────────────────────────────────────── */
.card__back,
.card__front {
  position: absolute; inset: 0; border-radius: 12px;
  backface-visibility: hidden; overflow: hidden;
}

.card__back {
  border: 1.5px solid rgba(167,139,250,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  overflow: hidden;
}

.card__back-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.card:hover .card__back-img { transform: scale(1.04); }

/* ── FRONT ──────────────────────────────────────────────── */
.card__front {
  transform: rotateY(180deg);
  background: #1a1025;
  border: 1.5px solid rgba(167,139,250,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
}

.card__img-wrap {
  flex: 1; position: relative; overflow: hidden;
  background: #120a22;
}

.card__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: top;
  display: block;
  filter: contrast(1.05) saturate(0.95);
  transition: transform 0.4s ease;
}
.card:hover .card__img { transform: scale(1.04); }

.card__img-fallback {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.5rem;
  background: linear-gradient(160deg, #1a0835, #0d0215);
}
.card__fallback-emoji { font-size: 2.5rem; filter: drop-shadow(0 0 8px rgba(167,139,250,0.6)); }
.card__fallback-name  { font-size: 0.5rem; font-weight: 700; color: rgba(196,181,253,0.5); text-align: center; padding: 0 0.4rem; }

.card__reversed-tag {
  position: absolute; top: 5px; right: 5px;
  background: rgba(220,38,38,0.85);
  color: #fff; font-size: 0.6rem; font-weight: 700;
  padding: 0.15rem 0.35rem; border-radius: 4px; line-height: 1;
}

.card__footer {
  background: rgba(0,0,0,0.4);
  border-top: 1px solid rgba(167,139,250,0.15);
  padding: 0.4rem 0.5rem;
}
.card__name {
  font-size: 0.6rem; font-weight: 800; color: #e8e0f5;
  line-height: 1.2; margin-bottom: 0.15rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card__sub {
  font-size: 0.48rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: rgba(167,139,250,0.55);
}

/* ── TAP HINT ───────────────────────────────────────────── */
.card__tap-hint {
  font-size: 0.52rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: rgba(167,139,250,0.3);
  transition: opacity 0.2s;
}
.card:hover .card__tap-hint { opacity: 0.7; }
</style>
