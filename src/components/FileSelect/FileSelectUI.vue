<template>
  <div>
    <label
      for="button">Upload</label>
    <input type="file" :id="inputID" :accept="acceptTypes" />
    <dialog ref="fileUploadUI">
      <FileSelectUiPreview
        v-show="previewing === true"
        :canvas="fileSelectCanvas">
        <canvas ref="fileSelectCanvas"></canvas>
      </FileSelectUiPreview>
      <FileSelectUiFileList
        v-show="previewing === false"
        :file-list="selectedFiles" />
    </dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
// import { FilSelectData } from './FileSelectData.IBR.class.js';
import { FilSelectData } from './FileSelectData.Photon.class.js';



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
  maxSingleSize: { type: String, required: false, default: '15MB' },
  maxTotalSize: { type: String, required: false, default: '45MB' },
  noInvalid: { type: Boolean, required: false, default: false },
  accept: { type: String, required: false, default: 'JPG PNG DOCX PDF' },
  jpgCompression: { type: Number, required: false, default: 0.85 },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

let resizer = null;
const previewing = ref(false);
const selectedFiles = ref([]);
const acceptTypes = ref('image/jpeg, image/png application/msdoc');
const fileSelectCanvas = ref(null);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed state

const inputID = computed(() => `fileInput--${props.id}`);

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleFileChange = (event) => {
  if (typeof event.target !== 'undefined' && typeof event.target.value !== 'undefined') {
    try {
      resizer.processFiles();
    } catch (error) {

    }
  }
};

handleResizerEvents = (type, data) => {

}

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onMounted(() => {
  if (resizer === null) {
    resizer = new FilSelectData(handleResizerEvents, {}, )
  }
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>
