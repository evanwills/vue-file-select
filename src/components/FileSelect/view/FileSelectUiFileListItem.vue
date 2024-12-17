<template>
  <li>
    <button v-on:click="emitDelete">
      {{ name }}
    </button>
    Size: {{ size }} Bytes
    <p v-if="data.isImg()">
      Width: {{ width }}<br />
      Height: {{ height }}
    </p>
  </li>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { getEpre } from '../../../utils/general-utils';



// ------------------------------------------------------------------
// START: Vue utils

const componentName = 'FileSelectFileListItem';

const emit = defineEmits('delete', 'preview');

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  ok: { type: Boolean, required: true },
  data: { type: Object, required: true },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const width = ref(undefined);
const height = ref(undefined);
const ePre = ref(null);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

const size = computed(() => props.data.size());

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const emitDelete = () => {
  emit('delete', props.id);
};

const setImgMeta = (_width, _height) => async () => {
  console.groupCollapsed('setImgMeta()');
  console.log('width.value (before):', width.value);
  console.log('height.value (before):', height.value);
  width.value = await props.data.width();
  height.value = await props.data.height();
  console.log('height.value (after):', height.value);
  console.log('width.value (after):', width.value);
  console.groupEnd();
}

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre(componentName, props.id);
    if (props.data.isImg()) {
      props.data.setImageMetadata().then(setImgMeta(width, height));
    }
  }
})

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>
