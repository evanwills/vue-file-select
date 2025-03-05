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

    <div v-if="showErrors === true">
      <AlertBlock
        v-if="fileList.tooBig() === true"
        :body="fileList.getMessage('tooBigTotal')"
        type="error" />
      <AlertBlock
        v-if="fileList.tooMany() === true"
        :body="fileList.getMessage('tooMany')"
        type="error" />
      <AlertBlock
        v-if="badFile.includes('tooBig')"
        :body="fileList.getMessage('tooBigFile')"
        type="error" />
      <AlertBlock
        v-if="badFile.includes('invalid')"
        :body="fileList.getMessage('invalidType')"
        type="error" />
    </div>

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
import AlertBlock from '../../AlertBlock.vue';

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
const badFile = ref([]);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

// const showErrors = computed(() => (props.fileList !== null
//   && (props.fileList.ok === false || badFile.value.length > 0)));
const showErrors = computed(() => {
  console.group(ePre.value('showErrors'));
  console.log('props.fileList:', props.fileList);
  console.log('badFile.value:', [...badFile.value]);

  if (props.fileList !== null) {
    console.log('props.fileList.ok:', props.fileList.ok);
    console.log('props.fileList.tooBig():', props.fileList.tooBig());
    console.log('props.fileList.tooMany():', props.fileList.tooMany());
  }

  console.groupEnd();
  return (props.fileList !== null
    && (props.fileList.ok === false || badFile.value.length > 0));
});
const total = computed(() => props.fileList.getFileCount());
const inputID = computed(() => `${props.id}--add-files`);

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const listChange = (type, data) => {
  const actions = [
    'added',
    'completed',
    'deleted',
    'moved',
    'notadded',
    'processCount',
    'processed',
    'replaced',
  ];
  console.group(ePre.value('listChange'));
  console.log('badFile.value (before):', [...badFile.value]);
  console.log('data:', data);
  console.log('files.value.length (before):', files.value.length);
  console.log('focusIndex.value (before):', focusIndex.value);
  if (actions.includes(type) || (type === 'processCount' && data === 0)) {
    files.value = props.fileList.getAllFilesRaw();

    switch (type) { // eslint-disable-line default-case
      case 'deleted':
        badFile.value = [];
        focusIndex.value -= 1;
        break;

      case 'added':
        badFile.value = [];
        focusIndex.value = (files.value.length - 1);
        break;

      case 'notadded':
        badFile.value = [];

        if (data.invalid === true) {
          badFile.value.push('invalid');
        }
        if (data.oversize === true) {
          badFile.value.push('tooBig');
        }
        break;
    }
  }
  console.log('badFile.value (after):', [...badFile.value]);
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
  focusIndex.value = event;
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
