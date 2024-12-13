import { getValidJpegCompression, getValidMaxImgPx, getValidMaxSingleSize, overrideConfig } from "./file-select-utils";
import FileSelectDataFile from "./fileSelectDataFile.class";

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

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

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

  constructor (canvas, config = null) {
    if (canvas === null || (canvas instanceof HTMLCanvasElement) === false) {
      throw new Error(
        'FileSelectDataPhoton constructor expects third argument '
        + '`canvas` to be an instance of an HTML canvas '
        + 'element/DOM node.',
      )
    }

    this._canvas = canvas;

    try {
      this._setConfig(config);
    } catch (e) {
      throw Error(e.message);
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
   * @param {FileSelectDataFile} fileData
   * @returns {FileSelectDataFile}
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
   * @param {FileSelectDataFile} _fileData
   */
  async _processInner (_fileData) {
    throw new Error(
      'ImageProcessor._processInner() must be overridden by a sub '
      + 'class.',
    );
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit () {
  }

  /**
   *
   *
   * @param {FileSelectDataFile} fileData
   *
   * @returns {FileSelectDataFile}
   */
  async process (fileData) {
    if (typeof fileData.isImg === 'function' && fileData.isImg() === true) {
      // NOTE: _getResizeRatio() has the (potential) side effect of
      //       modifying `fileData` by causing fileData to add image
      //       height, width & format info to itself
      const resizeRatio = this._getResizeRatio(fileData);

      if (this._config.getGreyscale === true || (resizeRatio < 1 && resizeRatio > 0)) {
        return this._processInner(fileData, resizeRatio)
      }

      return fileData;
    } else {
      throw new Error(
        'ImageProcessor.process() could not process input',
      );
    }
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default ImageProcessor;
