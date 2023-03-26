<template>
  <component
    :is="is"
    closable
    :title="$t('pages.home.searchUser.title')"
    v-bind="$attrs"
    :show="show"
    @update:show="(show: boolean) => $emit('update:show', show)"
  >
    <div class="form-control">
      <div class="input-group">
        <input
          type="text"
          :placeholder="`${$t('search')}…`"
          class="input input-bordered"
        >
        <button class="btn btn-square">
          <icon-mdi-magnify />
        </button>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import type Card from '../Card.vue';
import type Modal from '../Modal.vue';

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
