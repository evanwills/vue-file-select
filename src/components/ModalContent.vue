<template>
  <div :class="wrapClass">
    <div v-if="loading" class="modal-content__loading">
      <LoadingSpinner v-if="loading === true" class="modal-content__icon" />
    </div>
    <span v-else-if="iconType === 'icon'" :class="iconClass">{{ iconName }}</span>
    <img v-else-if="iconType === 'img'" class="modal-content__icon modal-content__icon--img" :src="icon" alt="" />
    <component
      v-if="heading !== ''"
      :is="`h${hLevel}`"
      class="modal-content__h"
      id="child-selection-head">{{ heading }}</component>
    <div v-if="hasBody" :class="bodyClass">
      <slot><div v-html="body"></div></slot>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onUpdated,
  ref,
  useSlots,
} from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import { getEpre } from '../utils/general-utils';

const slots = useSlots();

// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  body: { type: String, required: true },
  centre: { type: Boolean, required: false, default: false },
  heading: { type: String, required: false, default: '' },
  hLevel: { type: Number, required: false, default: 3 },
  id: { type: String, required: false, default: '' },
  icon: { type: String, required: false, default: '' },
  iconColour: { type: String, required: false, default: '' },
  mClass: { type: String, required: false, default: '' },
  mId: { type: String, required: false, default: '' },
  lastUpdated: { type: Number, required: false, default: 0 },
  loading: { type: Boolean, required: false, default: false },
  noIcon: { type: Boolean, required: false, default: false },
  ok: { type: Boolean, required: false, default: false },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const hId = ref('');
const ePre = ref(null);
const localLastUpdated = ref(0);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

const hasBody = computed(() => (typeof slots.default !== 'undefined'
  || (typeof props.body === 'string' && props.body.trim() !== '')));

const bodyClass = computed(() => { // eslint-disable-line arrow-body-style
  const tmp = 'modal-content__body';
  return (props.centre === true)
    ? `${tmp} ${tmp}--centre`
    : tmp;
});

const iconType = computed(() => {
  const icon = (typeof props.icon === 'string')
    ? props.icon.trim()
    : '';

  if (props.noIcon === true || icon === '') {
    return 'none';
  }

  if (/\.[a-z0-9]+$/i.test(icon)) {
    return 'img';
  }

  return 'icon';
});

const iconClass = computed(() => {
  const tmp = 'modal-content__icon';

  if (iconType.value === 'img') {
    return `${tmp} ${tmp}--img`;
  }

  const colour = (props.iconColour.trim() !== '')
    ? props.iconColour
    : 'green';
  const suffix = (props.ok === true)
    ? colour
    : 'red';

  return `material-symbols-rounded ${tmp} ${tmp}--symbol ${tmp}--${suffix}`;
});

const iconName = computed(() => {
  const icon = (props.icon.trim() !== '')
    ? props.icon
    : 'done';
  return (props.ok === true)
    ? icon
    : 'priority_high';
});

const wrapClass = computed(() => {
  const suffix = (props.mClass.trim() !== '')
    ? ` ${props.mClass}`
    : '';

  return `modal-content${suffix}`;
});

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle events

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre('modal-content', props.mId);
  }

  if (props.lastUpdated > localLastUpdated.value) {
    localLastUpdated.value = props.lastUpdated;

    hId.value = '';

    if (typeof props.mId === 'string' && props.mId.trim() !== '') {
      hId.value = props.mId;
    } else if (typeof props.id !== 'undefined') {
      hId.value = `modal-${props.id}`;
    }

    if (hId.value === '') {
      console.error( // eslint-disable-line no-console
        'ModalContent component requires a normal HTML id attribute '
        + 'or custom m-id attribute to be a non-empty string',
      );
    }
  }
});

onUpdated(() => {
  if (props.lastUpdated > localLastUpdated.value) {
    localLastUpdated.value = props.lastUpdated;
  }
});

//  END:  Lifecycle events
// --------------------------------------------------
</script>

<style lang="css" scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  row-gap: 1.5rem;
}
.modal-content__h {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}
.modal-content__body {}
.modal-content__body--centre {
  text-align: center;
}
.modal-content__icon {
  margin-left: auto;
  margin-right: auto;
}
.modal-content__icon--img {
  width: 3.5rem;
  height: 3.5rem;
}
.modal-content__icon--symbol {
  font-family: material-symbols-rounded;
}
.modal-content__icon--green {
  color: #050;
}
.modal-content__icon--red {
  color: #500;
}
</style>

