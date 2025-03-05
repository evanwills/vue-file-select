/**
 * This file contains a collection of ("pure") utility functions for
 * performing common (vue specific) actions that are shared across
 * components.
 */

import { isNonEmptyStr, isObj } from './data-utils';

/**
 * Safely open a possibly already open dialogue model
 *
 * __Note:__ Older versions of chrome/Chromium have a bug where they
 *           throw an error if a modal is already open and you try
 *           and open it again.
 *
 * @param {HTMLDialogElement} modal
 */
export const doShowModal = (modal) => {
  if (modal !== null && modal.open !== true) {
    modal.showModal();
  }
};

/**
 * Safely close an open dialogue model
 *
 * __Note:__ Older versions of chrome/Chromium have a bug where they
 *           throw an error if a modal is already open and you try
 *           and open it again. It's possible that this bug would
 *           effect closing a modal too.
 *
 * @param {HTMLDialogElement} modal
 */
export const doCloseModal = (modal) => {
  if (modal !== null && modal.open === true) {
    modal.close();
  }
};

/**
 * Ensure input is a string that is __*NOT*__ wrapped in `<SPAN>`
 * tags
 *
 * @param {string} input Content that may be wrapped in `<SPAN>` tags
 *
 * @returns {string} Content that is definitely NOT wrapped in
 *                   `<SPAN>` tags.
 *                   (Empty string if input is not a string)
 */
export const stripWrapingSpan = (input) => {
  if (isNonEmptyStr(input) === false) {
    return '';
  }
  return input.replace(/(?:^<span>|<\/span>$)/ig, '');
};

/**
 * Ensure value is a plain text string with no HTML tags
 * (and possibly no HTML character entities).
 *
 * @param {string}  input      Content that contain unwanted HTML
 *                             tags
 * @param {boolean} noEntities Whether or not to strip HTML
 *                             Character Entities
 *
 * @returns {string} Content that has had any HTML tags removed
 *                   (Empty string if input is not a string)
 */
export const stripTags = (input, noEntities = false) => {
  if (isNonEmptyStr(input) === false) {
    return '';
  }

  let output = input.replace(/<[^>]+>/ig, '');

  if (noEntities === true) {
    output = output.replace(/&[^;+];/g, '');
  }

  return output;
};

/**
 * Check whether a blur event should trigger a `lostfocus` event
 *
 * @param {InputEvent}      event     onBlur event object
 * @param {VueComponent}    context   Vue component's `this` value
 * @param {string}          inputType Input field type
 * @param {number}          start     Where, in the related field's
 *                                    ID to start matching the field
 *                                    ID
 * @param {string}          fieldID   ID of the field that triggered
 *                                    the blur event
 * @param {string|string[]} tag       Name of tag (or list of tag
 *                                    names) that expected for the
 *                                    related target's tagName
 *                                    property
 *
 * @returns {boolean} TRUE if focus has moved away from the
 *                    triggering input field. FALSE otherwise.
 */
export const focusLost = (
  event,
  fieldID,
  inputType = 'radio',
  start = 0,
  tag = 'INPUT',
) => {
  const { relatedTarget } = event;
  const len = fieldID.length + start;

  if (typeof relatedTarget === 'undefined' || relatedTarget === null) {
    // If related target is undefined, then this was probably called
    // as a blur by clicking outside the input component/field.

    return true;
  }

  const { id, tagName, type } = relatedTarget;

  let okTag = false;

  const _tags = Array.isArray(tag)
    ? tag
    : [tag];

  for (const _tag of _tags) {
    if (_tag.toUpperCase() === tagName) {
      okTag = (tagName !== 'INPUT' || type === inputType);
      break;
    }
  }

  return (okTag === false
        || typeof id !== 'string'
        || id.substring(start, len) !== fieldID);
};

export const getVuexDispatcher = (store, action) => async (data) => store.dispatch(action, data);

/**
 * Check whether a property is a non-empty string
 *
 * @param {[index: string]: string|any} props    List of props from
 *                                               a given component
 * @param {string}                      propName Name of the prop to
 *                                               be tested
 *
 * @returns {boolean} TRUE if property is a string and is non-empty.
 *                    FALSE otherwise.
 */
export const propHasContent = (props, propName) => (typeof props[propName] === 'string' && props[propName].trim() !== '');

/**
 * Check whether a slot has any content
 *
 * @param {[index: string]: VNode} slots    List of slots from a
 *                                          given component
 * @param {string}                 slotName Name of the slot to be
 *                                          tested
 *
 * @returns {boolean} TRUE if slot exists and is non is non-empty.
 *                    FALSE otherwise.
 */
export const slotHasContent = (slots, slotName) => (typeof slots !== 'undefined' && slots !== null && !!slots[slotName]);

/**
 * Check whether a component has some content.
 *
 * @param {[index: string]: VNode}      slots    List of slots from a
 *                                               given component
 * @param {[index: string]: string|any} props    List of props from
 *                                               a given component
 * @param {string}                      slotName Name of the slot to
 *                                               be tested
 * @param {string}                      propName Name of the prop to
 *                                               be tested
 *                 > __Note:__ if prop name is null, slotName will
 *                 >           be used for both props and slots
 *
 * @returns {boolean} TRUE if either the slot or the prop is
 *                    non-empty. FALSE otherwise
 */
export const hasContent = (slots, props, slotName, propName) => {
  const _propName = (typeof propName === 'string')
    ? propName
    : slotName;

  return (slotHasContent(slots, slotName) || propHasContent(props, _propName));
};

/**
 * Check the URL to see if there's an anchor. If there is, and there
 * is a DOM node with a matching ID, attempt to scroll the user to
 * that anchor point.
 *
 * @param {number} count    Number of times to attempt to find scroll
 *                          point.
 * @param {number} interval Milliseconds delay between attempts to
 *                          find scroll point
 *
 * @returns {void}
 */
export const jumpToAnchor = (count = 100, interval = 100) => {
  const anchor = (typeof window.location.hash === 'string' && window.location.hash.trim() !== '')
    ? window.location.hash.replace('#', '')
    : false;

  if (anchor !== false) {
    let times = count;

    const int = setInterval(() => {
      times -= 1;

      if (times < 0) {
        clearInterval(int);
        return false;
      }

      const target = document.getElementById(anchor);
      if (target !== null) {
        target.scrollIntoView();
        clearInterval(int);

        return false;
      }

      return true;
    }, interval);
  }
};

/**
 * Handle everything to do with emitting a "lostfocus" event
 *
 * @param {InputEvent}            event     onBlur event object
 * @param {string}                fieldID   ID of the field that
 *                                          triggered the blur event
 * @param {CallableFunction}      emit      Vue event emitter function
 * @param {CallableFunction|null} validator Component data validation
 *                                          fucntion (Should also
 *                                          handle emitting "invalid"
 *                                          events)
 * @param {string}                inputType Input field type
 * @param {number}                start     Where, in the related
 *                                          field's ID to start
 *                                          matching the field ID
 * @param {string|string[]}       tag       Name of tag (or list of
 *                                          tag names) that expected
 *                                          for the related target's
 *                                          tagName property
 *
 * @returns {HTMLInputElement|null}
 */
export const multiFieldBlur = (
  event,
  fieldID,
  emit,
  validator = null,
  inputType = 'radio',
  start = 0,
  tag = 'INPUT',
) => {
  const lost = focusLost(event, fieldID, inputType, start, tag);

  if (lost === true) {
    if (validator !== null && typeof validator === 'function') {
      validator();
    }

    emit('lostfocus', { id: fieldID, lost });
  } else {
    emit('blur', event);
  }

  return {
    lost,
    target: (typeof event.target !== 'undefined')
      ? event.target
      : null,
  };
};

/**
 * Set all properties in an object to false
 *
 * @param {{[index:string]: boolean}} obj Source object
 *
 * @returns {{[index:string]: false}} new object with same keys as
 *                                    input but with all values set
 *                                    to `false`
 */
export const setAllToFalse = (obj) => {
  const output = {};

  for (const key of Object.keys(obj)) {
    output[key] = false;
  }

  return output;
};

/**
 * Check whether an event was emitted by a save button
 *
 * @param {Event|any} event Event object
 *
 * @returns {boolean} TRUE if event was triggered by a disabled save button
 */
export const saveAttemptedDetected = (event) => (typeof event !== 'undefined'
  && event !== null
  && typeof event.relatedTarget !== 'undefined'
  && event.relatedTarget !== null
  && event.relatedTarget.tagName === 'BUTTON'
  && event.relatedTarget.className.includes('save--disabled')
);

export const getHtag = (input, _default) => {
  let h = input;
  if (typeof h === 'string') {
    h = parseInt(h, 10);
  }

  if (typeof h !== 'number' || h < 1 || h > 6) {
    h = _default;
  }
  return `h${h}`;
};
