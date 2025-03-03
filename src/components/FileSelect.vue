<template>
  <FileSelectUI
    id="file-upload"
    greyscale
    preview
    accept="jpg png doc docx pdf"
    no-resize-warning="We think you are using a browser that doesn't support image resizing (e.g. Samsung Internet)
Please use the current version of Chrome, Safari, Edge, Firefox." />
</template>

<script setup>
import FileSelectUI from './FileSelect/view/FileSelectUI.vue';
</script>
