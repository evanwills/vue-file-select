<template>
  <ul>
    <FileSelectUiFileListItem
      v-for="file in files"
      :name="file.name"
      :id="file.id"
      :ok="file.ok"
      :data="file"
      v-on:delete="deleteFile" />
  </ul>
</template>

<script setup>
import { onBeforeMount, onUpdated, ref } from 'vue';
import FileSelectUiFileListItem from './FileSelectUiFileListItem.vue';
import { getEpre } from '../../../utils/general-utils';

const componentName = 'FileSelectUiFileList';

const props = defineProps({
  id: { type: String, required: true },
  fileList: { required: true },
});

const files = ref([]);
const ePre = ref(null);
const init = ref(false);

const listChange = (type, data) => {
  console.groupCollapsed(ePre.value('handleResizerEvents'));
  console.log('type:', type);
  console.log('data:', data);
  const actions = [
    'added',
    'replaced',
    'completed',
    'moved',
    'deleted',
    'processed',
  ];
  if (actions.includes(type) || (type === 'processcount' && data === 0)) {
    files.value = props.fileList.getAllFilesRaw();
  }
  console.groupEnd();
}

const setDispatch = () => {
  if (init.value === false && props.fileList !== null) {
    init.value = true;
    console.log('props.fileList:', props.fileList);
    props.fileList.addDispatcher(listChange, componentName);
  }
};

const deleteFile = (event) => {
  props.fileList.deleteFile(event);
}

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre(componentName, props.id);
    setDispatch();
  }
});

onUpdated(() => {
  setDispatch();
})
</script>

