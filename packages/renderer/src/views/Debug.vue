<template>
  <h2 class="mb-2">
    Mandatory:
  </h2>
  <div class="flex flex-wrap gap-4">
    <div
      v-for="(key, color) in mandatory"
      :key="key"
      class="tooltip tooltip-bottom"
      :data-tip="`--${key}`"
    >
      <div
        class="h-14 w-30 rounded-$rounded-btn p-2 flex justify-center items-center border-current border-1"
        :style="{ 'background-color': `hsl(var(--${key}))` }"
      >
        <span
          class="text-white mix-blend-difference text-center"
        >{{ color }}</span>
      </div>
    </div>
  </div>
  <h2 class="mt-4 mb-2">
    Optional:
  </h2>
  <div class="flex flex-wrap gap-4">
    <div
      v-for="(key, color) in optional"
      :key="key"
      class="tooltip tooltip-bottom"
      :data-tip="`--${key}`"
    >
      <div
        class="h-14 w-30 rounded-$rounded-btn p-2 flex justify-center items-center border-current border-1"
        :style="{ 'background-color': `hsl(var(--${key}))` }"
      >
        <span class="text-white mix-blend-difference text-center">{{ color }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const mandatory = {
    primary: 'p',
    secondary: 's',
    accent: 'a',
    neutral: 'n',
    'base-100': 'b1'
  },
  optional = {
    'primary-focus': 'pf',
    'primary-content': 'pc',
    'secondary-focus': 'sf',
    'secondary-content': 'sc',
    'accent-focus': 'af',
    'accent-content': 'ac',
    'neutral-content': 'nc',
    'neutral-focus': 'nf',
    'base-200': 'b2',
    'base-300': 'b3',
    'base-content': 'bc',
    info: 'in',
    'info-content': 'inc',
    success: 'su',
    'success-content': 'suc',
    warning: 'wa',
    'warning-content': 'wac',
    error: 'er'
  };

</script>
