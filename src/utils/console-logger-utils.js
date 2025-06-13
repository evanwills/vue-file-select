/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

import { isNonEmptyStr, isObj } from './data-utils';

/**
 * @typedef {import('../../types/console-logger').TKeys} TKeys;
 * @typedef {import('../../types/console-logger').TLoggableVars} TLoggableVars;
 */

/**
 * Get keys in the right order based on reverse state (`rev`)
 *
 * @param {string[]} keys
 * @param {boolean} rev
 *
 * @returns {string[]}
 */
export const orderKeys = (keys, rev) => { // eslint-disable-line arrow-body-style
  return (Array.isArray(keys) && rev === true)
    ? keys.reverse()
    : keys;
};

/**
 * Get list of object property names to render in console
 *
 * > __Note:__ This function is *SUPER* for giving.
 * >           If you give it something it doesn't recognise it will
 * >           just ignore it and move on. If it can't recognise
 * >           anything, it will just return an empty array
 * >
 * > I will always return an array containging only known object
 * > property keys (or an empty array) if no keys could be matched).
 *
 * @param {object} obj  Object whose key/value pairs are to be logged
 *                      to console
 * @param {TKeys}  keys List of object property keys to be rendered
 *
 * @returns {string[]}
 */
export const getKeys = (obj, keys) => { // eslint-disable-line arrow-body-style
  const objKeys = Object.keys(obj);

  if (isObj(obj)) {
    if (Array.isArray(keys) === true) {
      let _keys = [];

      if (isNonEmptyStr(keys[0]) && keys[0].startsWith('!')) {
        // `keys` is an exclusion list so we're only going to return
        // property names that are not in the list of keys supplied

        // remove the NOT ("!") identifier from each key
        _keys = keys.map((key) => key.replace(/^!/, ''));

        return objKeys.filter((key) => _keys.includes(key) === false);
      }

      return objKeys.filter((key) => keys.includes(key) === true);
    }

    if (isNonEmptyStr(keys) === true) {
      const _key = keys.trim();

      if (_key === '*') {
        return objKeys;
      }

      if (objKeys.includes(_key)) {
        return [_key];
      }
    }
  }

  return [];
};

const logFormEvent = (target, grpName) => {
  if (typeof target !== 'undefined'
    && (target.faux === true
      || target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement)
  ) {
    console.groupCollapsed(`${grpName} - form event`);
    console.log('event.target.value:', target.value);
    console.log('event.target.validity:', target.validity);

    if (typeof target.reportValidity === 'function') {
      console.log('event.target.checkValidity():', target.checkValidity());
      console.log('event.target.reportValidity():', target.reportValidity());
    }
    console.groupEnd();
  }
};

const logKeyEvent = (event, grpName) => {
  if (event instanceof KeyboardEvent) {
    console.groupCollapsed(`${grpName} - keyboard event`);
    console.log('event.altKey:', event.altKey);
    console.log('event.code:', event.code);
    console.log('event.ctrlKey:', event.ctrlKey);
    console.log('event.key:', event.key);
    console.log('event.location:', event.location);
    console.log('event.metaKey:', event.metaKey);
    console.log('event.shiftKey:', event.shiftKey);
    console.log('event.getModifierState("AltGraph"):', event.getModifierState('AltGraph'));
    console.log('event.getModifierState("CapsLock"):', event.getModifierState('CapsLock'));
    console.log('event.getModifierState("NumLock"):', event.getModifierState('NumLock'));
    console.log('event.getModifierState("ScrollLock"):', event.getModifierState('ScrollLock'));
    console.groupEnd();
  }
};

/**
 * Console log all the properties of an object (and their names)
 *
 * @param {Object}  local Object containing values to be logged
 * @param {boolean} rev   Whether or not to log the values in
 *                        reverse order
 *
 * @returns {void}
 */
export const logObjProps = (local, grpName, rev = false) => {
  if (isObj(local)) {
    for (const key of orderKeys(Object.keys(local), rev)) {
      console.log(`${key}:`, local[key]);

      if (local[key] !== 'undefined' && (local[key] instanceof Event || local[key]?.faux === true)) {
        console.groupCollapsed(`${grpName} - ${local[key].type} event`);
        console.log('event.type:', local[key].type);
        console.log('event.target:', local[key].target);

        logFormEvent(local[key].target, grpName);
        logKeyEvent(local[key], grpName);
        console.groupEnd();
      }
    }
  }
};

/**
 * Call a console method with a given message (or list of messages)
 *
 * @param {string}          method Name of the console method to call
 * @param {string|string[]} msg    Value to pass to the console method
 */
export const consoleMsg = (method, msg) => {
  if (isNonEmptyStr(msg)) {
    console[method](msg);
  } else if (Array.isArray(msg)) {
    for (const str of msg) {
      console[method](str);
    }
  }
};
