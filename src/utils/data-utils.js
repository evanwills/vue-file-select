/**
 * Check whether the input is a plain JavaScript object.
 *
 * @param {unknown} input A value that may be an object
 *
 * @returns {boolean} TRUE if the input is an object (and not NULL
 *                    and not an array).
 *                    FALSE otherwise
 */
export const isObj = (input) => (Object.prototype.toString.call(input) === '[object Object]');

/**
 * Get a value, match by the supplied key from local storage or the
 * default value supplied if no value could be retrieved
 *
 * @param {string} key   Local Storage key where value is to be found
 * @param {any}    value Default value if to be returned if no value
 *                       could be retrieved from local storage
 *
 * @returns {void}
 */
export const setLocalValue = (key, value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

/**
 * Get a value, match by the supplied key from local storage or the
 * default value supplied if no value could be retrieved
 *
 * @param {string} key        Local Storage key where value is to be
 *                            found
 * @param {any}    defaultVal Default value if to be returned if no
 *                            value could be retrieved from local
 *                            storage
 * @returns {any}
 */
export const getLocalValue = (key, defaultVal) => {
  if (typeof localStorage !== 'undefined') {
    const output = localStorage.getItem(key);

    if (output !== null) {
      return output;
    }

    setLocalValue(key, defaultVal);
  }

  return defaultVal;
};
