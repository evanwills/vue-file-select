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

    <div 
      v-if="showErrors === true || dupcliateError === true">
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
      <AlertBlock
        v-if="dupcliateError === null"
        :body="fileList.getDuplicateMsg(duplicateFiles)"
        icon="warning"
        type="warning" />
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
  watch,
} from 'vue';
import { FileSelectList } from '../logic/FileSelectList.class';
import AlertBlock from '../../AlertBlock.vue';
import FileSelectUiListItem from './FileSelectUiListItem.vue';
import FileSelectUiInput from './FileSelectUiInput.vue';
import SimpleCarousel from '../../SimpleCarousel.vue';
import ConsoleLogger from '../../../../utils/ConsoleLogger.class';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = '<file-Select-ui-file-list>';
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
const _cLog = ref(null);
const _doLog = true;
const doInit = ref(true);
const focusIndex = ref(0);
const badFile = ref([]);
const total = ref(0);
const stillAdding = ref(0);
const nextFocus = ref(0);
const duplicateFiles = ref([]);
const processingCount = ref(0);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const showErrors = computed(() => (props.fileList !== null
    && (props.fileList.ok === false || badFile.value.length > 0)));

const inputID = computed(() => `${props.id}--add-files`);

const isFileList = computed(
  () => (props.fileList !== null && props.fileList instanceof FileSelectList),
);

const submitClass = computed(() => {
  const tmp = (showErrors.value === true || processingCount.value > 0)
    ? ' btn-forbidden'
    : '';
  return `btn-pri btn-md${tmp}`;
});

const canUpload = computed(
  () => (total.value > 0 && badFile.value.length === 0
    && processingCount.value === 0 && stillAdding.value === 0),
);

const dupcliateError = computed(() => (duplicateFiles.value.length > 0));

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

const resetDuplicateFiles = () => {
  duplicateFiles.value = [];
};

const updateFocusIndex = () => {
  if (stillAdding.value === 0) {
    focusIndex.value = (nextFocus.value >= files.value.length)
      ? (files.value.length - 1)
      : nextFocus.value;
  }
};

const toBeAdded = (data) => {
  stillAdding.value = (data);
  nextFocus.value = total.value;
  focusIndex.value = total.value;
  resetDuplicateFiles();
};

const deletedWatcher = () => {
  resetFiles();

  if (focusIndex.value >= total.value) {
    focusIndex.value = total.value - 1;
  }
  resetDuplicateFiles();
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
  updateFocusIndex();
};

const duplicateWatcher = (name) => {
  notAddedWatcher();

  if (duplicateFiles.value.includes(name) === false) {
    duplicateFiles.value.push(name);
  }
};

const processCountWatcher = (data) => {
  processingCount.value = data;

  if (data === 0) {
    files.value = props.fileList.getAllFilesRaw();
  }
};

const setWatchers = () => {
  if (doInit.value === true && isFileList.value === true) {
    doInit.value = false;

    const actions = [
      'completed',
      'moved',
      'oversize',
      'processed',
      'replaced',
    ];

    props.fileList.addWatcher(actions, props.id, resetFiles);
    props.fileList.addWatcher('added', props.id, addedWatcher);
    props.fileList.addWatcher('deleted', props.id, deletedWatcher);
    props.fileList.addWatcher('duplicate', props.id, duplicateWatcher);
    props.fileList.addWatcher('notadded', props.id, notAddedWatcher);
    props.fileList.addWatcher('procesCountChange', props.id, processCountWatcher);
    props.fileList.addWatcher('toBeAdded', props.id, toBeAdded);
  }
};

const getWhy = () => {
  if (showErrors.value === true) {
    return 'there are errors';
  }

  if (total.value === 0) {
    return 'there are no files to upload';
  }

  if (badFile.value.length > 0) {
    return 'there are bad files';
  }

  if (processingCount.value > 0) {
    return 'images are still being processed';
  }

  return 'UNKNOWN';
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleUpload = (event) => {
  _cLog.value.before('handleUpload', { local: { event, busy: props.fileList.isBusy() }, refs: ['showErrors', 'canUpload', 'stillAdding', 'total', 'processingCount'] });

  if (showErrors.value === false && canUpload.value === true && props.fileList.isBusy() === false) {
    emit('upload');
    console.groupEnd();
  } else {
    _cLog.value.after('handleUpload', { warn: `Cannot upload at the moment because ${getWhy()}` });
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
  resetDuplicateFiles();
};

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

watch(
  () => props.fileList,
  () => {
    doInit.value = true;
    setWatchers();
  },
);

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (doInit.value === true) {
    if (_doLog === true && _cLog.value === null) {
      _cLog.value = new ConsoleLogger(
        componentName,
        props.id,
        {
          props: { ...props },
          refs: {
            files,
            focusIndex,
            badFile,
            total,
            stillAdding,
            nextFocus,
            duplicateFiles,
            processingCount,
            showErrors,
            inputID,
            isFileList,
            canUpload,
            dupcliateError,
          },
        },
        false,
      );
    }

    setWatchers();
  }
});

onUpdated(() => {
  setWatchers();
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
