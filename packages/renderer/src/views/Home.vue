<template>
  <div class="flex flex-wrap gap-4 mb-4 min-w-60">
    <Help
      :is="profile.popupHelp ? Modal : Card"
      v-model:show="showHelp"
      class="sm:flex-1 w-full"
    />

    <Settings
      :is="profile.popupSettings ? Modal : Card"
      v-model:show="showSettings"
      :cancelable="profile.popupSettings"
      class="sm:flex-1 w-full"
    />

    <Card class="w-full min-h-50">
      <template #tools>
        <button
          :disabled="showSettings || !profile.popupSettings"
          class="btn btn-ghost btn-circle btn-sm"
          @click="showSettings = true"
        >
          <icon-mdi-cog />
        </button>
        <button
          class="btn btn-ghost btn-circle btn-sm"
          :disabled="showHelp || !profile.popupHelp"
          @click="showHelp = true"
        >
          <icon-mdi-help />
        </button>
        <button
          class="btn btn-ghost btn-circle btn-sm"
          :disabled="profile.refreshToken == null"
          @click="(profile.refreshToken && profile.accessToken) ? profile.logout() : profile.login()"
        >
          <icon-mdi-logout v-if="profile.accessToken" />
          <icon-mdi-login v-else />
        </button>
      </template>
      <div v-if="loadingMyself" />
      <div
        v-else-if="myselfError"
        class="alert alert-warning mt-8 max-w-lg mx-auto"
      >
        <icon-mdi-alert-circle-outline />
        <span class="flex-1">
          {{ $t('pages.home.noAadUser') }}
        </span>
      </div>
      <div
        v-else-if="myself"
      >
        {{ $t('pages.home.greeting', [myself?.givenName]) }}
        <span
          v-if="myself.presence?.availability"
          class="ml-2 badge"
          :class="getBadgeColor(myself.presence.availability)"
        >
          {{ myself.presence.availability }}
        </span>
      </div>
      <div
        v-else
        class="alert alert-info mt-8 max-w-xs mx-auto"
      >
        <icon-mdi-alert-circle-outline />
        <span class="flex-1">
          {{ $t('pages.home.signInFirst') }}
        </span>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import type { Presence, User } from '@microsoft/microsoft-graph-types-beta';
import { useAsyncState } from '@vueuse/core';
import { ref, watch } from 'vue';
import Card from '../components/Card.vue';
import Modal from '../components/Modal.vue';
import Help from '../components/presence/Help.vue';
import Settings from '../components/presence/Settings.vue';
import { useProfileStore } from '../stores/profile';

const UUID_REGEX = /^[\da-f]{8}\b(?:-[\da-f]{4}){3}-[\da-f]{12}$/,
  profile = useProfileStore(),
  showHelp = ref(!profile.popupHelp),
  showSettings = ref(!profile.popupSettings);
  // myself = ref<User>(),

// eslint-disable-next-line no-undef
async function authFetch<T>(url: RequestInfo | URL, fetchConfig?: RequestInit): Promise<T> {
  if (!profile.accessToken) {
    throw new Error('no authToken');
  }
  const headers = new Headers(fetchConfig?.headers);
  headers.append('Authorization', `Bearer ${profile.accessToken}`);
  headers.append('Content-Type', 'application/json');
  const data = await fetch(url, {
    ...fetchConfig,
    headers
  });
  return data.json() as T;
}

const
  { state: myself, execute: getMyself, error: myselfError, isLoading: loadingMyself } = useAsyncState<User | null>(async () => {
    if (!profile.accessToken) {
      return null;
    }
    const user = await authFetch<User>('https://graph.microsoft.com/beta/me?$select=id,givenName');
    if (!user.id?.match(UUID_REGEX)) {
      throw new Error('not a AAD user');
    }
    if (!user.presence) {
      user.presence = await authFetch<Presence>(`https://graph.microsoft.com/beta/users/${user.id}/presence`);
      // presence.availability = Available, AvailableIdle, Away, BeRightBack, Busy,  BusyIdle, DoNotDisturb, Offline, PresenceUnknown
    }
    return user;
  }, null, {
    immediate: false
  });

watch(() => [profile.popupHelp, profile.popupSettings], ([popupHelp, popupSettings]) => {
  showHelp.value = !popupHelp;
  showSettings.value = !popupSettings;
});

watch([showHelp, showSettings], () => {
  profile.popupHelp = showHelp.value === false ? true : profile.popupHelp;
  profile.popupSettings = showSettings.value === false ? true : profile.popupSettings;
});

watch(() => profile.accessToken, async (newToken) => {
  if (newToken) {
    await getMyself();
  } else {
    myself.value = null;
    myselfError.value = undefined;
  }
}, {
  immediate: true
});

function getBadgeColor(availability: string): string {
  if (['Available', 'AvailableIdle'].includes(availability)) {
    return 'badge-success';
  } else if (['BeRightBack'].includes(availability)) {
    return 'badge-warning';
  } else if (['Busy', 'DoNotDisturb'].includes(availability)) {
    return 'badge-error';
  }
  return '';
}

</script>
