<template>
  <component
    :is="is"
    closable
    :title="$t('pages.home.help.title')"
    v-bind="$attrs"
    :show="show"
    @update:show="(show: boolean) => $emit('update:show', show)"
  >
    <div class="prose">
      <ol v-if="i18n.locale.value === 'de'">
        <li>
          Speichere <a
            href="javascript:navigator.clipboard.writeText(JSON.parse(localStorage.getItem(`${localStorage.getItem('fbf1ecbe-27ab-42d7-96d4-3e6b03682ee4')}-login.windows.net-refreshtoken-de8bc8b5-d9f9-48b1-a8ad-b748da725064----`)).secret)"
            @click.prevent="false"
          >diesen Bookmark</a>.
        </li>
        <li>
          Gehe zu <a
            class="break-all"
            target="_blank"
            href="https://developer.microsoft.com/graph/graph-explorer"
          >developer.microsoft.com/graph/graph-explorer</a>, melde dich mit deinem AAD (nicht MSA) Konto an und kopiere den {{ $t('pages.home.settings.refreshToken') }} mit dem Bookmark.
        </li>
        <li>
          Komm hierher zurück und füge den {{ $t('pages.home.settings.refreshToken') }} aus deiner Zwischenablage in <span class="font-mono">{{ $t('pages.home.settings.title') }}</span> &gt; <span class="font-mono">{{ $t('pages.home.settings.refreshToken') }}</span> ein.
        </li>
      </ol>
      <ol v-else>
        <li>
          Save <a
            href="javascript:navigator.clipboard.writeText(JSON.parse(localStorage.getItem(`${localStorage.getItem('fbf1ecbe-27ab-42d7-96d4-3e6b03682ee4')}-login.windows.net-refreshtoken-de8bc8b5-d9f9-48b1-a8ad-b748da725064----`)).secret)"
            @click.prevent="false"
          >this bookmark</a>.
        </li>
        <li>
          Go to <a
            class="break-all"
            target="_blank"
            href="https://developer.microsoft.com/graph/graph-explorer"
          >developer.microsoft.com/graph/graph-explorer</a>, sign in with your AAD (not MSA) account and copy the {{ $t('pages.home.settings.refreshToken') }} with the bookmark.
        </li>
        <li>
          Come back here and paste the {{ $t('pages.home.settings.refreshToken') }} from your clipboard to <span class="font-mono">{{ $t('pages.home.settings.title') }}</span> &gt; <span class="font-mono">{{ $t('pages.home.settings.refreshToken') }}</span>.
        </li>
      </ol>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { langs, MessageSchema } from '../../typings/vue-i18n';
import type Card from '../Card.vue';
import type Modal from '../Modal.vue';

const i18n = useI18n<MessageSchema, langs>();
withDefaults(defineProps<{
  closable?: boolean;
  show?: boolean;
  is: InstanceType<typeof Modal> | InstanceType<typeof Card>;
}>(), {
  closable: false,
  show: true
});
defineEmits(['update:show']);
</script>
