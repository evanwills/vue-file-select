import { isObj } from '../../../utils/data-utils';
import { strArrayToHumanStr } from '../../../utils/string-utils';
import mimeTypes from './mimeTypes';

export const cloneFileDataItem = (file) => ({ ...file });

/**
 * @typedef FormatFunc
 * @type {Function}
 *
 * @param {number|string}
 * @returns {string}
 */

/**
 * Get the file size metadata of a file (based on the supplied file
 * sise in bytes)
 *
 * @param {number} bytes    File size in bytes
 * @param {number} decimals number of decimal points to return
 *
 * @returns {object}
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = (decimals < 0)
    ? 0
    : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const full = `${parseFloat((bytes / (k ** i))).toFixed(dm)} ${sizes[i]}`;

  const obj = {
    size: Math.round(parseFloat((bytes / (k ** i)))),
    full: full.replace(/\.00/, ''),
    type: `${sizes[i]}`,
  };

  return obj;
};

const enhanceMessageInner = (bits, format) => {
  const formater = (format === true)
    ? (input) => { // eslint-disable-line arrow-body-style
      return (typeof input === 'number')
        ? formatBytes(input).full
        : input;
    }
    : (input) => input;

  return (whole, key) => { // eslint-disable-line arrow-body-style
    const t = typeof bits[key];

    if (t === 'string' || t === 'number') {
      return formater(bits[key]);
    }

    return '';
  };
};

/**
 * Replace placeholder strings in a message with supplied "bits" of
 * data
 *
 * @param {string}  message Message string to enhance
 * @param {Object.<string, string>} bits    key/value pairs where the
 *                  key is the placeholder and the value is the
 *                  placeholder's replacement value
 * @param {boolean} format  Whether or not to format the value as a
 *                  human readable representation number of bytes
 *
 * @returns {string}
 */
export const enhanceMessage = (message, bits, format = false) => message.replace(
  /\[\[([a-z\d_-]+)\]\]/ig,
  enhanceMessageInner(bits, format),
);

export const fileIsOK = (fileData) => (fileData.ok === true);

export const fileIsGood = (good) => (fileData) => (fileData.ok === good);

// eslint-disable-next-line arrow-body-style
export const isNum = (input, min = null, max = null) => !(typeof input !== 'number'
  || Number.isNaN(input)
  || !Number.isFinite(input)
  || (isNum(min) && input < min)
  || (isNum(max) && input > max));

/**
 *
 * @param {File} file
 * @returns {string}
 */
export const getFileExtension = (file) => file.name.replace(/^.*?\.(?=[a-z\d]+$)/i, '').toLowerCase();

const makeExt = (str) => str.replace(/[^a-z0-9]+/, '').substring(0, 4);

const prepTypeArray = (types) => {
  if (typeof types === 'string') {
    const typeList = types.replace(/[\t\n\r :;|,]+/g, ' ').toLowerCase().trim().split(' ');

    return typeList.map((_type) => _type.trim());
  }

  if (Array.isArray(types) !== true) {
    throw new Error(
      'prepTypeArray() expects only param `types` to be an array. '
      + `${typeof types} given.`,
    );
  }

  if (types.length === 0) {
    return [];
  }

  const t = typeof types[0];

  if (t === 'undefined' || isObj(types[0]) === false) {
    console.error('prepareTypesArray() types[0] is undefined');
    console.log('types:', types);
    throw new Error('prepareTypesArray() expects types[0] to be an object');
  }

  if (t === 'string') {
    return types;
  }

  if (typeof types[0].ext === 'string' && typeof types[0].mime === 'string') {
    return types.map((_type) => _type.mime);
  }

  throw new Error(
    'prepTypeArray() could not determin how to prepare',
  );
};

const getMimes = () => {
  const allowedMime = {};

  for (const _type of Object.keys(mimeTypes)) {
    allowedMime[mimeTypes[_type].mime] = mimeTypes[_type];
  }

  return allowedMime;
};

export const stringTypesToArray = (types) => {
  const typeList = types.replace(/[\t\n\r :;|,]+/g, ' ').toLowerCase().trim().split(' ');

  return typeList.map((_type) => _type.trim());
};

/**
 * Get list of allowed file types separated list of file extensions
 *
 * @param types Space separated list of file extensions
 *
 * @returns List of allowed file types user can upload
 */
export const getAllowedTypes = (types) => {
  const typeList = prepTypeArray(types);

  /**
   * List of good file extensions
   *
   * @var {string[]}
   */
  const good = [];
  /**
   * List of allowed file type metadata objects
   */
  const output = [];
  const bad = [];

  const allowedMime = getMimes();

  for (const _type of typeList) {
    const ext = makeExt(_type);

    if (typeof mimeTypes[ext] !== 'undefined') {
      if (good.includes(ext) === false) {
        good.push(ext);
        output.push(mimeTypes[ext]);
      }
    } else if (typeof allowedMime[_type] !== 'undefined') {
      if (good.includes(allowedMime[_type].ext) === false) {
        good.push(allowedMime[_type].ext);
        output.push(allowedMime[_type]);
      }
    } else if (bad.includes(_type) === false) {
      bad.push(_type);
    }
  }

  if (good.length === 0) {
    // eslint-disable-next-line no-console
    throw new Error(
      `Bad file mime types specified: "${bad.join('", "')}"`,
    );
  }

  return output;
};

const getHumanAllowedTypeList = (types) => {
  const tmp = [];
  for (const type of types) {
    tmp.push(`.${type.ext}`);
  }

  return strArrayToHumanStr(tmp);
};

export const resetPos = (file, index) => {
  file.position = index; // eslint-disable-line no-param-reassign
  return file;
};

/**
 * Check whether the type of the current file is allowed
 *
 * @param {File}  file  File to test for mime type validation
 * @param {Array} types Allowed types
 *
 * @returns {boolean} TRUE if the file type matches one of the
 *                    allowed file types. FALSE otherwise
 */
export const isValidFileType = (file, types) => (
  types.length === 0
  || typeof types.find((mime) => mime.mime === file.type) !== 'undefined'
);

/**
 * Convert human readable file size into bytes so it can be compared
 * to File.size values
 *
 * @param humanSize Human readable file size
 *
 * @returns file size in Bytes
 */
export const humanFileSizeToBytes = (humanSize) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  const bits = humanSize.match(/([0-9.]+)([KMG]?B)?/);
  const errorMsg = 'Invalid file size found. Could not convert '
    + `"${humanSize}" to Bytes`;

  if (bits === null) {
    // eslint-disable-next-line no-console
    throw new Error(errorMsg);
  }

  const num = parseFloat(bits[1]);
  const unit = (typeof bits[2] === 'string' && bits[2] !== '')
    ? bits[2]
    : 'B';

  const i = units.indexOf(unit);

  if (i > -1 && num > 0) {
    return Math.round(num * (1024 ** i));
  }

  // eslint-disable-next-line no-console
  throw new Error(errorMsg);
};

const sanitseFileName = (name) => name.trim().replace(/[^a-z\d._-]+/ig, '-').replace(/--+/g, '-');
const santiseFileExt = (name) => name.trim().replace(/[^a-z\d.]+/ig, '');

/**
 * Get a unique file name for a possibly default file name
 *
 * If file was generated by iOS camera it will always have a file
 * name of "image.jpg". If the file has this name add a timestamp to
 * the file name to make it unique.
 *
 * @param {File}               file File whose name needs to be made
 *                                  unique
 * @param {string|number|null} id   The ID assigned to fileData
 *
 * @returns {string} Unique file name
 */
export const getUniqueFileName = (fileName, id = null) => {
  if (typeof fileName !== 'string' || fileName.trim() === '') {
    throw new Error(
      'getUniqueFileName() expects only argument `fileName` to be a '
      + 'non-empty string',
    );
  }

  /**
   * List of known generic file names that need to be made unique
   *
   * This is a list of generic and unchanging file names generated by
   * device cameras when using the device camera for file upload,
   * rather than uploading an existing image file.
   *
   * @var {string[]} genericNames
   */
  const genericNames = ['image.jpg'];

  /**
   * @var {string} name File name to be made unique (if required)
   */
  const name = fileName.trim().toLowerCase();

  if (genericNames.includes(name) === false) {
    // This is just a normal file with a normal file name
    return sanitseFileName(fileName);
  }

  // This is a known generic file name probably generated by an
  // iOS device camera. The device is clearly too stupid to give
  // the file a unique file name so we need to make the file name
  // unique.
  const bits = fileName.split('.', 2);

  const _t = typeof id;
  const _id = (_t === 'string' || _t === 'number')
    ? id
    : Date.now();

  return `${sanitseFileName(bits[0])}_${_id}.${santiseFileExt(bits[1])}`;
};

export const getEventTypes = () => ({
  allcomplete: {
    dataType: 'boolean',
    description: 'Emitted when work on a single file is '
      + 'complete. Data will only be `TRUE` if there are no '
      + 'more files yet to complete processing.',
  },
  complete: {
    dataType: 'AllCompleteEventData',
    description: 'Emitted when work on a single file is '
      + 'complete.',
  },
  toomany: {
    dataType: 'ToomanyEventData',
    description: 'Emitted when work on a single file is '
      + 'complete but the total number of files selected is '
      + 'greater than allowed',
  },
  toobig: {
    dataType: 'ToobigEventData',
    description: 'Emitted when work on a single file is '
      + 'complete but combined size of all the files is larger '
      + 'than allowed',
  },
  oversize: {
    dataType: 'OversizeEventData',
    description: 'Emitted when work on a single file is '
      + 'complete but that file is larger than allowed for a '
      + 'single file',
  },
  invalid: {
    dataType: 'InvalidEventData',
    description: 'Emitted when work on a single file is '
      + 'complete but the type of that file is not in the '
      + 'allowed list.',
  },
  processing: {
    dataType: 'string',
    description: 'Emitted when work starts on file named in '
      + 'the data.',
  },
  processCount: {
    dataType: 'number',
    description: 'Emitted when work starts on a batch of files',
  },
});

export const getValidJpegCompression = (value) => {
  if (isNum(value, 0, 1) === false) {
    throw new Error(
      'getValidSetJpegCompression() expects only argument `value` '
      + 'to be a number that is greater than or equal to zero and '
      + 'less than or equal to one',
    );
  }

  return value;
};

export const getValidMaxSingleSize = (max) => {
  const t = typeof max;
  if (t === 'number') {
    if (max === -1) {
      return (1024 * 1024 * 1024 * 1024);
    }

    if (max > 256) {
      return max;
    }

    throw new Error(
      'getValidMaxSingleSize() expects only argument '
      + '`max` to be a number that is -1 (equivalent to infinite)'
      + ' or greater than 256.',
    );
  }

  if (t !== 'string') {
    throw new Error(
      'getValidMaxSingleSize() expects only argument '
      + `\`max\` to be a string. ${t} given`,
    );
  }

  try {
    return humanFileSizeToBytes(max);
  } catch (e) {
    throw new Error(
      e.message.replace(
        /^.*?. /,
        'getValidMaxSingleSize() ',
      ),
    );
  }
};

/**
 * Get the maximum total byte size allowed for all files
 *
 * @returns {number}
 */
export const getValidMaxTotalSize = (max) => {
  const t = typeof max;

  if (t === 'number') {
    return max;
  }

  if (t !== 'string') {
    throw new Error(
      'getValidMaxTotalSize() expects only argument '
      + `\`max\` to be a string. ${t} given`,
    );
  }

  try {
    return humanFileSizeToBytes(max);
  } catch (e) {
    throw new Error(
      e.message.replace(
        /^.*?. /,
        'getValidMaxTotalSize() ',
      ),
    );
  }
};

/**
 * Set the maximim pixel count in either direction an image can
 * be before it is resized
 *
 * @param {number} count
 *
 * @returns {void}
 */
export const getValidMaxImgPx = (px) => {
  const _px = (typeof px === 'string')
    ? parseInt(px, 10)
    : px;

  if (isNum(_px, 50, 50000) === false) {
    throw new Error(
      'getValidMaxImgPx() expects only argument `px` '
      + 'to be a number that is greater than or equal to 50 and '
      + 'less than or equal to 50,000',
    );
  }

  return Math.round(_px);
};

/**
 * Set the maximum number of files the user can upload
 *
 * @param {number} count
 *
 * @returns {void}
 */
export const getValidMaxFileCount = (count) => {
  if (isNum(count, 1) === false) {
    throw new Error(
      'getValidMaxFileCount() expects only argument '
      + '`count` to be a number greater than 1',
    );
  }

  return Math.round(count);
};

export const getValidSetBoolTrue = (input) => (input === true);

/**
 * Get a function that can be used to validate a given config
 * property value
 *
 * @param {string} key config object property name
 *
 * @returns {Function} Function for validating the config property
 *                     value
 */
export const getRightConfigValidateFunc = (key) => {
  switch (key) {
    case 'greyScale':
    case 'omitInvalid':
    case 'logging':
      return getValidSetBoolTrue;

    case 'allowedTypes':
      return getAllowedTypes;

    case 'jpegCompression':
      return getValidJpegCompression;

    case 'maxFileCount':
      return getValidMaxFileCount;

    case 'maxImgPx':
      return getValidMaxImgPx;

    case 'maxSingleSize':
      return getValidMaxSingleSize;

    case 'maxTotalSize':
      return getValidMaxTotalSize;

    default:
      throw new Error(
        'getRightConfigValidateFunc() could not determine the '
        + `correct function to return using "${key}"`,
      );
  }
};

export const overrideMessages = (ogMessages, newMessages, allowed) => {
  const output = { ...ogMessages };

  for (const key of Object.keys(ogMessages)) {
    if (typeof output[key] === 'string'
      && typeof newMessages[key] === 'string'
    ) {
      output[key] = newMessages[key];
    }
  }

  const tmpl = '[[TYPE_LIST]]';

  if (output.invalidType.includes(tmpl)) {
    output.invalidType = output.invalidType.replace(
      tmpl,
      getHumanAllowedTypeList(allowed),
    );
  }

  return output;
};

export const overrideConfig = (defaultConfig, config) => {
  const output = { ...defaultConfig };

  if (isObj(config) === true) {
    const { messages, ...overrides } = config;

    for (const key of Object.keys(output)) {
      if (typeof overrides[key] !== 'undefined') {
        const func = getRightConfigValidateFunc(key);

        try {
          output[key] = func(overrides[key]);
        } catch (e) {
          console.error('e.message:', e.message);
          throw Error(e.message);
        }
      }
    }

    if (isObj(messages) === true && isObj(output.messages) === true) {
      output.messages = overrideMessages(
        output.messages,
        messages,
        output.allowedTypes,
      );
    }
  }

  return output;
};

export const rewriteError = (msg) => msg.replace(
  'getValid',
  'FileSelectData.set',
);

export const rewriteConfigError = (msg) => {
  const bits = msg.match(/^([^ ]+) (.*)$/);
  let key = bits[1].replace(/^getValid([^()]+)\(.*$/i, '$1');
  key = key.substring(0, 1).toLowerCase() + key.substring(1);

  let tail = bits[2].trim();
  tail = tail.substring(0, 1).toLowerCase() + tail.substring(1);

  return `FileSelectData constructor expects config.${key} to be `
    + `valid: ${tail}`;
};

export const strRev = (input) => input.split('').reverse().join('');

/**
 *
 *
 * @param {number} input
 */
export const formatNum = (input) => { // eslint-disable-line arrow-body-style
  return (typeof input === 'number')
    ? input.toLocaleString('en-AU')
    : '0';
};

export const getFileReaderOnload = (context) => (e) => {
  context.src = e.target.result;
  context._dispatch('imageSrcSet', context.id);
};

export const isFileDataObj = (input) => {
  if (typeof input === 'undefined' || input === null
    || typeof input.file === 'undefined' || input.file instanceof File === false
  ) {
    return false;
  }

  const strProps = [
    'ext',
    'id',
    'mime',
    'name',
    'ogName',
    'previousName',
    'src',
  ];
  const boolProps = [
    'ok',
    'processing',
    'invalid',
    'isImage',
    'tooHeavy',
    'tooLarge',
  ];
  const numProps = [
    'ogSize',
    'lastModified',
    'position',
    'replaceCount',
    'size',
  ];
  const methods = [
    'addWatcher',
    'height',
    'ogHeight',
    'ogWidth',
    'process',
    'removeWatcher',
    'width',
  ];

  for (const key of strProps) {
    if (typeof input[key] !== 'string') {
      return false;
    }
  }

  for (const key of boolProps) {
    if (typeof input[key] !== 'boolean') {
      return false;
    }
  }

  for (const key of numProps) {
    if (typeof input[key] !== 'number') {
      return false;
    }
  }

  for (const key of methods) {
    if (typeof input[key] !== 'function') {
      return false;
    }
  }

  return true;
};
