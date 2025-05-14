/**
 * This file contains a collection of "pure" function that help with
 * testing and modifying data from the server.
 *
 * Each function is exported so it can be easily unit tested.
 *
 * @file data-utils.js
 * @author Evan Wills <evan.wills@thesmithfamily.com.au>
 */

import { makePossessive } from './general-utils';

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

export const arrayRemoveValue = (arr, value) => arr.filter((el) => el !== value);

/**
 * Convert empty strings (or non-strings) to NULL otherwise return
 * the string with any leading or trailing white space removed
 *
 * @param {string|null} input Value to be checked
 *
 * @returns {string|null}
 */
export const empty2null = (input) => {
  const output = (typeof input === 'string')
    ? input.trim()
    : null;

  return output !== ''
    ? output
    : null;
};

/**
 * Get a string from any input.
 * If input is a string return it unchanged.
 * If input a number convert it to string.
 * For everything else return an empty string
 *
 * @param {any} input Value to be forced to string
 *
 * @returns {string}
 */
export const nullStr = (input) => { // eslint-disable-line arrow-body-style
  const t = typeof input;
  if (t === 'number') {
    return input.toString();
  }
  return (typeof input === 'string')
    ? input
    : '';
};

/**
 * Check whether a value is empty or null
 *
 * @param {any} input value to be tested
 *
 * @returns {boolean} TRUE if input is undefined, NULL or empty string
 */
export const emptyOrNull = (input) => {
  const t = typeof input;

  return (t === 'undefined' || input === null || input === 0
    || (t === 'string' && input.trim() === ''));
};

/**
 * Check whether the data supplied infers it represents a child user
 *
 * Look through the properties of the supplied object and check if it
 * has `SchoolName`, if so assume it represents a child user.
 *
 * @param {object} data user data object
 *
 * @returns {boolean} TRUE if data is assumed to represent a child.
 *                    FALSE otherwise
 */
export const isChild = (data) => (typeof data?.SchoolName !== 'undefined');

export const getDisplayName = (user) => { // eslint-disable-line arrow-body-style
  return (typeof user.ApprovedDisplayName === 'string' && user.ApprovedDisplayName.trim() !== '')
    ? user.ApprovedDisplayName.trim()
    : user.FirstName.trim();
};

export const getPosessiveName = (user) => makePossessive(getDisplayName(user));

/**
 * Check whether a value is boolean and TRUE
 *
 * @param {any} input A value to be tested
 *
 * @returns {boolean} TRUE if the value is boolean and TRUE.
 *                    FALSE otherwise.
 */
export const isBoolTrue = (input) => (typeof input === 'boolean' && input === true);

/**
 * Check whether a value is boolean and TRUE
 *
 * @param {any} input A value to be tested
 *
 * @returns {boolean} TRUE if the value is boolean and TRUE.
 *                    FALSE otherwise.
 */
export const isBoolAnd = (input, val = true) => (typeof input === 'boolean' && input === val);

export const isNum = (input) => (typeof input === 'number'
  && Number.isNaN(input) === false && Number.isFinite(input) === true);

/**
 * Try to force a value to be a number
 *
 * @param {any}     input Value to be forced to a number
 * @param {boolean} float Whether or not output should be a float
 *
 * @returns {number|null} Number if value could be forced to a number.
 *                        NULL otherwise
 */
export const forceNum = (input, float = false) => {
  let output = input;
  if (typeof input === 'string') {
    output = (float === true)
      ? parseFloat(output)
      : parseInt(output, 10);
  }

  if (isNum(output) === true) {
    return (float === true)
      ? output
      : Math.round(input);
  }

  return null;
};

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

export const isStrNum = (input) => {
  const t = typeof input;
  return (t === 'string' || t === 'number');
};

/**
 * Check whether a value is NULL, string, number or boolean
 *
 * @param {any} input
 *
 * @returns {boolean} TRUE if value is null or scalar.
 */
export const isScalarOrNull = (input) => (
  input === null || ['string', 'number', 'boolean'].indexOf(typeof input) > -1
);

export const mergeData = (oldData, newData) => {
  const output = { ...oldData };

  for (const key of Object.keys(newData)) {
    if (typeof output[key] !== 'undefined') {
      output[key] = newData[key];
    } else {
      throw new Error(`${key} is not a property in oldData`);
    }
  }

  return output;
};

/**
 * Check whether a value is NULL or a string
 *
 * @param {any} input
 *
 * @returns {boolean} TRUE if value is null or string.
 *                    FALSE otherwise
 */
export const isStrOrNull = (input) => (input === null || typeof input === 'string');

const _mergeDeepDataArray = (oldData, newData, noNew) => {
  if (!Array.isArray(newData)) {
    throw new Error('oldData is an array but newData is not');
  }

  const l = oldData.length > newData.length
    ? oldData.length
    : newData.length;
  const output = [];

  for (let a = 0; a < l; a += 1) {
    if (typeof oldData[a] === 'undefined') {
      output.push(newData[a]);
    } else if (typeof newData[a] === 'undefined') {
      if (noNew === false) {
        output.push(oldData[a]);
      }
    } else {
      // eslint-disable-next-line no-use-before-define
      output.push(mergeDeepData(oldData[a], newData[a]));
    }
  }

  return output;
};

const _mergeDeepDataObject = (oldData, newData, noNew) => {
  if (!isObj(newData)) {
    throw new Error('oldData is an Object but newData is not');
  }

  const output = { ...oldData };

  for (const key of Object.keys(newData)) {
    if (typeof oldData[key] === 'undefined') {
      if (noNew === false) {
        output[key] = newData[key];
      }
    } else {
      // eslint-disable-next-line no-use-before-define
      output[key] = mergeDeepData(oldData[key], newData[key]);
    }
  }

  return output;
};

/**
 * Recursively merge new data into old data
 *
 * @param {any}     oldData Old value to be compared with new value
 * @param {any}     newData New value to replace old value
 * @param {boolean} noNew   Whether or not
 *
 * @returns {any} A new version of oldData with the newData values
 *                recursively merged
 */
export const mergeDeepData = (oldData, newData, noNew = true) => {
  if (typeof oldData === 'undefined' || newData === 'undefined') {
    throw new Error('mergeDeepData() param `oldData` or `newData` were undefined');
  }

  if (isScalarOrNull(oldData)) {
    if (!isScalarOrNull(newData)) {
      throw new Error('oldData is scalar but newData is not');
    }
    return newData;
  }

  if (Array.isArray(oldData)) {
    return _mergeDeepDataArray(oldData, newData, noNew);
  }

  if (isObj(oldData)) {
    return _mergeDeepDataObject(oldData, newData, noNew);
  }

  throw new Error('could not merge `newData` into `oldData`');
};

/**
 * Check whether object's string property is a non empty string
 *
 * @param {object} obj  Object to be tested
 * @param {string} prop Name of object property
 *
 * @returns {boolean} TRUE if property is string and non-empty.
 */
export const isNonEmptyStr = (obj, prop) => {
  if (typeof prop === 'undefined' && typeof obj === 'string') {
    return (obj.trim() !== '');
  }

  return (isObj(obj) && typeof obj[prop] === 'string' && obj[prop].trim() !== '');
};

const _objectsAreSameArray = (obj1, obj2) => {
  if (!Array.isArray(obj2)) {
    return false;
  }

  const l = obj1.length;

  if (l !== obj2.length) {
    return false;
  }

  for (let a = 0; a < l; a += 1) {
    // eslint-disable-next-line no-use-before-define
    if (!objectsAreSame(obj1[a], obj2[a])) {
      return false;
    }
  }

  return true;
};

const _objectsAreSameObject = (obj1, obj2) => {
  if (!isObj(obj2)) {
    return false;
  }

  for (const key of Object.keys(obj1)) {
    // eslint-disable-next-line no-use-before-define
    if (!objectsAreSame(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Recursively compare two objects.
 *
 * If a difference is encountered, FALSE is immediately returned.
 *
 * > __Note:__ The second object __*MUST*__must include all the
 * >           properties of the first object but can also include
 * >           any number of other properties.
 * >           Properties that are not in the first object are
 * >           ignored.
 *
 * @param {object} obj1 First object to be compared
 *                      (usually user updated values)
 * @param {object} obj2 Second object to be compared.
 *                      (usually data received from the server)
 *
 * @returns {boolean} TRUE if all properties (and their children) of
 *                    the first object have the same value in obj2.
 *                    FALSE otherwise
 * @throws {Error} If either argument are not objects
 * @throws {Error} If a property from obj1 is missing in obj2
 */
export const objectsAreSame = (obj1, obj2) => {
  // --------------------------------------------
  // START: handle scalar values

  if (isScalarOrNull(obj1)) {
    if (typeof obj1 !== typeof obj2) {
      return false;
    }
    return (obj1 === obj2);
  }

  //  END:  handle scalar values
  // --------------------------------------------
  // START: handle arrays

  if (Array.isArray(obj1)) {
    return _objectsAreSameArray(obj1, obj2);
  }

  //  END:  handle arrays
  // --------------------------------------------
  // START: handle objects

  if (isObj(obj1)) {
    return _objectsAreSameObject(obj1, obj2);
  }

  //  END:  handle objects
  // --------------------------------------------
  // START: Sad times

  throw new Error('could not compare obj1 & obj2');

  //  END:  Sad times
  // --------------------------------------------
};

export const simpleStr = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '');
};

export const updateObject = (object, updates) => {
  const result = {};

  Object.keys(object)
    .forEach((key) => {
      if (updates[key] !== null) {
        result[key] = (key in updates)
          ? updates[key]
          : object[key];
      } else {
        result[key] = object[key];
      }
    });

  return result;
};

/**
 * Merge user updated data into original data received from the
 * server so updates can be returned to the server.
 *
 * @param {object} oldData Original object to be updated
 * @param {object} newData New data to be merged into old data
 *                         before being sent to server
 * @param {string} dataKey Key for nested data (if appropriate);
 *
 * @returns {object} Deep clone of old data with new data merged in
 */
export const updateObjectNew = (oldData, newData, dataKey = '') => {
  // Deep copy source object
  const output = JSON.parse(JSON.stringify(oldData));

  let _dataKey = (typeof dataKey === 'undefined' || dataKey === null)
    ? ''
    : dataKey;

  if (typeof _dataKey !== 'string') {
    throw new Error(
      'updateObjectNew() expects third parameter `dataKey` '
      + 'to be a string',
    );
  }

  _dataKey = _dataKey.trim();

  if (_dataKey !== '') {
    if (typeof output[_dataKey] !== 'object') {
      throw new Error(
        `updateObjectNew() expects third parameter "${_dataKey}" `
        + 'to be a property name for the object to be updated.',
      );
    }

    output[_dataKey] = mergeData(output[_dataKey], newData);

    return output;
  }

  return mergeData(output, newData);
};

/**
 * Rewrite all the object's properties in some way.
 *
 * @param {Object} obj Object to be converted
 * @param {(string) : string} converter Function for rewriting
 *                                      object property names
 *
 * @returns {Object} New object with the same values as original
 *                   input object but with new property names.
 */
export const rewriteObjPropNames = (obj, converter) => {
  const output = {};

  for (const key of Object.keys(obj)) {
    output[converter(key)] = obj[key];
  }

  return output;
};

export const yesNoNull = (value) => {
  if (value === null || typeof value === 'undefined') {
    return '';
  }

  return (value === true || value === 1
    || (typeof value === 'string' && value.toLowerCase() === 'yes'))
    ? 'Yes'
    : 'No';
};

/**
 * Test input to see if it's a valid GUID
 *
 * @param {any} input Any value to be tested
 *
 * @returns {string|null} If input passes validation, then it is
 *                        returned unchanged.
 *                        If intput does not pass validation, NULL
 *                        is returned
 */
export const validGUID = (input) => { // eslint-disable-line arrow-body-style
  if (typeof input === 'string'
    && input.length === 36
    && input.indexOf('-') === 8
    && /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(input) === true
  ) {
    return input;
  }

  return null;
};
