<template>
  <!-- Session Type Card — Light Theme -->
  <div
    class="session-card"
    :class="{ selected: isSelected }"
    :style="isSelected ? { '--card-gradient': session.gradient } : {}"
    @click="$emit('select', session)"
    role="button"
    :aria-pressed="isSelected"
    :aria-label="`Select ${session.name} session`"
  >
    <div class="session-card__icon-wrap" :style="{ background: session.gradient }">
      <span class="session-card__icon">{{ session.icon }}</span>
    </div>
    <div class="session-card__body">
      <h3 class="session-card__title">{{ session.name }}</h3>
      <p class="session-card__desc">{{ session.description }}</p>
      <div class="session-card__meta">
        <span class="badge">{{ cardCountLabel }}</span>
        <span v-if="isSelected" class="badge badge--selected">✓ Selected</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  session: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
});
defineEmits(["select"]);

const cardCountLabel = computed(() => {
  const { minCards, maxCards } = props.session;
  if (minCards === maxCards) return `${minCards} card${minCards > 1 ? "s" : ""}`;
  return `${minCards}–${maxCards} cards`;
});
</script>

<style scoped>
.session-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  padding: 1.1rem;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.25s ease,
    box-shadow 0.25s ease;
  user-select: none;
}

.session-card:hover {
  transform: translateY(-5px) scale(1.015);
  border-color: #c4b5fd;
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.12);
}

.session-card.selected {
  border-color: transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              var(--card-gradient, linear-gradient(135deg, #7c3aed, #4c1d95)) border-box;
  box-shadow: 0 0 0 2px transparent, 0 12px 40px rgba(124, 58, 237, 0.18);
  transform: translateY(-3px);
}

.session-card__icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.session-card__icon {
  font-size: 1.5rem;
  line-height: 1;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
}

.session-card__body {
  flex: 1;
  min-width: 0;
}

.session-card__title {
  font-size: 0.875rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}

.session-card__desc {
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0 0 0.6rem;
  line-height: 1.5;
}

.session-card__meta {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.65rem;
  padding: 0.2rem 0.55rem;
  border-radius: 100px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 700;
}

.badge--selected {
  background: rgba(124, 58, 237, 0.08);
  border-color: rgba(124, 58, 237, 0.35);
  color: #7c3aed;
}
</style>
