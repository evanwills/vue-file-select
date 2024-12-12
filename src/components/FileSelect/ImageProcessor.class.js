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

  _getImage (file) {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload(() => { resolve(img) });

      img.src = file;
    })
  }

  async _setAspectRatio (fileData) {
    const img = await this._getImage(fileData.file);
    let format = 0;

    if (img.height > img.width) {
      // portrait format
      format = 1;
    } else if (img.height < img.width) {
      // landscape format
      format = -1;
    }

    let ratio = 0;

    if (isPortrait === true) {
      if (img.height > this._config.maxImgPx) {
        ratio = this._config.maxImgPx / img.height;
      }
    } else {
      if (img.width > this._config.maxImgPx) {
        ratio = this._config.maxImgPx / img.width;
      }
    }

    fileData.height = img.height * ratio;
    fileData.ogHeight = img.height;
    fileData.width = img.width * ratio;
    fileData.ogWidth = img.width;
    fileData.ratio = ratio;
    fileData.format = format;

    return fileData;
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
      fileData = await this._setAspectRatio(fileData);
      return this._processInner(fileData);
    } else {
      throw new Error(
        'ImageProcessor.process() could not process input'
      );
    }
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default ImageProcessor;
