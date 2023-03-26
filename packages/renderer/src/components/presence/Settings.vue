<template>
  <component
    :is="is"
    :show="show"
    closable
    :title="$t('pages.home.settings.title')"
    v-bind="$attrs"
    @update:show="(show: boolean) => $emit('update:show', show)"
  >
    <div class="form-control w-full flex-row flex-wrap">
      <label class="label flex-wrap flex-1">
        <span class="label-text min-w-30 flex-1">{{ $t('pages.home.settings.refreshToken') }}:</span>
      </label>
      <div class="input-group w-xs max-w-full mb-2 relative">
        <input
          v-model="temporaryConfig.refreshToken"
          type="text"
          :placeholder="`${$t('pages.home.settings.pasteHere')}…`"
          class="input input-bordered w-full"
        >
        <span
          v-show="temporaryConfig.refreshToken"
          class="btn btn-sm reset"
          @click="temporaryConfig.refreshToken = undefined"
        >
          <icon-mdi-close />
        </span>
        <span>
          <icon-mdi-clipboard-outline />
        </span>
      </div>
    </div>
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">{{ $t('pages.home.settings.popupHelp') }}</span>
        <input
          v-model="temporaryConfig.popupHelp"
          type="checkbox"
          class="toggle"
        >
      </label>
    </div>
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">{{ $t('pages.home.settings.popupSettings') }}</span>
        <input
          v-model="temporaryConfig.popupSettings"
          type="checkbox"
          class="toggle"
        >
      </label>
    </div>
    <template #actions>
      <button
        class="btn btn-outline min-w-30"
        @click="reset"
      >
        {{ $t('reset') }}
      </button>
      <button
        class="btn btn-primary min-w-30"
        @click="save"
      >
        {{ $t('save') }}
      </button>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { useProfileStore, type ProfileConfig } from '../../stores/profile';
import type Card from '../Card.vue';
import type Modal from '../Modal.vue';

/*
how does that work?
type ShowType = DefineComponent<{
  title?: string;
  closable: boolean;
  show?: boolean;
  [v: string]: unknown;
}, any, any, any, any, any, any, {
  'update:show': (show: boolean) => void
}, any>;
*/

type ConfigType = Pick<ProfileConfig, 'refreshToken' | 'popupHelp' | 'popupSettings'>;

const profile = useProfileStore(),
  temporaryConfig: Partial<ConfigType> = reactive({});

withDefaults(defineProps<{
  title?: string;
  closable?: boolean;
  show: boolean;
  is: InstanceType<typeof Modal> | InstanceType<typeof Card>;
}>(), {
  title: undefined,
  closable: false,
  asDialog: false
});

// eslint-disable-next-line func-call-spacing
defineEmits<{
  (event: 'update:show', show: boolean): void
}>();

async function save() {
  profile.refreshToken = temporaryConfig.refreshToken || undefined;
  profile.popupHelp = temporaryConfig.popupHelp ?? false;
  profile.popupSettings = temporaryConfig.popupSettings ?? false;
  await (profile.refreshToken ? profile.login() : profile.logout());
  // await profile.login();
}

function reset() {
  Object.assign(temporaryConfig, {
    refreshToken: profile.refreshToken,
    popupHelp: profile.popupHelp,
    popupSettings: profile.popupSettings
  });
}

watch(profile, reset, {
  immediate: true,
  deep: true
});
</script>

<style lang="scss" scoped>
.input-group .reset {
  @apply absolute right-15 top-2 w-8 p-0 rounded-100% bg-opacity-25;
  &:hover {
    @apply bg-opacity-100;
  }
}
</style>
