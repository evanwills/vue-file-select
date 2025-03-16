<template>
  <Transition
    leave-active-class="alert-block__active"
    leave-from-class="alert-block__leave-from"
    leave-to-class="alert-block__leave-to">
    <div v-if="!dismissed" :class="wrapClass" role="alert">
      <span
        v-if="symbol && noIcon === false"
        :class="iconClass"
        :data-icon="symbol">
        {{ symbol }}
      </span>
      <div class="alert-block__head">
        <component
          v-if="heading.trim() !== ''"
          class="alert-block__h"
          :is="hTag">
          {{ heading }}
        </component>

        <slot>
          <p class="alert-block__body" v-html="body"></p>
        </slot>

        <slot name="button">
          <p v-if="showLink">
            <a class="alert-block__link" :href="linkUrl">
              {{ linkTxt }}
            </a>
          </p>
        </slot>
      </div>

      <button
        v-if="dismissable"
        class="alert-block__cancel"
        type="button"
        v-on:click="dismiss">Close</button>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { getEpre } from '../utils/general-utils';
import { isNonEmptyStr } from '../utils/data-utils';
import { getHtag } from '../utils/vue-utils';

// --------------------------------------------------
// START: Component config

const componentName = 'alert-block';

const emit = defineEmits(['dismissed']);

//  END:  Component config
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * Whether or not this alert can be dismissed
   *
   * @property {boolean} dismissable
   */
  dismissable: { type: Boolean, required: false, default: false },

  /**
   * Heading text for the alert block
   *
   * > __Note:__ Headings with `<AlertBlock>` are rendered using
   * >           semantic HTML H tags
   *
   * @property {string} heading
   */
  heading: { type: String, required: false, default: '' },

  /**
   * The semantic heading level to be used for the alert block
   * (relative to the context in which it will be used)
   *
   * @property {number} hLevel
   */
  hLevel: { type: Number, required: false, default: 3 },

  /**
   * Body content for the alert block
   *
   * > __Note:__ Body content can also be passed in via the
   * >           component's default slot
   *
   * > __Note also:__ You could use the body slot to render the
   * >           entire contents of the component if you leave all
   * >           other properties empty
   * >           (except `type` for non-error alerts)
   *
   * @property {string} body
   */
  body: { type: String, required: false, default: '' },

  /**
   * By default, the icon is defined by the type. However, if you
   * wish to use a different icon for a given alert type, you can
   * set the icon type here.
   *
   * @property {string} icon
   */
  icon: { type: String, required: false, default: '' },

  /**
   * For dismissable alerts/notices, it is useful to know which
   * alert/notice was dismissed.
   *
   * if ID is supplied, it will be the value passed along with the
   * dismiss event.
   *
   * @property {string} id
   */
  id: { type: String, required: false, default: '' },

  /**
   * Text to render in the alert's footer link
   *
   * > __Note:__ Both `linkTxt` and `linkUrl` are required for the
   * >           link to be rendered
   *
   * @property {string} linkTxt
   */
  linkTxt: { type: String, required: false, default: '' },

  /**
   * URL for the alert's footer link
   *
   * > __Note:__ Both `linkUrl` and `linkTxt` are required for the
   * >           link to be rendered
   *
   * @property {string} linkUrl
   */
  linkUrl: { type: String, required: false, default: '' },

  /**
   * Whether or not hide the alert's icon
   *
   * @property {boolean} noIcon
   */
  noIcon: { type: Boolean, required: false, default: false },

  /**
   * By default `AlertBlock` renders a thick border along the left
   * hand side of the alert box and rounded corners on the right.
   * There are times when you want the thick border to be on the
   * top and the rounded corners on the bottom.
   * Adding the `notice` attribute to the `<AlertBlock />` HTML will
   * achieve this.
   *
   * @property {boolean} disminoticessable
   */
  notice: { type: Boolean, required: false, default: false },

  /**
   * Define the alert type (and set the default icon for that type)
   *
   * Known types are:
   * * `error` (default) - Red border & text with pale red background
   * * `info` - Blue border & text with pale blue background
   * * `success` - Green border & text with pale green background
   * * `warning` - Yellow/sand border & text with pale yellow background
   *
   * > __Note:__ You can override the default type icon via the
   * >           `icon` attribute
   *
   * @property {string} icon
   */
  type: { type: String, required: false, default: 'error' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const dismissed = ref(false);

/**
 * `ePre()` is used for prefixing the function/method name to
 * thrown errors to help identify which function/method triggered
 * the error. It is also used as the value passed to
 * `console.group()` calls to improve the information rendered in
 * the browser console when debugging issues during development
 * or bug fixing.
 *
 * This is here to make development and debugging easier.
 * It will be treeshaken from production code
 *
 * @param {string}              method Function/Method name of
 *                                     that threw error or where
 *                                     `console.group()` is called
 * @param {boolean|string|null} before If `TRUE` append "(before)"
 *                                     to the console group name.
 *                                     If `FALSE` append "(After)"
 *                                     to the console group name.
 *                                     If string, append the
 *                                     string to the console group
 *                                     name.
 *                                     If `NULL` value is ignored
 *
 * @returns {string}
 */
const ePre = ref(null); // eslint-disable-line no-unused-vars

//  END:  Local state
// --------------------------------------------------
// START: local helper functions

//  END:  local helper functions
// --------------------------------------------------
// START: Computed properties

const role = computed(() => { // eslint-disable-line arrow-body-style
  return (props.notice === true)
    ? undefined
    : 'alert';
});

/**
 * All the classes needed to make the alert wrapper look how it
 * should
 *
 * @returns {ComputedRef<string>}
 */
const wrapClass = computed(
  () => {
    const type = (props.notice === true)
      ? 'notice'
      : 'alert';

    return `alert-block alert-block--${type} alert-block--${props.type}`;
  },
);

/**
 * The icon to render in the left column of the alert
 *
 * @returns {ComputedRef<string>}
 */
const symbol = computed(() => {
  if (props.icon !== '') {
    return props.icon;
  }

  switch (props.type) {
    case 'info':
      return String.raw`info`;

    case 'warning':
      return String.raw`warning`;

    case 'success':
      return String.raw`\e86c`; // check_circle

    case 'error':
    default:
      return String.raw`error`;
  }
});

/**
 * All the classes to apply to the icon to ensure it looks how it
 * should
 *
 * @return {ComputedRef<string>}
 */
const iconClass = computed(() => `alert-block__icon alert-block__icon--${props.type}`);

/**
 * Correct tag name to use for the heading.
 *
 * @return {ComputedRef<string>}
 */
const hTag = computed(() => getHtag(props.hLevel, 3));

/**
 * Whether or not to render the alert's footer link
 *
 * @return {ComputedRef<boolean>}
 */
const showLink = computed(() => isNonEmptyStr(props.linkUrl) && isNonEmptyStr(props.linkTxt));

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

//  END:  Local methods
// --------------------------------------------------
// START: Event handlers

/**
 * Event handler for dismiss button
 */
const dismiss = () => {
  dismissed.value = true;
  emit('dismissed', props.id);
};

//  END:  Event handlers
// --------------------------------------------------
// START: Watcher methods

//  END:  Watcher methods
// --------------------------------------------------
// START: Lifecycle events

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre(componentName, props.heading); // eslint-disable-line no-unused-vars
  }
});

//  END:  Lifecycle events
// --------------------------------------------------
</script>

<style lang="css" scoped>
.alert-block {
  border-bottom-right-radius: 0.5rem;
  border-style: solid;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1rem 3rem;
  position: relative;
  max-width: 36rem;
}
.alert-block--notice {
  border-top-width: 0.25rem;
  border-bottom-left-radius: 0.5rem;
}
.alert-block--alert {
  border-left-width: 0.25rem;
  border-top-right-radius: 0.5rem;
}
.alert-block--info {
  --alert-colour: rgb(35, 0, 105);
  --alert-icon: info;
  color: var(--alert-colour);
  background-color: rgb(181, 151, 243);
  border-color: var(--alert-colour);
}
.alert-block--warning {
  --alert-colour: rgb(122, 75, 13);
  --alert-icon: warning;
  color: var(--alert-colour);
  background-color: rgb(243, 201, 147);
  border-color: var(--alert-colour);
}
.alert-block--success {
  --alert-colour: rgb(15, 108, 36);
  --alert-icon: \e86c;
  color: var(--alert-colour);
  background-color: rgb(153, 233, 170);
  border-color: var(--alert-colour);
}
.alert-block--error {
  --alert-colour: rgb(113, 18, 18);
  --alert-icon: error;
  color: var(--alert-colour);
  background-color: rgb(190, 117, 117);
  border-color: var(--alert-colour);
}

.alert-block__icon {
  font-family: material-symbols-rounded;
  font-size: 1.25rem;
  color: var(--alert-colour);
  position: absolute;
  top: 1rem;
  left: 1rem;
  margin-right: 0.75rem;
  line-height: 1.25rem;
}

.alert-block__icon::before {
  content: attr(data-icon string, var(--alert-icon));
}
</style>