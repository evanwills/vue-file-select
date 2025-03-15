<template>
  <p class="generic-modal__btns">
    <button
      v-if="confirmBtnTxt !== ''"
      class="generic-modal__btn generic-modal__btn--yes"
      :key="confirmBtnTxt"
      type="button"
      v-on:click="emitAction($event, 'confirm')">
      {{ confirmBtnTxt }}
      <span class="sr-only">{{ srOnly }}</span>
    </button>
    <button
      v-if="cancelBtnTxt !== ''"
      class="generic-modal__btn generic-modal__btn--no"
      :key="cancelBtnTxt"
      type="button"
      v-on:click="emitAction($event, 'cancel')">
      {{ cancelBtnTxt }}
      <span class="sr-only">{{ srOnly }}</span>
    </button>
  </p>
</template>

<script setup>
const props = defineProps({
  cancelBtnTxt: { type: String, required: false, default: 'Cancel' },
  confirmBtnTxt: { type: String, required: false, default: '' },
  srOnly: { type: String, required: true },
  value: { type: String, required: false, default: '' },
});

const emit = defineEmits(['confirm', 'cancel']);

// buton wrap: sm:flex-row sm:justify-stretch items-center

const emitAction = (_event, action) => {
  console.group('GenericModalButtons.emitAction()');
  console.log('_event:', _event);
  console.log('action:', action);
  console.log('props.value:', props.value);
  emit(action, props.value);
  console.groupEnd();
};
</script>


<style lang="css" scoped>
.generic-modal__btns {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 0;
}
.generic-modal__btn {
  color: #fff;
  border: none;
  flex-grow: 1;
  padding: 1rem 2rem;
}
.generic-modal__btn--yes {
  background-color: #050;
}
.generic-modal__btn--no {
  background-color: #500;
}
</style>