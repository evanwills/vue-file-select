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
  /**
   * Text to show in cancel button (Default: "Cancel")
   *
   * > __Note:__ If `cancelBtnTxt` is empty, it will not be rendered
   *
   * @property {string} cancelBtnTxt
   */
  cancelBtnTxt: { type: String, required: false, default: 'Cancel' },

  /**
   * Text to show in confirm button (Default: "" - empty string)
   *
   * > __Note:__ If `confirmBtnTxt` is empty, it will not be rendered
   *
   * @property {string} confirmBtnTxt
   */
  confirmBtnTxt: { type: String, required: false, default: '' },

  /**
   * Whether or not confirm button should be rendered as dangerous
   * (i.e. red)
   *
   * @property {boolean} confirmDanger
   */
  confirmDanger: { type: Boolean, required: false, default: false },

  /**
   * Whether or not confirm button should be rendered as disabled
   * (i.e. have cursor of forbidden)
   *
   * @property {boolean} confirmDisabled
   */
  confirmDisabled: { type: Boolean, required: false, default: false },

  /**
   * Text to be shown by assistive technologies to provide better
   * context for the button's action
   *
   * @property {string} srOnly
   */
  srOnly: { type: String, required: true },

  /**
   * Value to be emitted with the button click event
   *
   * @property {string} value
   */
  value: { type: String, required: false, default: '' },
});

const emit = defineEmits(['confirm', 'cancel']);

// buton wrap: sm:flex-row sm:justify-stretch items-center

const emitAction = (_event, action) => {
  emit(action, props.value);
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