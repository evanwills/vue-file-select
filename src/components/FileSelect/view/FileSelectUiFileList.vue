<template>
  <ul>
    <FileSelectUiFileListItem
      v-for="file in files"
      :data="file"
      :id="file.id"
      :name="file.name"
      :key="file.id + file.position"
      :ok="file.ok"
      :pos="file.position"
      :total="total"
      v-on:delete="deleteFile"
      v-on:move="moveFile" />
  </ul>
</template>

<script setup>
import { computed, onBeforeMount, onUpdated, ref } from 'vue';
import FileSelectUiFileListItem from './FileSelectUiFileListItem.vue';
import { getEpre } from '../../../utils/general-utils';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = 'FileSelectUiFileList';

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  id: { type: String, required: true },
  fileList: { required: true },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const files = ref([]);
const ePre = ref(null);
const init = ref(false);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const total = computed(() => (props.fileList.getFileCount() - 1));

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const setDispatch = () => {
  if (init.value === false && props.fileList !== null) {
    init.value = true;
    props.fileList.addDispatcher(listChange, componentName);
  }
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const deleteFile = (event) => {
  props.fileList.deleteFile(event);
};

const moveFile = ({ id, relPos }) => {
  props.fileList.moveFile(id, relPos);
};

const listChange = (type, data) => {
  const actions = [
    'added',
    'replaced',
    'completed',
    'moved',
    'deleted',
    'processed',
  ];
  if (actions.includes(type) || (type === 'processCount' && data === 0)) {
    files.value = props.fileList.getAllFilesRaw();
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
    setDispatch();
  }
});

onUpdated(() => {
  setDispatch();
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
