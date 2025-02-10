<template>
  <label class="file-select-ui__btn" :for="inputId" type="button">{{ label }}</label>
  <input
    :accept="acceptTypes"
    class="file-select-ui__input-field"
    :id="inputId"
    :multiple="allowMulti"
    ref="fileSelectUiInput"
    type="file"
    v-on:change="handleFileChange($event)" />
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { FileSelectFileList } from '../logic/FileSelectFileList.class';
import { getEpre } from '../../../utils/general-utils';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = 'FileSelectUiInput';

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  acceptTypes: { type: String, required: true },
  fileList: { type: FileSelectFileList, required: true },
  inputId: { type: String, required: true },
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

const setWatcher = () => {
  if (init.value === false && props.fileList !== null) {
    init.value = true;
    props.fileList.addWatcher(listChange, `${componentName}-${props.inputId}`);
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

const listChange = (type, data) => {
  if (type === 'processCount' && data === 0) {
    fileSelectUiInput.value.value = '';
    allowMulti.value = props.fileList.allowMultiple();
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
.file-select-ui__input-field {
  display: inline-block;
  height: 1px;
  width: 1px;
  overflow: hidden;
  color: transparent;
  opacity: 0;
  margin: -1px 0 0 -1px;
}
</style>
