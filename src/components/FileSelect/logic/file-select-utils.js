import { isObj } from '../../../utils/data-utils';
import mimeTypes from './mimeTypes';

export const dummyDispatch = (_eventName, _data) => {};

export const cloneFileDataItem = (file) => ({ ...file });

export const fileIsOK = (fileData) => (fileData.ok === true);

export const fileIsGood = (good) => (fileData) => (fileData.ok === good);

export const isNum = (input, min = null, max = null) => {
  if (typeof input !== 'number' || isNaN(input) || !isFinite(input)) {
    return false;
  }

  if (isNum(min) && input < min) {
    return false;
  }

  if (isNum(max) && input > max) {
    return false;
  }

  return true;
}

/**
 *
 * @param {File} file
 * @returns {string}
 */
export const getFileExtension = (file) => file.name.replace(/^.*?\.([a-z\d]+)$/i, '');

export const overrideConfig = (defaultConfig, config) => {
  const output = { ...defaultConfig };

  if (isObj(config) === true) {
    for (const key of Object.keys(output)) {
      if (typeof config[key] !== 'undefined') {
        const func = getRightConfigValidateFunc(key);

        try {
          output[key] = func(config[key]);
        } catch (e) {
          throw Error(e.message);
          // throw Error(rewriteConfigError(e.message));
        }
      }
    }
  }

  return output;
};

const makeExt = (str) => str.replace(/[^a-z0-9]+/, '').substring(0, 4);

const prepTypeArray = (types) => {
  if (typeof types === 'string') {
    const typeList = types.replace(/[\t\n\r\s :;|,]+/g, ' ').toLowerCase().trim().split(' ');

    return typeList.map((_type) => _type.trim());
  }

  if (Array.isArray(types) !== true) {
    throw new Error(
      'prepTypeArray() expects only param `types` to be an array. '
      + `${typeof types} given.`,
    );
  }

  if (typeof types[0] === 'string') {
    return types;
  }

  if (typeof types[0].ext === 'string' && typeof types[0].mime === 'string') {
    return types.map((_type) => _type.mime);
  }

  throw new Error(
    'prepTypeArray() could not determin how to prepare',
  );
}

const getMimes = () => {
  const allowedMime = {};

  for (const _type of Object.keys(mimeTypes)) {
    allowedMime[mimeTypes[_type].mime] = mimeTypes[_type];
  }

  return allowedMime;
}

const stringTypesToArray = (types) => {
  const typeList = types.replace(/[\t\n\r\s :;|,]+/g, ' ').toLowerCase().trim().split(' ');

  return typeList.map((_type) => _type.trim());
}

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

export const resetPos = (file, index) => {
  file.pos = index;
  return file;
};

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
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const obj = {
    size: Math.round(parseFloat((bytes / (k ** i)))),
    full: `${parseFloat((bytes / (k ** i))).toFixed(dm)} ${sizes[i]}`,
    type: `${sizes[i]}`,
  };

  return obj;
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

/**
 * Get a unique file name for a possibly default file name
 *
 * If file was generated by iOS camera it will always have a file
 * name of "image.jpg". If the file has this name add a timestamp to
 * the file name to make it unique.
 *
 * @param {File} file File whose name needs to be made unique
 *
 * @returns {string} Unique file name
 */
export const getUniqueFileName = (fileName) => {
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
  const name = fileName.toLowerCase();

  if (genericNames.includes(name) === false) {
    // This is just a normal file with a normal file name
    return fileName;
  }

  // This is a known generic file name probably generated by an
  // iOS device camera. The device is clearly too stupid to give
  // the file a unique file name so we need to make the file name
  // unique.
  const bits = fileName.split('.', 2);

  return `${bits[0]}_${Date.now()}.${bits[1]}`;
};

export const getEventTypes = () => {
  return {
    'allcomplete': {
      dataType: 'boolean',
      description: 'Emitted when work on a single file is '
        + 'complete. Data will only be `TRUE` if there are no '
        + 'more files yet to complete processing.',
    },
    'complete': {
      dataType: 'AllCompleteEventData',
      description: 'Emitted when work on a single file is '
        + 'complete.',
    },
    'toomany': {
      dataType: 'ToomanyEventData',
      description: 'Emitted when work on a single file is '
        + 'complete but the total number of files selected is '
        + 'greater than allowed',
    },
    'toobig': {
      dataType: 'ToobigEventData',
      description: 'Emitted when work on a single file is '
        + 'complete but combined size of all the files is larger '
        + 'than allowed',
    },
    'oversize': {
      dataType: 'OversizeEventData',
      description: 'Emitted when work on a single file is '
        + 'complete but that file is larger than allowed for a '
        + 'single file',
    },
    'invalid': {
      dataType: 'InvalidEventData',
      description: 'Emitted when work on a single file is '
        + 'complete but the type of that file is not in the '
        + 'allowed list.',
    },
    'processing': {
      dataType: 'string',
      description: 'Emitted when work starts on file named in '
        + 'the data.',
    },
    'processcount': {
      dataType: 'number',
      description: 'Emitted when work starts on a batch of files',
    },
  }
};

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
    } else if (max > 256) {
      return max;
    } else {
      throw new Error(
        'getValidMaxSingleSize() expects only argument '
        + '`max` to be a number that is -1 (equivalent to infinite)'
        + ' or greater than 256.',
      );
    }
  } else if (t !== 'string')  {
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

  if (t !== 'string')  {
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
      return getValidSetBoolTrue;

    case 'defaultAllowed':
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

export const rewriteError = (msg) => msg.replace(
  'getValid',
  'FileSelectData.set',
);

export const rewriteConfigError = (msg) => {
  const bits = msg.match(/^([^ ]+) (.*)$/);
  let key = bits[1].replace(/^getValid([^\()]+)\(.*$/i, '$1');
  key = key.substring(0, 1).toLowerCase() + key.substring(1);

  let tail = bits[2].trim();
  tail = tail.substring(0, 1).toLowerCase() + tail.substring(1);

  return `FileSelectData constructor expects config.${key} to be `
    + `valid: ${tail}`;
};
