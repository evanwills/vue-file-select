import { compileScript } from 'vue/compiler-sfc';
import { getValidJpegCompression, getValidMaxImgPx, getValidMaxSingleSize, overrideConfig } from './file-select-utils';
import { FileSelectCommunicatorLogging as FileSelectCommunicator} from './FileSelectCommunicatorLogging.class';
import FileSelectFileData from './FileSelectFileData.class';
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
  // START: Static getter & setter methods


  static canResize () {
    return getLocalValue('noResize', 0) != 1; // eslint-disable-line eqeqeq
  }

  static getGreyscale () { return this._greyscale; }
  static getJpegCompression () { return this._jpegCompression; }
  static getMaxImgPx () { return this._maxImgPx; }
  static getMaxSingleSize () { return this._maxSingleSize; }
  static getNoResize () { return this._noResize; }

  static setGreyscale (greyscale) {
    if (typeof greyscale === 'boolean') {
      this._greyscale = greyscale;
    }
  }

  static setJpegCompression (jpegCompression) {
    try {
      this._jpegCompression = getValidJpegCompression(jpegCompression);
    } catch (error) {
      throw Error(error.message);
    }
  }

  static setMaxImgPx (maxImgPx) {
    try {
      this._maxImgPx = getValidMaxImgPx(maxImgPx);
    } catch (error) {
      throw Error(error.message);
    }
  }

  static setMaxSingleSize (maxSingleSize) {
    try {
      this._maxSingleSize = getValidMaxSingleSize(maxSingleSize);
    } catch (error) {
      throw Error(error.message);
    }
  }

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Instance constructor

  constructor (canvas, config = null, comms = null) {
    if (typeof canvas === 'undefined' || canvas === null || (canvas instanceof HTMLCanvasElement) === false) {
      throw new Error(
        'ImageProcessor constructor expects first argument '
        + '`canvas` to be an instance of an HTML canvas '
        + 'element/DOM node.',
      )
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
  // START: Private methods

  _setConfig (config) {
    this._config = {
      greyScale: ImageProcessor._greyscale,
      jpegCompression: ImageProcessor._jpegCompression,
      maxImgPx: ImageProcessor._maxImgPx,
      maxSingleSize: ImageProcessor._maxSingleSize,
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
  async _getResizeRatio (fileData) {
    await fileData.setImageMetadata();

    if (fileData.format === 'portrait') {
      if (fileData.height() > this._config.maxImgPx) {
        return this._config.maxImgPx / fileData.height();
      }
    } else {
      // This works for both landscape and square format images.
      if (fileData.width() > this._config.maxImgPx) {
        return this._config.maxImgPx / fileData.width();
      }
    }

    return 1;
  }

  /**
   * Do custom image processing work on supplied image
   *
   * @param {FileSelectFileData} _fileData
   */
  async _processInner (_fileData) {
    throw new Error(
      'ImageProcessor._processInner() must be overridden by a sub '
      + 'class.',
    );
  }

  _dispatch (type, data) {
    if (this._comms !== null) {
      this._comms.dispatch(type, data, this._obj);
    }
  }

  async _getImgSrc (fileData) {

  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit () {
  }

  /**
   * Process image
   *
   * @param {FileSelectFileData} fileData
   *
   * @returns {FileSelectFileData}
   */
  async process (fileData) {
    if (fileData instanceof FileSelectFileData && fileData.isImg() === true) {
      // NOTE: _getResizeRatio() has the (potential) side effect of
      //       modifying `fileData` by causing fileData to add image
      //       height, width & format info to itself
      const resizeRatio = this._getResizeRatio(fileData);

      if (this._noResize === false
        && (fileData.tooLarge === true
        || this._config.getGreyscale === true
        || (resizeRatio < 1 && resizeRatio > 0))
      ) {
        this._dispatch('startimgpropcessing:', fileData);

        return this._processInner(fileData, resizeRatio)
      }

      return fileData;
    }

    return fileData;
  }

  noResize () { return this._noResize; }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default ImageProcessor;
