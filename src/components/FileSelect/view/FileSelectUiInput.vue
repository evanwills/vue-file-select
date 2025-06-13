<template>
  <label
    :class="labelClass"
    :for="id"
    type="button">{{ label }}</label>
  <input
    :accept="acceptTypes"
    class="sr-only"
    :id="id"
    :multiple="allowMulti"
    ref="fileSelectUiInput"
    type="file"
    v-on:input="handleFileInput"
    v-on:cancel="handleFileCancel"
    v-on:change="handleFileChange($event)" />
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { isNonEmptyStr } from '../../../utils/data-utils';
import { FileSelectList } from '../logic/FileSelectList.class';
import ConsoleLogger from '../../../utils/ConsoleLogger.class';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = '<file-select-ui-input>';

const emit = defineEmits(['addfiles', 'replace', 'replacefile']);

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  acceptTypes: { type: String, required: true },
  fileList: { type: Object, required: true },
  class: { type: String, required: false, default: 'btn-sec-arrow_upward-rt' },
  id: { type: String, required: true },
  label: { type: String, required: true },
  multi: { type: Boolean, required: false, default: false },
  replaceId: { type: String, required: false, default: '' },
  small: { type: Boolean, required: false, default: false },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const fileSelectUiInput = ref(null);
const doInit = ref(true);
const _cLog = ref(null);
const _doLog = true;

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

const labelClass = computed(() => `file-select-ui__btn ${props.class}`);

const allowMulti = computed(() => (props.replaceId === '' && props.fileList.allowMultiple()));

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const handleProcessEnd = (data) => {
  _cLog.value.before(
    'handleProcessEnd',
    {
      local: { data, allowMultiple: props.fileList.allowMultiple() },
      refs: ['fileSelectUiInput', 'allowMulti'],
      props: ['replaceId', 'fileList'],
    },
  );
  if (data === 0) {
    fileSelectUiInput.value = '';
    allowMulti.value = (props.replaceId === '' && props.fileList.allowMultiple());
  }
  _cLog.value.after(
    'handleProcessEnd',
    { refs: ['fileSelectUiInput', 'allowMulti'] },
  );
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleFileChange = (event) => {
  _cLog.value.before(
    'handleFileChange',
    { props: ['replaceId'], local: { event, files: event.target.files } },
  );
  if (typeof event.target !== 'undefined'
    && typeof event.target.files !== 'undefined'
    && event.target.files instanceof FileList
    && event.target.files.length > 0
  ) {
    props.fileList.setBusy();
    console.info('Yay!!! We have files to work with');

    try {
      if (isNonEmptyStr(props.replaceId) === true) {
        emit('replace', props.replaceId);
        props.fileList.replaceFile(props.replaceId, event.target.files[0]);
      } else {
        emit('addfiles', event.target.files.length);
        props.fileList.processFiles(event.target.files);
      }
    } catch (error) {
      _cLog.value.error('handleFileChange', error);
    }
  } else {
    console.warn('There are no files to work with');
    console.log('typeof event.target:', typeof event.target);
    console.log('typeof event.target !== "undefined":', typeof event.target !== 'undefined');
    console.log('typeof event.target?.files:', typeof event.target !== 'undefined');
    console.log('typeof event.target?.files !== "undefined":', typeof event.target?.files !== 'undefined');
    console.log('event.target?.files instanceof FileList":', event.target?.files instanceof FileList);
  }
  console.groupEnd();
};

const handleFileCancel = () => {
  _cLog.value.before('handleFileCancel', { local: { busy: props.fileList.busyStatus() } });
  props.fileList.notBusy();
  _cLog.value.after('handleFileCancel', { local: { busy: props.fileList.busyStatus() } });
};

const handleFileInput = () => {
  _cLog.value.before('handleFileInput', { local: { busy: props.fileList.busyStatus() } });
  props.fileList.setBusy();
  _cLog.value.after('handleFileInput', { local: { busy: props.fileList.busyStatus() } });
};

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (_doLog === true && _cLog.value === null) {
    _cLog.value = new ConsoleLogger(
      componentName,
      props.id,
      {
        props: { ...props },
        refs: { fileSelectUiInput, doInit, allowMulti },
      },
      false,
    );
  }

  if (doInit.value === true
    && props.fileList !== null
    && props.fileList instanceof FileSelectList
  ) {
    doInit.value = false;
    props.fileList.addWatcher(
      'processCount',
      `${componentName}-${props.id}`,
      handleProcessEnd,
    );
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
