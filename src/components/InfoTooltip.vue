<script setup lang="ts">
import { ref } from 'vue';
import { TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent, TooltipArrow } from 'reka-ui';

defineProps({
  content: String,
  side: { type: String as () => 'top' | 'right' | 'bottom' | 'left', default: 'right' },
  align: { type: String as () => 'start' | 'center' | 'end', default: 'start' }
});

const open = ref(false);

function toggleTooltip() {
  open.value = !open.value;
}
</script>

<template>
  <TooltipRoot v-model:open="open" :disable-hoverable-content="true">
    <TooltipTrigger as-child>
      <button
        type="button"
        class="info-icon"
        aria-label="More information"
        @click.prevent="toggleTooltip"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      </button>
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        class="tooltip-content"
        :side="side"
        :align="align"
        :side-offset="8"
        :collision-padding="16"
      >
        <span class="tooltip-text">{{ content }}</span>
        <TooltipArrow class="tooltip-arrow" :width="10" :height="5" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style scoped>
.info-icon {
  appearance: none;
  background: none;
  border: none;
  padding: 2px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-3);
  transition: color 150ms ease;
  flex-shrink: 0;
  vertical-align: middle;
  border-radius: 4px;
}
.info-icon:hover {
  color: var(--ink);
  background: var(--bg-soft);
}
.info-icon:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
.info-icon:active {
  color: var(--ink);
}
</style>

<style>
/* Global styles for tooltip - cannot be scoped */
.tooltip-content {
  max-width: 340px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--bg) !important;
  background: var(--ink) !important;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
  z-index: 99999 !important;
  animation: tooltipFadeIn 180ms ease-out;
  word-wrap: break-word;
  white-space: normal;
  font-family: "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.tooltip-text {
  display: block;
  color: var(--bg);
  white-space: pre-wrap;
  word-break: break-word;
}

.tooltip-arrow {
  fill: var(--ink) !important;
  filter: drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.1));
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 768px) {
  .tooltip-content {
    max-width: min(90vw, 320px);
    font-size: 12.5px;
    padding: 10px 12px;
  }
}
</style>
