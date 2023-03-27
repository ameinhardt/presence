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
      <div v-if="loadingData" />
      <div
        v-else-if="dataError"
        class="alert alert-warning mt-8 max-w-lg mx-auto"
      >
        <icon-mdi-alert-circle-outline />
        <span class="flex-1">
          {{ $t('pages.home.noAadUser') }}
        </span>
      </div>
      <div
        v-else-if="data"
      >
        <div class="mb-2">
          {{ $t('pages.home.greeting', [data.user.givenName]) }}
          <span
            v-if="data.presence?.availability"
            class="ml-2 badge"
            :class="getBadgeColor(data.presence.availability)"
          >
            {{ data.presence.availability }}
          </span>
        </div>
        <div class="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2">
          <template
            v-for="colleage in data.colleagues"
            :key="colleage.id"
          >
            <span>{{ colleage.displayName }}</span>
            <span
              v-if="data.colleaguesPrecenseById[colleage.id!].availability"
              class="ml-2 badge"
              :class="getBadgeColor(data.colleaguesPrecenseById[colleage.id!].availability!)"
            >
              {{ data.colleaguesPrecenseById[colleage.id!].availability }}
            </span>
          </template>
        </div>
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
import type { Person, Presence, User } from '@microsoft/microsoft-graph-types-beta';
import { useAsyncState } from '@vueuse/core';
import { ref, watch } from 'vue';
import Card from '../components/Card.vue';
import Modal from '../components/Modal.vue';
import Help from '../components/presence/Help.vue';
import Settings from '../components/presence/Settings.vue';
import { useProfileStore } from '../stores/profile';

interface PresenceData {
  user: User;
  presence: Presence;
  colleagues: Array<Pick<Person, 'id' | 'displayName'>>;
  colleaguesPrecenseById: Record<string, Presence>
}

const UUID_REGEX = /^[\da-f]{8}\b(?:-[\da-f]{4}){3}-[\da-f]{12}$/,
  profile = useProfileStore(),
  showHelp = ref(!profile.popupHelp),
  showSettings = ref(!profile.popupSettings);

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
  { state: data, execute: getData, error: dataError, isLoading: loadingData } = useAsyncState<PresenceData | null>(async () => {
    if (!profile.accessToken) {
      return null;
    }
    const user = await authFetch<Pick<Person, 'id' | 'givenName'>>('https://graph.microsoft.com/beta/me?$select=id,givenName');
    if (!user.id?.match(UUID_REGEX)) {
      throw new Error('not a AAD user');
    }
    // presence.availability = Available, AvailableIdle, Away, BeRightBack, Busy,  BusyIdle, DoNotDisturb, Offline, PresenceUnknown
    const presence = await authFetch<Presence>(`https://graph.microsoft.com/beta/users/${user.id}/presence`),
      { value: colleagues } = await authFetch<{ value: Array<Pick<Person, 'id' | 'displayName'>>}>('https://graph.microsoft.com/beta/me/people?$select=id,displayName&$top=30&$orderby=displayName%20asc'),
      { value: colleaguesPrecense } = await authFetch<{ value: Array<Presence>}>('https://graph.microsoft.com/beta/communications/getPresencesByUserId', {
        method: 'POST',
        body: JSON.stringify({
          ids: colleagues.map(({ id }) => id)
        })
      }),
      colleaguesPrecenseById: Record<string, Presence> = {};
    for (const colleaguePrecense of colleaguesPrecense) {
      colleaguesPrecenseById[colleaguePrecense.id!] = colleaguePrecense;
    }
    return {
      user,
      presence,
      colleagues,
      colleaguesPrecenseById
    };
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
    await getData();
  } else {
    data.value = null;
    dataError.value = undefined;
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
