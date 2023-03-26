<template>
  <div class="form-control w-full mb-4">
    <div class="input-group">
      <input
        v-model="filter"
        type="text"
        :placeholder="`${$t('components.licenses.search')}…`"
        class="input input-bordered w-full"
      >
      <span>
        <icon-mdi-magnify />
      </span>
    </div>
  </div>
  <div
    v-if="error"
    class="flex items-center text-error"
  >
    <icon-mdi-alert-box-outline />
    <span class="ml-2">{{ $t('components.licenses.loadError') }}</span>
  </div>
  <ul
    v-else
    class="divide-y divide-primary flex flex-wrap"
  >
    <li
      v-for="dependency in filteredDependencies"
      :key="`${dependency.name}@${dependency.version}`"
      class="grid grid-cols-[1fr_max-content] sm:grid-cols-[1fr_2fr_max-content] py-2 text-sm w-full gap-2"
    >
      <div class="font-bold order-1">
        {{ dependency.name }}
      </div>
      <div class="order-3 sm:order-2">
        {{ dependency.description }}
      </div>
      <span class="badge badge-secondary group-hover:badge-outline gap-2 order-2 sm:order-3">
        {{ dependency.license }}
      </span>
      <div class="order-4">
        v{{ dependency.version }}
      </div>
      <div class="order-5">
        <span v-if="typeof dependency.author === 'string'">{{ dependency.author }}</span>
        <a
          v-else-if="dependency.author"
          :href="`mailto:${dependency.author.email}`"
          class="link link-hover"
        >
          {{ dependency.author.name }}
        </a>
      </div>
      <div class="order-6">
        <a
          v-if="dependency.repository"
          :href="dependency.repository"
          class="link link-hover"
        >
          <icon-mdi-open-in-new class="inline" /> Source
        </a>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { useFetch, type AfterFetchContext } from '@vueuse/core';
import { computed, ref } from 'vue';
import { parseAuthorString, type Author } from '../utils';

interface Dependency {
  name: string
  version: string
  author: string | Author
  license: string
  licenseText: string | null
  repository: string | null
  description: string | null
}

interface FetchResponse {
  libraries: Array<Dependency>
}

const BASE_URL = import.meta.env.BASE_URL,
  filter = ref(''),
  { error, data: dependencies } = useFetch(`${BASE_URL}disclosure.json`, { // isFetching
    afterFetch(context : AfterFetchContext<FetchResponse>) {
      context.data = context.data
        ? {
            libraries: context.data.libraries.map((dependency) => {
              return {
                ...dependency,
                author: typeof dependency.author === 'string' ? parseAuthorString(dependency.author) : dependency.author
              };
            })
          }
        : null;
      return context;
    }
  }).get().json<FetchResponse>(),
  filteredDependencies = computed(() => dependencies.value?.libraries.filter((library) => library.name.includes(filter.value)));

</script>
