<template>
  <component
    :is="is"
    closable
    :title="$t('pages.home.help.title')"
    v-bind="$attrs"
    :show="show"
    @update:show="(show: boolean) => $emit('update:show', show)"
  >
    <div
      v-if="i18n.locale.value === 'de'"
      class="prose"
    >
      <ol>
        <li>
          Speichere <a
            :href="BOOKMARK"
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
          Komm hierher zurück und füge den {{ $t('pages.home.settings.refreshToken') }} aus deiner Zwischenablage in <span class="font-mono">{{ $t('pages.home.settings.title') }}</span> &gt; <span class="font-mono">{{ $t('pages.home.settings.refreshToken') }}</span> ein und speichere.
        </li>
      </ol>
      <hr class="border-0 border-solid border-t-1">
      Einstellungen, so wie Theme, Sprache, Popup-Einstellungen und {{ $t('pages.home.settings.refreshToken') }} werden im lokalen Speicher des Browsers abgelegt. Auf dieser Seiten werden Daten ausschließlich mit <a
        target="_blank"
        href="https://graph.microsoft.com"
      >https://graph.microsoft.com</a> ausgetauscht.
    </div>
    <div
      v-else
      class="prose"
    >
      <ol>
        <li>
          Save <a
            :href="BOOKMARK"
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
          Come back here and paste the {{ $t('pages.home.settings.refreshToken') }} from your clipboard to <span class="font-mono">{{ $t('pages.home.settings.title') }}</span> &gt; <span class="font-mono">{{ $t('pages.home.settings.refreshToken') }}</span> and save.
        </li>
      </ol>
      <hr class="border-0 border-solid border-t-1">
      Settings, such as prefered theme, language, popup settings and {{ $t('pages.home.settings.refreshToken') }} are stored in your browsers local storage. On this page, data is exclusivelz exchanged with <a
        target="_blank"
        href="https://graph.microsoft.com"
      >https://graph.microsoft.com</a>.
    </div>
  </component>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { langs, MessageSchema } from '../../typings/vue-i18n';
import type Card from '../Card.vue';
import type Modal from '../Modal.vue';

const BOOKMARK = `javascript:navigator.clipboard.writeText(JSON.parse(localStorage.getItem(\`\${localStorage.getItem('fbf1ecbe-27ab-42d7-96d4-3e6b03682ee4')}-login.windows.net-refreshtoken-${import.meta.env.VITE_AUTH_CLIENT_ID}----\`)).secret)`,
  i18n = useI18n<MessageSchema, langs>();
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
