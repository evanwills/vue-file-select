<template>
  <Transition
    leave-active-class="alert-block__active"
    leave-from-class="alert-block__leave-from"
    leave-to-class="alert-block__leave-to">
    <div v-if="!dismissed" :class="wrapClass" role="alert">
      <span
        v-if="symbol && noIcon === false"
        class="alert-block__icon">
        {{ icon }}
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

/**
 * All the classes needed to make the alert wrapper look how it
 * should
 *
 * @returns {ComputedRef<string>}
 */
const wrapClass = computed(
  () => {
    let side = 'border-l-4';
    let corners = 'rounded-r-lg';

    if (props.notice === true) {
      side = 'border-t-4';
      corners = 'rounded-b-lg';
    }

    let colours = '';

    switch (props.type) {
      case 'info':
        colours = 'bg-purple-50 border-purple-500 text-purple-700';
        break;

      case 'warning':
        colours = 'bg-sand-50 border-sand-500 text-sand-700';
        break;

      case 'success':
        colours = 'bg-green-50 border-green-500 text-green-700';
        break;

      case 'error':
      default:
        colours = 'bg-red-50 border-red-500 text-red-700';
    }

    return 'relative box-border flex flex-col max-w-xl p-4 pl-12 '
      + `${corners} ${side} ${colours}`;
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
const iconClass = computed(() => {
  let colours = '';

  switch (props.type) {
    case 'info':
      colours = 'text-purple-500';
      break;

    case 'warning':
      colours = 'text-sand-500';
      break;

    case 'success':
      colours = 'text-green-500';
      break;

    case 'error':
    default:
      colours = 'text-red-500';
  }

  return 'material-symbols-rounded absolute top-4 left-4 mr-3 leading-5 '
   + `${colours} before:text-xl before:content-['${symbol.value}']`;
});

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
  emit('dismissed');
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
</script>
