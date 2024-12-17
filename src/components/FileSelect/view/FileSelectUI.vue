<template>
  <div>
    <label
      for="button">{{ label }}</label>
    <input
      :accept="acceptTypes"
      :id="inputID"
      :multiple="multiple"
      ref="fileUploadUiInput"
      type="file"
      v-on:change="handleFileChange($event)" />
    <canvas ref="fileSelectCanvas"></canvas>
    <dialog v-if="selectedFiles !== null" ref="fileUploadUI">
    </dialog>
    <FileSelectUiPreview
      v-show="previewing === true"
      :canvas="fileSelectCanvas"
      :file-list="selectedFiles"
      :id="previewID" />
    <FileSelectUiFileList
      v-show="previewing === false"
      :id="listID"
      :file-list="selectedFiles" />
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { getEpre } from '../../../utils/general-utils';
// import { FilSelectData } from './FileSelectData.IBR.class.js';
import FileSelectFileList from '../logic/FileSelectFileList.class';
import FileSelectUiPreview from './FileSelectUiPreview.vue';
import FileSelectUiFileList from './FileSelectUiFileList.vue';
import { getAllowedTypes } from '../logic/file-select-utils';



// ------------------------------------------------------------------
// START: Vue utils

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  id: { type: String, required: true },
  wasm: { type: Boolean, required: false, default: false },
  greyscale: { type: Boolean, required: false, default: false },
  maxFileCount: { type: Number, required: false, default: 15 },
  maxImgPx: { type: String, required: false, default: '1500' },
  maxSingleSize: { type: String, required: false, default: '15MB' },
  label: { type: String, required: false, default: 'Upload' },
  maxTotalSize: { type: String, required: false, default: '45MB' },
  noInvalid: { type: Boolean, required: false, default: false },
  accept: { type: String, required: false, default: 'JPG PNG DOCX PDF' },
  jpgCompression: { type: Number, required: false, default: 0.85 },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

let resizer = null;
let ePre = null;
const previewing = ref(false);
const selectedFiles = ref(null);
const acceptTypes = ref('image/jpeg, image/png application/msdoc');
const fileSelectCanvas = ref(null);
const fileUploadUiInput = ref(null);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

const getID = (tag) => `${tag}--${props.id}`;

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const inputID = computed(() => getID('fileInput'));
const listID = computed(() => getID('fileList'));
const previewID = computed(() => getID('preview'));
const multiple = computed(() => props.maxFileCount > 1);

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const initFiles = () => {
  selectedFiles.value = new FileSelectFileList(
    fileSelectCanvas.value,
    handleResizerEvents,
    {
      defaultAllowed: acceptTypes.value,
      greyscale: props.greyScale,
      jpgCompression: props.jpgCompression,
      maxFileCount: props.maxFileCount,
      maxImgPx: props.maxImgPx,
      maxSingleSize: props.maxSingleSize,
      maxTotalSize: props.maxTotalSize,
      noInvalid: props.noInvalid,
    },
  );
};

const retryInitFiles = (_initFiles, files, canvas) => () => {
  if (files.value === null) {
    if (canvas.value !== null) {
      _initFiles();
    } else {
      setTimeout(retryInitFiles(_initFiles, files, canvas), 100);
    }
  }
}

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleFileChange = (event) => {
  if (typeof event.target !== 'undefined' && typeof event.target.files !== 'undefined') {
    try {
      selectedFiles.value.processFiles(event.target.files);
    } catch (error) {
      console.error('handleFileChange():', error);
    }
  }
};

const handleResizerEvents = (type, data) => {
  console.groupCollapsed(ePre('handleResizerEvents'));
  console.log('type:', type);
  console.log('data:', data);

  switch (type) {
    case 'processcount':
      if (data === 0) {
        fileUploadUiInput.value.value = '';
      }
      break;

    default:
      break;
  }

  console.groupEnd();
}

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre === null) {
    ePre = getEpre('FileSelectUI', props.id);
    acceptTypes.value = getAllowedTypes(props.accept);
    acceptTypes.value = acceptTypes.value.map((type) => type.mime).join(', ');
  }
})

onMounted(() => {
  retryInitFiles(initFiles, selectedFiles, fileSelectCanvas)();
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>
