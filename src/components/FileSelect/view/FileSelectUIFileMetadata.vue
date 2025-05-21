<template>
  <span class="file-metadata">
    <span class="file-metadata__child">
      <span class="l">Size:</span> <span class="v">{{ _size.size }}{{ _size.type }}</span>
      (<span class="l">Original:</span> <span class="v">{{ _ogSize.size }}{{ _ogSize.type }}</span>)
    </span>
    <span class="file-metadata__child" v-if="isImage">
      <span class="l">Width:</span> <span class="v">{{ _width }}px</span>
      (<span class="l">Original:</span> <span class="v">{{ _ogWidth }}px</span>)<br />
      <span class="l">Height:</span> <span class="v">{{ _height }}px</span>
      (<span class="l">Original:</span> <span class="v">{{ _ogHeight }}px</span>)
    </span>
    <span class="file-metadata__child file-metadata__child--position">{{ pos + 1 }} of {{ total }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { formatBytes, formatNum } from '../logic/file-select-utils';

const props = defineProps({
  height: { type: Number, required: true },
  isImage: { type: Boolean, required: false, default: false },
  ogHeight: { type: Number, required: true },
  ogSize: { type: Number, required: true },
  ogWidth: { type: Number, required: true },
  pos: { type: Number, required: true },
  size: { type: Number, required: true },
  total: { type: Number, required: true },
  width: { type: Number, required: true },
});

const _height = computed(() => {
  return (typeof props.height === 'number')
    ? formatNum(props.height)
    : 0;
});

const _ogHeight = computed(() => {
  return (typeof props.ogHeight === 'number')
    ? formatNum(props.ogHeight)
    : 0;
});

const _ogSize = computed(() => formatBytes(props.ogSize));

const _ogWidth = computed(() => {
  return (typeof props.ogWidth === 'number')
    ? formatNum(props.ogWidth)
    : 0;
});

const _size = computed(() => formatBytes(props.size));

const _width = computed(() => {
  return (typeof props.width === 'number')
    ? formatNum(props.width)
    : 0;
});
</script>

<style scoped>
.file-metadata {
  display: flex;
  justify-content: space-between;
  margin: 1rem auto;
  column-gap: 1rem;
  width: auto;
}
.file-metadata > p {
  width: auto;
}
.file-metadata__child {
  display: block;
  width: auto;
}
.file-metadata__child + .file-metadata__child {
  margin-top: 0.5rem;
}
.v {
  font-family: 'Courier New', Courier, monospace;
}
.l {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  font-size: 0.86rem;
}
</style>
