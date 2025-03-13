import {
  getValidJpegCompression,
  getValidMaxImgPx,
  getValidMaxSingleSize,
  isFileDataObj,
  overrideConfig,
  rewriteConfigError,
} from './file-select-utils';
import { FileSelectCommunicator } from './FileSelectCommunicator.class';
import { getLocalValue } from '../../../utils/data-utils';

export class ImageProcessor {
  // ----------------------------------------------------------------
  // START: Define static properties

  static _greyscale = false;

  static _jpegCompression = 0.85;

  static _maxImgPx = 1500;

  static _maxSingleSize = 15728640;

  static _noResize = false;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _canvas = null;

  _config = null;

  _comms = null;

  _obj = 'ImageProcessor';

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Instance constructor

  constructor(canvas, config = null, comms = null) {
    if (typeof canvas === 'undefined' || canvas === null || (canvas instanceof HTMLCanvasElement) === false) {
      throw new Error(
        'ImageProcessor constructor expects first argument '
        + '`canvas` to be an instance of an HTML canvas '
        + 'element/DOM node.',
      );
    }

    this._canvas = canvas;
    this._obj = 'ImageProcessor';

    // Check whether image resizing is possible.
    this._noResize = ImageProcessor.canResize() === false;

    if (this._noResize === true) {
      // Looks like resizing is not possible so we'll send out a
      // message
      this._dispatch('noResize', true);
    }

    try {
      this._setConfig(config);
    } catch (e) {
      throw Error(e.message);
    }

    if (comms !== null) {
      if (comms instanceof FileSelectCommunicator) {
        this._comms = comms;
      }
    }
  }

  //  END:  Instance constructor
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  static canResize() {
    return getLocalValue('noResize', 0) != 1; // eslint-disable-line eqeqeq
  }

  static getGreyscale() { return this._greyscale; }

  static getJpegCompression() { return this._jpegCompression; }

  static getMaxImgPx() { return this._maxImgPx; }

  static getMaxSingleSize() { return this._maxSingleSize; }

  static getNoResize() { return this._noResize; }

  static setGreyscale(greyscale) {
    if (typeof greyscale === 'boolean') {
      this._greyscale = greyscale;
    }
  }

  static setJpegCompression(jpegCompression) {
    try {
      this._jpegCompression = getValidJpegCompression(jpegCompression);
    } catch (error) {
      throw Error(error.message);
    }
  }

  static setMaxImgPx(maxImgPx) {
    try {
      this._maxImgPx = getValidMaxImgPx(maxImgPx);
    } catch (error) {
      throw Error(error.message);
    }
  }

  static setMaxSingleSize(maxSingleSize) {
    try {
      this._maxSingleSize = getValidMaxSingleSize(maxSingleSize);
    } catch (error) {
      throw Error(error.message);
    }
  }

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Private methods

  _setConfig(config) {
    this._config = {
      greyScale: ImageProcessor._greyscale,
      jpegCompression: ImageProcessor._jpegCompression,
      maxImgPx: ImageProcessor._maxImgPx,
      maxSize: ImageProcessor._maxSingleSize,
    };

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      throw Error(rewriteConfigError(error.message));
    }
  }

  /**
   *
   * @param {FileSelectFileData} fileData
   * @returns {FileSelectFileData}
   */
  async _getResizeRatio(height, width) {
    const portrait = (height > width);

    if (portrait === true) {
      if (height > this._config.maxImgPx) {
        return (this._config.maxImgPx / height);
      }
    } else if (width > this._config.maxImgPx) {
      // This works for both landscape and square format images.
      return (this._config.maxImgPx / width);
    }

    return 1;
  }

  /**
   * Do custom image processing work on supplied image
   *
   * @param {FileSelectFileData} _fileData
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async _processInner(_fileData) {
    // this is a placeholder method for child image processor classes
    throw new Error(
      'ImageProcessor._processInner() must be overridden by a sub '
      + 'class.',
    );
  }

  _dispatch(type, data) {
    if (this._comms !== null) {
      this._comms.dispatch(type, data, this._obj);
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit() { // eslint-disable-line class-methods-use-this
    // this is a placeholder method for child image processor classes
  }

  /**
   * Process image
   *
   * @param {File} file
   * @param {number} height
   * @param {number} width
   *
   * @returns {Promise<{File|null}>}
   */
  async process(file, height, width) {
    if (this._noResize === false
      && file instanceof File
      && file.type.startsWith('image')
      && file.type !== 'image/svg+xml'
    ) {
      const resizeRatio = this._getResizeRatio(height, width);

      if (file.size > this._config.maxSize
        || this._config.greyScale === true
        || (resizeRatio > 0 && resizeRatio < 1)
      ) {
        return this._processInner(fileData, resizeRatio);
      }
    }

    return Promise.resolve(null);
  }

  noResize() { return this._noResize; }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default ImageProcessor;
