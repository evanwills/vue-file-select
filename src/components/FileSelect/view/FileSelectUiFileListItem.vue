<template>
  <li>
    <p class="f-name"><span v-html="fileName"></span> <span>#{{ id }}</span></p>
    <div class="data">
      <LoadingSpinner v-if="processing" class="img" />
      <img
        v-else-if="data.isImage && imgSrc !== ''"
        :alt="name"
        class="img"
        :key="imgSrcReset"
        :src="imgSrc" />
      <div
        v-else
        class="h-80 bg-grey-50 flex flex-col justify-center items-center text-body-md  gap-y-1
          before:font-symbol before:text-[2rem] before:leading-8 before:content-['description']">
        No preview available
      </div>

      <span class="data-info">
        <span class="data-info-child">
          <span class="l">Size:</span> <span class="v">{{ s.size }}{{ s.type }}</span>
          (<span class="l">Original:</span> <span class="v">{{ ogS.size }}{{ ogS.type }}</span>)
        </span>
        <span class="data-info-child" v-if="data.isImage">
          <span class="l">Width:</span> <span class="v">{{ w }}px</span>
          (<span class="l">Original:</span> <span class="v">{{ ogW }}px</span>)<br />
          <span class="l">Height:</span> <span class="v">{{ h }}px</span>
          (<span class="l">Original:</span> <span class="v">{{ ogH }}px</span>)
        </span>
        <span class="data-info-child data-info-child--position">{{ pos + 1 }} of {{ total }}</span>
      </span>
    </div>

    <p :class="btnListClass">
      <span v-if="noMove === false">
        <button
          v-if="canMoveUp"
          class="move move-step move-up"
          :disabled="!isFocused"
          :tabindex="tabIndex"
          type="button"
          v-on:click="emitMoveUp">
          <span>Move {{ name }} up one place</span>
        </button>

        <button
        v-if="canMoveDown"
        class="move move-step move-far move-down"
          :disabled="!isFocused"
          :tabindex="tabIndex"
          type="button"
          v-on:click="emitMoveDown">
          <span>Move {{ name }} down one place</span>
        </button>
      </span>
      <button
        v-if="!noDelete"
        class="delete"
        :disabled="!isFocused"
        :tabindex="tabIndex"
        :title="`Delete ${name}`"
        type="button"
        v-on:click="emitDelete">
        <span>Delete {{ name }}</span>
      </button>

      <span v-if="noMove === false">
        <button v-if="canMoveUp"
          class="move move-limit move-start"
          :disabled="!isFocused"
          :tabindex="tabIndex"
          type="button"
          v-on:click="emitMoveToStart">
          <span>Move {{ name }} to start</span>
        </button>

        <button
          v-if="canMoveDown"
          class="move move-limit move-far move-end"
          :disabled="!isFocused"
          :tabindex="tabIndex"
          type="button" v-on:click="emitMoveToEnd">
          <span>Move {{ name }} to end</span>
        </button>
      </span>
    </p>
  </li>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeMount,
  ref,
} from 'vue';
import { getEpre } from '../../../utils/general-utils';
import { formatBytes, formatNum } from '../logic/file-select-utils';
import LoadingSpinner from '../../LoadingSpinner.vue';

// ------------------------------------------------------------------
// START: Vue utils

const componentName = '<file-select-file-list-item>';

const emit = defineEmits(['delete', 'preview', 'move']);

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  /**
   * @property {FileSelectData} data
   */
  data: { type: Object, required: true },
  id: { type: String, required: true },
  isFocused: { type: Boolean, required: false, default: false },
  name: { type: String, required: true },
  noMove: { type: Boolean, required: false, default: false },
  noDelete: { type: Boolean, required: false, default: false },
  ok: { type: Boolean, required: true },
  pos: { type: Number, required: true },
  total: { type: Number, required: true },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const width = ref(0);
const height = ref(0);
const ogHeight = ref(0);
const ogWidth = ref(0);
const size = ref(props.data.size);
const ogSize = ref(props.data.ogSize);
const ePre = ref(null);
const _name = ref(props.name);
const processing = ref(props.data.processing);
const imgSrc = ref(props.data.src);
const imgSrcReset = ref(0);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const canMoveUp = computed(() => (props.pos > 0));
const canMoveDown = computed(() => ((props.pos + 1) < props.total));

const fileName = computed(() => props.name.replace(/[^a-z0-9_.-]+/ig, '')
  .substring(0, 128).replace(/(?=\.)/g, '<wbr />'));

const tabIndex = computed(() => { // eslint-disable-line arrow-body-style
  return (props.isFocused)
    ? undefined
    : -1;
});

const btnListClass = computed(() => {
  const tmp = 'btn-list';

  return (props.isFocused)
    ? `${tmp} ${tmp}--focused`
    : tmp;
});

const wrapWidth = computed(() => `width: ${100 / props.total}%;`);

const s = computed(() => formatBytes(size.value));
const ogS = computed(() => formatBytes(ogSize.value));

const w = computed(() => {
  return (typeof width.value === 'number')
    ? formatNum(width.value)
    : 0;
});

const h = computed(() => {
  return (typeof height.value === 'number')
    ? formatNum(height.value)
    : 0;
});

const ogW = computed(() => {
  return (typeof ogWidth.value === 'number')
    ? formatNum(ogWidth.value)
    : 0;
});

const ogH = computed(() => {
  return (typeof ogHeight.value === 'number')
    ? formatNum(ogHeight.value)
    : 0;
});


//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const emitDelete = () => {
  emit('delete', props.id);
};

const emitMoveUp = () => {
  emit('move', { id: props.id, relPos: -1 });
};
const emitMoveDown = () => {
  emit('move', { id: props.id, relPos: 1 });
};
const emitMoveToStart = () => {
  emit('move', { id: props.id, relPos: -1000 });
};
const emitMoveToEnd = () => {
  emit('move', { id: props.id, relPos: 1000 });
};

const setFileMeta = async () => {
  size.value = props.data.size;
  if (props.data.isImage === true) {
    width.value = props.data.width;
    height.value = props.data.height;
    ogWidth.value = props.data.ogWidth;
    ogHeight.value = props.data.ogHeight;
  }
};

const handleRenameReplace = async (data) => {
  if (data === props.data.id) {
    _name.value = props.data.name;
  }
};

const handleEndProcessingImage = async (data) => {
  if (data === props.data.id) {
    processing.value = props.data.processing;
    setFileMeta();
  }
};

const handleImageMetaSet = async (data) => {
  if (data === props.data.id) {
    _name.value = props.data.name;
  }
};

const handleImageSrcSet = async (data) => {
  if (data === props.data.id) {
    imgSrc.value = props.data.src;
    processing.value = props.data.processing;
    await nextTick();
    imgSrcReset.value = Date.now();
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
    if (props.data.isImage) {
      processing.value = props.data.processing;
    }
    setFileMeta();
    const _id = `listItem--${props.id}`;

    props.data.addWatcher('imageprocessingend', _id, handleEndProcessingImage);
    props.data.addWatcher(['imageMetaSet', 'resized'], _id, handleImageMetaSet);
    props.data.addWatcher('imageSrcSet', _id, handleImageSrcSet);
    props.data.addWatcher(['renamed', 'replaced'], _id, handleRenameReplace);
  }
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>

<style scoped>
li {
  text-align: left;
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  max-width: 32rem;
}
li + li {
  border-top: 0.05rem solid #ccc;
}
.f-name {
  display: block;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 -0.5rem;
  padding: 0 0.5rem 0.5rem;
  border-bottom: 0.05rem dotted #aaa;
}
button:disabled {
  cursor: not-allowed;;
}
.btn-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  opacity: 0;
  transition: opacity ease-in-out 0.2s;
}
.btn-list--focused {
  opacity: 1;
}
.btn-list span {
  display: flex;
  gap: 1rem;
}
.v {
  font-family: 'Courier New', Courier, monospace;
}
.l {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  font-size: 0.86rem;
}
p {
  margin: 0.5rem 0 0;
}
p:last-child {
  margin-bottom: 0.5rem;
}
.img {
  font-size: 10rem;
  width: 12rem;
  height: 12rem;
  object-fit: contain;
}
.data {
  display: flex;
  justify-content: space-between;
  margin: 1rem auto;
  column-gap: 1rem;
  width: auto;
}
.data > p {
  width: auto;
}
.data-info-child {
  display: block;
  width: auto;
}
.data-info-child + .data-info-child {
  margin-top: 0.5rem;
}
button {
  position: relative;
  border: none;
  border-radius: 5rem;
  padding: 0.5rem;
  display: inline-block;
  width: 2rem;
  height: 2rem;
}
button::before {
  font-size: 1.5rem;
  font-weight: bold;
}
.move::before {
  transform: translateY(0.1rem);
}
button > span {
  position: absolute;
  background-color: transparent;
  color: transparent;
  display: inline-block;
  height: 1px;
  width: 1px;
  margin: -1px 0 0 -1px;
}
.delete {
  background-color: #c00;
  line-height: 0.8rem;
}
.move {
  line-height: 0.85rem;
}
.f-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 1rem;
}
.f-name > span + span {
  font-weight: normal;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
}
.move-step { background-color: #060; }
.move-limit { background-color: #00c; }
.delete::before { content: '\000D7'; }
.move-up::before { content: '\02191'; }
.move-down::before { content: '\02193'; }
.move-end::before { content: '\02913'; /* 021A1 021D3 */ }
.move-start::before { content: '\02912'; /* 021D1 0219F */ }
</style>
