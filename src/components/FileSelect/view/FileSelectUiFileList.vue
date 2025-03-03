<template>
  <div class="file-select-ui-file-list">
    <slot v-if="files.length === 0"></slot>
    <SimpleCarousel
      v-else
      :focus-pos="focusIndex"
      :length="files.length"
      v-on:focusindex="carouselFocus">
      <FileSelectUiFileListItem
        v-for="file in files"
        :data="file"
        :id="file.id"
        :is-focused="focusIndex === file.position"
        :key="file.id + file.position"
        :name="file.name"
        :no-move="noMove"
        :ok="file.ok"
        :pos="file.position"
        :total="total"
        v-on:delete="deleteFile"
        v-on:move="moveFile" />
    </SimpleCarousel>
    <p class="file-select-ui__btn-list">
      <FileSelectUiInput
        v-if="fileList !== null"
        :accept-types="acceptTypes"
        :file-list="fileList"
        :id="inputID"
        :label="inputLabel"
        :multi="multi" />
      <button class="file-select-ui__btn" type="button" v-on:click="handleUpload">Upload</button>
      <button class="file-select-ui__btn" type="button" v-on:click="handleCancel">Cancel</button>
    </p>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onUpdated,
  ref,
} from 'vue';
import FileSelectUiFileListItem from './FileSelectUiFileListItem.vue';
import { getEpre } from '../../../utils/general-utils';
import FileSelectUiInput from './FileSelectUiInput.vue';
import SimpleCarousel from '../../SimpleCarousel.vue';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = 'FileSelectUiFileList';
const emit = defineEmits(['upload', 'cancel']);

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  acceptTypes: { type: String, required: true },
  fileList: { required: true },
  id: { type: String, required: true },
  multi: { type: Boolean, required: false, default: false },
  noMove: { type: Boolean, required: false, default: false },
  inputLabel: { type: String, required: false, default: 'Add more files' },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const files = ref([]);
const ePre = ref(null);
const init = ref(false);
const focusIndex = ref(0);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const total = computed(() => props.fileList.getFileCount());
const inputID = computed(() => `${props.id}--add-files`);

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const listChange = (type, data) => {
  const actions = [
    'added',
    'replaced',
    'completed',
    'moved',
    'deleted',
    'processCount',
    'processed',
  ];
  console.group(ePre.value('carouselFocus'));
  console.log('type:', type);
  console.log('data:', data);
  console.log('files.value.length (before):', files.value.length);
  console.log('focusIndex.value (before):', focusIndex.value);
  if (actions.includes(type) || (type === 'processCount' && data === 0)) {
    files.value = props.fileList.getAllFilesRaw();
    console.log('files.value.length (after):', files.value.length);
    console.log('focusIndex.value (before):', focusIndex.value);

    if (type === 'deleted') {
      focusIndex.value -= 1;
    } else if (type === 'added') {
      focusIndex.value = (files.value.length - 1);
    }
    console.log('focusIndex.value (after):', focusIndex.value);
  }
  console.log('event:', event);
  console.log('focusIndex.value (before):', focusIndex.value);
  console.groupEnd();
};

const setWatcher = () => {
  if (init.value === false && props.fileList !== null) {
    init.value = true;
    props.fileList.addWatcher(listChange, componentName);
  }
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleUpload = () => {
  emit('upload');
};

const handleCancel = () => {
  emit('cancel');
};

const deleteFile = (event) => {
  props.fileList.deleteFile(event);
};

const moveFile = ({ id, relPos }) => {
  props.fileList.moveFile(id, relPos);
};

const carouselFocus = (event) => {
  console.group(ePre.value('carouselFocus'));
  console.log('event:', event);
  console.log('focusIndex.value (before):', focusIndex.value);
  focusIndex.value = event;
  console.log('focusIndex.value (after):', focusIndex.value);
  console.groupEnd();
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

onUpdated(() => {
  setWatcher();
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>

<style scoped>
ul {
  margin: 2rem 0;
  padding: 0;
}
</style>
