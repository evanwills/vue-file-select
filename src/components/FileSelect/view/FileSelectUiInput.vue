<template>
  <label
    class="file-select-ui__btn"
    :for="id"
    type="button">{{ label }}</label>
  <input
    :accept="acceptTypes"
    class="sr-only"
    :id="id"
    :multiple="allowMulti"
    ref="fileSelectUiInput"
    type="file"
    v-on:change="handleFileChange($event)" />
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { getEpre } from '../../../utils/general-utils';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = 'file-select-ui-input';

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  acceptTypes: { type: String, required: true },
  fileList: { type: Object, required: true },
  id: { type: String, required: true },
  label: { type: String, required: true },
  multi: { type: Boolean, required: false, default: false },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const fileSelectUiInput = ref(null);
const init = ref(false);
const ePre = ref(null);
const allowMulti = ref(props.multi);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const listChange = (type, data) => {
  if (type === 'processCount' && data === 0) {
    fileSelectUiInput.value.value = '';
    allowMulti.value = props.fileList.allowMultiple();
  }
};

const setWatcher = () => {
  if (init.value === false && props.fileList !== null) {
    init.value = true;
    props.fileList.addWatcher(listChange, `${componentName}-${props.id}`);
  }
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleFileChange = (event) => {
  if (typeof event.target !== 'undefined' && typeof event.target.files !== 'undefined') {
    try {
      props.fileList.processFiles(event.target.files);
    } catch (error) {
      console.error(ePre.value('handleFileChange'), error);
    }
  }
};

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre(componentName, props.id);
    setWatcher();
  }
});
</script>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
