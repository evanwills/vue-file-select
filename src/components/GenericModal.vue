<template>
  <dialog
    class="generic-modal"
    ref="genericDialogModal"
    v-on:keyup="handleKey"
    v-on:keydown="handleKey"
    v-on:keypress="handleKey">
    <!--
     ! We want users read through the modal content before they get
     ! to the close button.
     ! The following background click button is hidden from
     ! assistive technologies because there is an accessible close
     ! button within the main modal content area.
     ! -->
    <button
      v-if="noManualClose === false"
      aria-hidden
      class="generic-modal__btn--bg"
      type="button"
      v-on:click="handleManualClose">Close</button>
    <div :class="wrapInnerClass">
      <slot></slot>
      <button
        v-if="noManualClose === false"
        class="generic-modal__btn--X"
        type="button"
        v-on:click="handleManualClose">
        close
      </button>
    </div>
  </dialog>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onMounted,
  onUpdated,
  ref,
} from 'vue';
import { doCloseModal, doShowModal } from '../utils/vue-utils';

const emit = defineEmits(['close']);

// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  open: { type: Boolean, required: true },
  noManualClose: { type: Boolean, required: false, default: false },
});

/**
 * Dialog element to be used when calling HTMLDialogElement.open()
 * & HTMLDialogElement.close()
 *
 * @var {Ref<null|HTMLDialogElement} genericDialogModal
 */
const genericDialogModal = ref(null);

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

/**
 * Classes to apply to the inner div of the dialog component
 *
 * @var {ComputedRef<string>} wrapInnerClass
 */
const wrapInnerClass = computed(() => {
  const tmp = 'generic-modal__inner'
  const top = (props.noManualClose === true)
    ? ` ${tmp}--no-close`
    : '';

  return tmp + top;
});

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const handleManualClose = (event) => {
  if (props.noManualClose === true) {
    event.preventDefault();
  } else {
    doCloseModal(genericDialogModal.value);
    emit('close', 'close');
  }
};

const handleKey = (event) => {
  if (props.noManualClose === true && event.key === 'Escape') {
    event.preventDefault();
  }
};

const openClose = () => {
  if (props.open === true) {
    doShowModal(genericDialogModal.value);
  } else {
    doCloseModal(genericDialogModal.value);
  }
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle events

onBeforeMount(openClose);
onMounted(openClose);
onUpdated(openClose);

//  END:  Lifecycle events
// --------------------------------------------------
</script>

<style lang="css" scoped>
.generic-modal {
  background-color: #fff;
  max-width: 18rem;
  width: calc(100% - 2rem);
  box-shadow: 0.5rem 0.5rem 0.5rem rgba(0, 0, 0, 0.7);
  border-radius: 0.25rem;
}
.generic-modal::backdrop {
  background-color: #000;
  opacity: 0.8;
}
.generic-modal__btn--bg {
  background-color: transparent;
  bottom: 0;
  color: transparent;
  cursor: auto;
  display: block;
  height: 100%;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
}
.generic-modal__btn--X {
  font-family: material-symbols-rounded;
  position: absolute;
  right: 0;
  top: 0;
  padding-left: 1rem;
  padding-right: 1.25rem;
  padding-bottom: 0.75rem;
  font-size: 1.5rem;
}
.generic-modal__inner {
  position: relative;
  padding: 2.5rem 1.5rem 1.5rem;
}
.generic-modal__inner--no-close {
  padding-top: 1.5rem;
}
</style>