<template>
  <div class="flex flex-wrap justify-evenly items-start gap-4 mb-4">
    <div
      class="about card w-180 bg-base-100 shadow-xl"
      :class="{ 'card-side': sm }"
    >
      <figure class="h-10rem sm:h-20rem">
        <img
          class="h-full"
          src="/icons/logo.svg"
          alt="Logo"
        >
      </figure>
      <div class="card-body">
        <h2 class="card-title">
          {{ TITLE }}
        </h2>
        <div class="divide-y divide-primary">
          <div
            class="m-1 w-full flex items-center py-4"
          >
            <div class="min-w-40 font-semibold">
              {{ $t('pages.about.author') }}:
            </div>
            <div class="w-full">
              <a
                v-if="author.email"
                :href="`mailto:${author.email}`"
                class="link link-hover"
              >{{ author.name }}</a>
              <span
                v-else
                class="ml-2"
              >{{ author.name }}</span>
              <span v-if="author.url">(<a :href="author.url">{{ author.url }}</a>)</span>
            </div>
          </div>
          <div
            class="m-1 w-full flex items-center py-4"
          >
            <div class="min-w-40 font-semibold">
              {{ $t('pages.about.description') }}:
            </div>
            <div class="w-full">
              {{ DESCRIPTION }}
            </div>
          </div>
          <div
            class="m-1 w-full flex items-center py-4"
          >
            <div class="min-w-40 font-semibold">
              {{ $t('pages.about.version') }}:
            </div>
            <div class="w-full">
              {{ VERSION }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card w-180 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">
          OSS Licenses
        </h2>
        <Licenses />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import type Licenses from '../components/Licenses.vue';
import { parseAuthorString, type Author } from '../utils';

const TITLE = import.meta.env.VITE_TITLE,
  sm = useBreakpoints(breakpointsTailwind).greaterOrEqual('sm'),
  AUTHOR = import.meta.env.VITE_AUTHOR,
  DESCRIPTION = import.meta.env.VITE_DESCRIPTION,
  VERSION = import.meta.env.VITE_VERSION;

let author: Author;

try {
  author = JSON.parse(AUTHOR);
  if (typeof author === 'string') {
    author = parseAuthorString(author);
  }
} catch {
  author = parseAuthorString(AUTHOR);
}

</script>

<style lang="scss">
.about {
  @media (min-width: 640px) {
    @apply card-side;
  }
}
</style>
