<template>
  <div class="simple-carousel">
    <button
      :disabled="length <= 1 || pos === 0"
      class="simple-carousel__btn simple-carousel__btn--previous"
      type="button"
      value="-1"
      v-on:click="move">
      <span class="sr-only">Previous</span>
    </button>

    <ul class="simple-carousel__list" :style="cssCustomProps">
      <slot></slot>
    </ul>

    <button
      :disabled="length <= 1 || pos === (length - 1)"
      class="simple-carousel__btn simple-carousel__btn--next"
      type="button"
      value="1"
      v-on:click="move">
      <span class="sr-only">Next</span>
    </button>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  ref,
  watch,
} from 'vue';

// ------------------------------------------------------------------
// START: Vue utils

const emit = defineEmits(['previous', 'next', 'focusindex']);

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  length: { type: Number, required: true },
  focusPos: { type: Number, required: false, default: 0 },
  duration: { type: Number, required: false, default: 0.3 },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const pos = ref(0);
const init = ref(false);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

const round = (input) => (Math.round(input * 1000) / 1000);

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const cssCustomProps = computed(() => {
  let scItemWidth = round(100 / props.length);
  let scListWidth = (props.length * 100);
  let scTranslate = 0;

  if (pos.value > 0) {
    scTranslate = round(pos.value * (100 / props.length));
  }

  return `--sc-list-w: ${scListWidth}%;`
    + ` --sc-item-w: ${scItemWidth}%;`
    + ` --sc-trans-x: ${scTranslate * -1}%;`
    + ` --sc-trans-t: ${props.duration}s;`;
    // + ` transform: translateX(${scTranslate * -1}%);`;
});

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const move = (event) => {
  const increment = parseInt(event.target.value, 10);
  const oldPos = pos.value;

  if (increment > 0) {
    if (pos.value < (props.length - 1)) {
      pos.value += 1;
      emit('next', pos.value);
    }
  } else if (increment < 0) {
    if (pos.value > 0) {
      pos.value -= 1;
      emit('previous', pos.value);
    }
  }

  if (oldPos !== pos.value) {
    emit('focusindex', pos.value);
  }
};

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

watch(
  () => props.focusPos,
  (newPos) => {
    pos.value = newPos;
  },
);

watch(
  () => props.length,
  (newLen, oldLen) => {
    if (newLen >= pos.value) {
      pos.value = newLen - 1;
    } else if (oldLen === 0) {
      pos.value = 0;
    }
  },
);

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (init.value === false) {
    init.value = true;
    pos.value = props.focusPos;
  }
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>

<style scoped>
.simple-carousel {
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 0;
}

.simple-carousel__btn {
  align-items: center;
  background-color: transparent;
  bottom: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 1;
  padding: 0.5rem;
  position: absolute;
  top: 0;
  transition: opacity ease-in-out 0.3s;
  width: 3rem;
  z-index: 1;
}

.simple-carousel__btn:disabled {
  opacity: 0;
  cursor: default;
}

.simple-carousel__btn::after {
  align-items: center;
  border: 0.125rem solid #009;
  background-color: #fff;
  border-radius: 4rem;
  box-sizing: border-box;
  color: #009;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 900;
  height: 2rem;
  justify-content: center;
  width: 2rem;
}

.simple-carousel__btn--previous { left: 0; }
.simple-carousel__btn--previous::after {
  content: '\025BD';
  transform: rotate(90deg);
}
.simple-carousel__btn--next { right: 0; }
.simple-carousel__btn--next::after {
  content: '\025BD';
  transform: rotate(-90deg);
} /** \022C1 */

.simple-carousel__list {
  display: flex;
  flex-direction: row;
  margin: 0;
  padding: 0;
  position: relative;
  transform: translateX(var(--sc-trans-x));
  transition: transform ease-in-out var(--sc-trans-t);
  width: var(--sc-list-w, 100%);
}
.simple-carousel__list > * {
  width: var(--sc-item-w, 100%);
}
</style>
