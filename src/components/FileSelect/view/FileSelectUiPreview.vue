<template>
  <LoadingSpinner v-if="file === null" class="img" />
  <section v-else class="flex flex-col gap-y-6">
    <header><h2 class="text-heading-md">Preview</h2></header>
    <LoadingSpinner v-if="isProcessing" class="img" />
    <div v-else class="flex flex-col gap-y-4">
      <img :key="src" :src="src" alt="" />

      <p class="text-bold-md text-center">{{ fileName }}</p>
    </div>
    <slot><!-- canvas goes here --></slot>
    <footer v-if="!isProcessing">
      <p class="flex flex-col md:flex-row gap-4 content-center">
        <button
          type="button"
          class="btn-pri btn-lg"
          v-on:click="handleUse">{{ btnTxtUse }}</button>
        <FileSelectUiInput
          v-if="fileList !== null"
          :accept-types="acceptTypes"
          :file-list="fileList"
          :id="replaceID"
          :label="btnTxtReplace" />
      </p>
    </footer>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  ref,
  watch,
} from 'vue';
import { FileSelectFileList } from '../logic/FileSelectFileList.class';
import { formatNum } from '../logic/file-select-utils';
import { getEpre } from '../../../utils/general-utils';
import FileSelectUiInput from './FileSelectUiInput.vue';
import LoadingSpinner from '../../LoadingSpinner.vue';

// ------------------------------------------------------------------
// START: Vue utils

const emit = defineEmits(['use']);

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  acceptTypes: { type: String, required: true },
  fileList: { required: true },
  id: { type: String, required: true },
  fileId: { type: String, required: true },
  btnTxtUse: { type: String, required: false, default: 'Use' },
  btnTxtReplace: { type: String, required: false, default: 'Replace' },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const ePre = ref(null);
const file = ref(null);
const src = ref('');
const fileName = ref('');
const fileID = ref('');
const watcherSet = ref(false);
const isProcessing = ref(true);

const size = ref('unknown');
const ogSize = ref('unknown');
const height = ref('unknown');
const ogHeight = ref('unknown');
const width = ref('unknown');
const ogWidth = ref('unknown');

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

const replaceID = computed(() => `${props.id}--replace`);

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const isFileList = computed(
  () => (props.fileList !== null && props.fileList instanceof FileSelectFileList),
);

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const setMeta = async () => {
  size.value = formatNum(file.value.size);
  ogSize.value = formatNum(file.value.ogSize);
  width.value = await file.value.width();
  ogWidth.value = await file.value.ogWidth();
  height.value = await file.value.height();
  ogHeight.value = await file.value.ogHeight();
};

const setFile = async (id) => {
  if (isFileList.value === true && id !== '') {
    file.value = props.fileList.getFile(id);

    if (file.value !== null) {
      fileID.value = id;
      src.value = file.value.src;
      isProcessing.value = file.value.processing;
      fileName.value = file.value.name;
      setMeta();
    }
  }
};

const getFileListwatcherSet = (type, data) => {
  if (file.value !== null && data === fileID.value) {
    switch (type) { // eslint-disable-line default-case
      case 'imgSrcSet':
        src.value = file.value.src;
        fileName.value = file.value.name;
        isProcessing.value = file.value.processing;
        break;

      case 'endprocessingimage':
        isProcessing.value = false;
        setMeta();
        break;

      case 'imageMetaSet':
        setMeta();
    }
  }
};

const setWatcher = () => {
  if (isFileList.value === true && watcherSet.value === false) {
    watcherSet.value = true;

    props.fileList.addWatcher(getFileListwatcherSet, props.id);
  }
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleUse = () => { emit('use', true); };

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: watcherSet methods

watch(
  () => props.fileId,
  async (newID, oldID) => {
    if (newID !== oldID) {
      setFile(newID);
    }
  },
);

watch(
  () => props.fileList,
  async (newList, oldList) => {
    if (newList !== oldList) {
      setWatcher();

      if (file.value === null) {
        setFile(props.fileId);
      }
    }
  },
);

//  END:  watcherSet methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre('file-select-ui-preview');
  }

  if (props.fileList !== null) {
    setWatcher();
  }
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>

<style scoped>
img {
  max-width: 30rem;
  object-fit: contain;
}
</style>
