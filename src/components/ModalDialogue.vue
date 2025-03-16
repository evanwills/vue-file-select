<template>
  <GenericModal
    class="modal-dialogue"
    :no-manual-close="loading"
    :open="open"
    v-on:close="emitAction($event, 'cancel')">
    <ModalContent
      aria-live="polite"
      :body="body"
      centre
      :h-level="hLevel"
      :heading="heading"
      :icon="icon"
      :key="mode"
      :loading="loading"
      :m-id="getModalID"
      :ok="ok" />

    <GenericModalButtons
      v-if="!loading && (mode === 'comfirm' || !noMainClose)"
      :cancel-btn-txt="getCancelCloseTxt"
      :confirm-btn-txt="getConfirmBtnTxt"
      :confirm-danger="confirmDanger"
      :sr-only="heading"
      v-on:cancel="emitAction($event, 'cancel')"
      v-on:confirm="emitAction($event, 'submit')" />
  </GenericModal>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  ref,
  watch,
} from 'vue';
import ModalContent from './ModalContent.vue';
import { getEpre } from '../utils/general-utils';
import GenericModal from './GenericModal.vue';
import GenericModalButtons from './GenericModalButtons.vue';

const emit = defineEmits(['cancel', 'close', 'open', 'submit']);

// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  action: { type: String, required: false, default: 'save' },
  body: { type: String, required: false, default: '' },
  cancelTxt: { type: String, required: false, default: 'Close' },
  confirmTxt: { type: String, required: false, default: 'Save' },
  confirmDanger: { type: Boolean, required: false, default: false },
  heading: { type: String, required: false, default: '' },
  hLevel: { type: Number, required: false, default: 2 },
  icon: { type: String, requried: false, default: '' },
  loading: { type: Boolean, required: false, default: false },
  mId: { type: String, required: false, default: '' },
  mode: { type: String, required: false, default: '' },
  noMainClose: { type: Boolean, required: false, default: false },
  ok: { type: Boolean, required: false, default: false },
  showModal: { type: Boolean, required: false, default: false },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

/**
 * Get the start of an error message (or console group name) string
 * for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
const ePre = ref(null);
const open = ref(props.showModal);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

const showCancel = computed(() => (props.action === 'save-confirm' || props.action === 'delete-confirm'));

/**
 * Get text for cancel/close button
 *
 * @var {ComputedRef<string>} getCancelCloseTxt
 */
const getCancelCloseTxt = computed(() => { // eslint-disable-line arrow-body-style
  return (showCancel.value === true)
    ? 'Cancel'
    : props.cancelTxt;
});

/**
 * Get text for delete/save button
 *
 * @var {ComputedRef<string>} getConfirmBtnTxt
 */
const getConfirmBtnTxt = computed(() => { // eslint-disable-line arrow-body-style
  return (props.action === 'delete')
    ? 'Delete'
    : props.confirmTxt;
});

/**
 * ID for modal content block
 *
 * @var {ComputedRef<string>} getModalID
 */
const getModalID = computed(() => `${props.mId}--dialogue-modal`);

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const emitAction = (_event, action) => {
  if (action === 'cancel') {
    open.value = false;
  }
  emit(action, props.value);
};

//  END:  Local methods
// --------------------------------------------------
// START: Watcher methods

watch(() => props.showModal, (newVal) => { open.value = newVal; });

//  END:  Watcher methods
// --------------------------------------------------
// START: Lifecycle events

onBeforeMount(() => {
  ePre.value = getEpre('modal-dialogue', props.mId);
});

//  END:  Lifecycle events
// --------------------------------------------------
</script>

<style lang="css" scoped>
</style>