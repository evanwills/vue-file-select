<template>
  <div>
    <FileSelectUiInput
      v-if="selectedFiles !== null"
      :accept-types="acceptTypes"
      :file-list="selectedFiles"
      :input-id="inputID"
      :label="label"
      :multi="multiple" />
    <canvas ref="fileSelectCanvas"></canvas>
    <dialog ref="fileSelectUI" class="file-select-ui-modal">
      <FileSelectUiPreview
        v-show="previewing === true"
        :canvas="fileSelectCanvas"
        :id="previewID" />
      <FileSelectUiFileList
        v-show="previewing === false"
        :accept-types="acceptTypes"
        :id="listID"
        :file-list="selectedFiles"
        :multi="multiple"
        :no-move="noMove"
        v-on:upload="handleUpload"
        v-on:cancel="handleCancel" />
      <button type="button" v-on:click="handleCancel" class="file-select-ui__btn file-select-ui-modal__btn-close">Close</button>
    </dialog>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onMounted,
  ref,
} from 'vue';
import { getEpre } from '../../../utils/general-utils';
// import { FilSelectData } from './FileSelectData.IBR.class.js';
import { FileSelectFileList } from '../logic/FileSelectFileList.class';
import { doCloseModal, doShowModal } from '../../../utils/vue-utils';
import { getAllowedTypes } from '../logic/file-select-utils';
import FileSelectUiPreview from './FileSelectUiPreview.vue';
import FileSelectUiFileList from './FileSelectUiFileList.vue';
import FileSelectUiInput from './FileSelectUiInput.vue';

// ------------------------------------------------------------------
// START: Vue utils

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  accept: { type: String, required: false, default: 'JPG PNG DOCX PDF' },
  greyscale: { type: Boolean, required: false, default: false },
  id: { type: String, required: true },
  jpgCompression: { type: Number, required: false, default: 0.85 },
  label: { type: String, required: false, default: 'Upload' },
  maxFileCount: { type: Number, required: false, default: 15 },
  maxImgPx: { type: String, required: false, default: '1500' },
  maxSingleSize: { type: String, required: false, default: '15MB' },
  maxTotalSize: { type: String, required: false, default: '45MB' },
  noInvalid: { type: Boolean, required: false, default: false },
  noMove: { type: Boolean, required: false, default: false },
  noResizeWarning: { type: String, required: false, default: '' },
  wasm: { type: Boolean, required: false, default: false },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

let ePre = null;
const previewing = ref(false);
const selectedFiles = ref(null);
const acceptTypes = ref('image/jpeg, image/png application/msdoc');
const fileSelectCanvas = ref(null);
const fileSelectUI = ref(null);
const noResize = ref(false);

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

const handleResizerEvents = (type, data) => {
  if (type === 'added') {
    doShowModal(fileSelectUI.value);
  } else if (type === 'noResize') {
    noResize.value = (data !== false);
  }
};

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
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleUpload = () => {

};

const handleCancel = () => {
  doCloseModal(fileSelectUI.value);
  selectedFiles.value.deleteAll();
};

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
});

onMounted(() => {
  retryInitFiles(initFiles, selectedFiles, fileSelectCanvas)();
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>

<style>
.file-select-ui-modal {
  position: relative;
  border: 0.05rem solid #ccc;
  border-radius: 0.5rem;
}
.file-select-ui__btn {
  border: 0.05rem solid #fff;
  display: inline-block;
  text-align: center;
  padding: 0.5rem 2rem;
  border-radius: 0.5rem;
}
.file-select-ui-modal__btn-close {
  position: absolute;
  top: 0;
  right: 0;
  height: 3rem;
  width: 3rem;
  text-indent: -100;
  padding: 0.5rem;
  color: transparent;
}
.file-select-ui-modal__btn-close::before {
  content: '\000D7';
  color: #fff;
  display: block;
  text-indent: 0;
  line-height: 1rem;
  font-size: 2rem;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.file-select-ui__btn-list {
  display: flex;
  column-gap: 1rem;
  align-items: center;
  width: 100%;
}
.file-select-ui__btn-list label {
  flex-grow: 1;
}
</style>
