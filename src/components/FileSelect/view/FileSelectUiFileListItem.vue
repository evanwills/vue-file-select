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
      <span class="data-info">
        <span class="data-info-child">
          <span class="l">Size:</span> <span class="v">{{ s }}B</span>
          (<span class="l">OG size:</span> <span class="v">{{ ogS }}B</span>)
        </span>
        <span class="data-info-child" v-if="data.isImage">
          <span class="l">Width:</span> <span class="v">{{ w }}px</span>
          (<span class="l">OG width:</span> <span class="v">{{ ogW }}px</span>)<br />
          <span class="l">Height:</span> <span class="v">{{ h }}px</span>
          (<span class="l">OG height:</span> <span class="v">{{ ogH }}px</span>)
        </span>
      </span>
    </div>

    <p class="btn-list">
      <button class="delete" :title="`Delete ${name}`" type="button" v-on:click="emitDelete">
        <span>Delete {{ name }}</span>
      </button>
      <span v-if="noMove === false">
        <button v-if="canMoveUp" class="move move-step move-up" type="button" v-on:click="emitMoveUp">
          <span>Move {{ name }} up one place</span>
        </button>

        <button v-if="canMoveDown" class="move move-step move-far move-down" type="button" v-on:click="emitMoveDown">
          <span>Move {{ name }} down one place</span>
        </button>
      </span>

      <span v-if="noMove === false">
        <button v-if="canMoveUp" class="move move-limit move-start" type="button" v-on:click="emitMoveToStart">
          <span>Move {{ name }} to start</span>
        </button>

        <button v-if="canMoveDown" class="move move-limit move-far move-end" type="button" v-on:click="emitMoveToEnd">
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
import { formatNum } from '../logic/file-select-utils';
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
   * @property {FileSelectDataFile} data
   */
  data: { type: Object, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  noMove: { type: Boolean, required: false, default: false },
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

const s = computed(() => formatNum(size.value));
const ogS = computed(() => formatNum(ogSize.value));

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

const canMoveUp = computed(() => (props.pos > 0));
const canMoveDown = computed(() => (props.pos < props.total));

const fileName = computed(() => props.name.replace(/(?=\.)/g, '<wbr />'));

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
    width.value = await props.data.width();
    height.value = await props.data.height();
    ogWidth.value = await props.data.ogWidth();
    ogHeight.value = await props.data.ogHeight();
  }
};

const handleFileChanges = async (type, data) => {
  if (data === props.data.id) {
    switch (type) { // eslint-disable-line default-case
      case 'imgSrcSet':
        imgSrc.value = props.data.src;
        processing.value = props.data.processing;
        await nextTick();
        imgSrcReset.value = Date.now();
        break;

      case 'renamed':
        _name.value = props.data.name;
        break;

      case 'resized':
      case 'imageMetaSet':
        setFileMeta();
        break;

      case 'replaced':
        _name.value = props.data.name;

        setFileMeta();
        break;

      case 'endprocessingimage':
        processing.value = props.data.processing;
        break;
    }
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

    props.data.addWatcher(handleFileChanges, `listItem--${props.id}`);
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
.btn-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
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
  width: 10rem;
  max-height: 10rem;
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
