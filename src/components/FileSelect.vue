<template>
  <FileSelectUI id="file-upload" wasm greyscale accept="jpg png doc docx pdf" />
</template>

<script setup>
import { ref } from 'vue'
import FileSelectUI from './FileSelect/view/FileSelectUI.vue';

defineProps({
  msg: String,
})

const count = ref(0)
</script>
