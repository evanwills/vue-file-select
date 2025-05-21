<template>
  <div class="file-select-ui-file-list">
    <!-- START SLOT: default -->
    <slot name="default"></slot>
    <!--  END SLOT:  default -->

    <!-- START SLOT: emptylist -->
    <slot
      v-if="Array.isArray(files) === false || files.length === 0"
      name="emptylist">
      <p>No files have been added.</p>
    </slot>
    <!--  END SLOT:  emptylist -->

    <SimpleCarousel
      v-else
      :focus-pos="focusIndex"
      :length="files.length"
      v-on:focusindex="carouselFocus">
      <FileSelectUiListItem
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
        v-if="badFile.includes('tooHeavy')"
        :body="fileList.getMessage('tooBigFile')"
        type="error" />
      <AlertBlock
        v-if="badFile.includes('invalid')"
        :body="fileList.getMessage('invalidType')"
        type="error" />
    </div>

    <!-- START SLOT: error -->
    <slot name="error"></slot>
    <!--  END SLOT:  error -->

    <p class="file-select-ui__btn-list">
      <FileSelectUiInput
        v-if="fileList !== null"
        :accept-types="acceptTypes"
        :file-list="fileList"
        :id="inputID"
        :label="inputLabel"
        :multi="multi" />
      <button
        class="file-select-ui__btn"
        type="button"
        v-on:click="handleUpload">Upload</button>
      <button
        class="file-select-ui__btn"
        type="button"
        v-on:click="handleCancel">Cancel</button>
    </p>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
  ref,
} from 'vue';
import { getEpre } from '../../../utils/general-utils';
import AlertBlock from '../../AlertBlock.vue';
import FileSelectUiListItem from './FileSelectUiListItem.vue';
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
const badFile = ref([]);
const total = ref(0);
const stillAdding = ref(0);
const nextFocus = ref(0);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const showErrors = computed(() => (props.fileList !== null
    && (props.fileList.ok === false || badFile.value.length > 0)));

const inputID = computed(() => `${props.id}--add-files`);

const canUpload = computed(() => (total.value > 0 && badFile.value.length === 0));

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const updateBadFiles = () => {
  badFile.value = props.fileList.getBadFileIssues();
};

const resetFiles = () => {
  total.value = props.fileList.getFileCount();
  files.value = props.fileList.getAllFilesRaw();
  updateBadFiles();
};

const toBeAdded = (data) => {
  stillAdding.value = (data);
  nextFocus.value = total.value;
  focusIndex.value = total.value;
};

const deletedWatcher = () => {
  resetFiles();

  if (focusIndex.value >= total.value) {
    focusIndex.value = total.value - 1;
  }
};

const addedWatcher = () => {
  stillAdding.value -= 1;

  if (stillAdding.value === 0) {
    focusIndex.value = nextFocus.value;
  }

  resetFiles();
};

const notAddedWatcher = () => {
  stillAdding.value -= 1;
  files.value = props.fileList.getAllFilesRaw();

  updateBadFiles();

  if (stillAdding.value === 0) {
    focusIndex.value = nextFocus.value;
  }
};

const processCountWatcher = (data) => {
  if (data === 0) {
    files.value = props.fileList.getAllFilesRaw();
  }
};

const setWatcher = () => {
  if (init.value === false && props.fileList !== null) {
    init.value = true;

    const actions = [
      'completed',
      'moved',
      'oversize',
      'processed',
      'replaced',
    ];

    props.fileList.addWatcher(actions, props.id, resetFiles);
    props.fileList.addWatcher('toBeAdded', props.id, toBeAdded);
    props.fileList.addWatcher('added', props.id, addedWatcher);
    props.fileList.addWatcher('deleted', props.id, deletedWatcher);
    props.fileList.addWatcher('notadded', props.id, notAddedWatcher);
    props.fileList.addWatcher('processCount', props.id, processCountWatcher);
  }
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleUpload = () => {
  if (showErrors.value === false && canUpload.value === true) {
    emit('upload');
  } else {
    for (let a = 0; a < files.value.length; a += 1) {
      if (files.value[a].ok === false) {
        focusIndex.value = a;
        break;
      }
    }
  }
};

const handleCancel = () => {
  emit('cancel');
};

const deleteFile = (event) => {
  nextFocus.value = focusIndex.value;
  props.fileList.deleteFile(event);
};

const moveFile = ({ id, relPos }) => {
  props.fileList.moveFile(id, relPos);
};

const carouselFocus = (event) => {
  focusIndex.value = event;
  nextFocus.value = focusIndex.value;
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

onBeforeUnmount(() => {
  props.fileList.removeWatchersByID(props.id);
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
