
import { nanoid } from 'nanoid';
import {
  getAllowedTypes,
  getUniqueFileName,
  getValidMaxSingleSize,
  isValidFileType,
  overrideConfig,
} from './file-select-utils';
import FileSelectDataImage from './fileSelectDataImage.class';

export class FileSelectDataFile {
  // ----------------------------------------------------------------
  // START: Define static properties

  static _defaultAllowed = [];
  static _maxSingleSize = 15728640;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _config;
  aspectRatio = null;
  ext;
  file;
  id = null;
  invalid = false;
  isSquare = null;
  isPortrait
  isImage;
  height = null;
  width = null;
  mime;
  name;
  ogHeight = null;
  ogName;
  ogWidth = null;
  ok = true;
  oversize;
  position = -1;
  previousName;
  processing = false;
  ratio = 0;

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  static defaultAllowed () { return this._defaultAllowed; }
  static greyscale () { return this._greyScale; }
  static jpegCompression () { return this._jpegCompression; }
  static maxImgPx () { return this._maxImgPx; }
  static maxSingleSize () { return this._maxSingleSize; }
  static noResize () { return FileSelectDataImage.noResize(); }

  static setGreyscale (greyscale) {
    if (typeof greyscale === 'boolean') {
      this._greyScale = greyscale;
    }

    if (typeof this._greyScale !== 'boolean') {
      this._greyScale = false;
    }
  }

  static setJpegCompression (value) {
    try {
      this._jpegCompression = getValidJpegCompression(value);
    } catch (e) {
      if (typeof this._jpegCompression !== 'number') {
        this._jpegCompression = 0.85;
      }

      throw Error(e.message);
    }
  }

  static setAllowedTypes (allowedTypes) {
    try {
      this._defaultAllowed = getAllowedTypes(allowedTypes);
    } catch (e) {
      throw Error(e.message);
    }
  }

  /**
   * Set the maximim pixel count in either direction an image can
   * be before it is resized
   *
   * @param {number} count
   *
   * @returns {void}
   */
  static setMaxImgPx (px) {
    try {
      this._maxImgPx = getValidMaxImgPx(px);
    } catch (e) {
      throw Error(rewriteError(e.message));
    }
  }

  /**
   * Set the maximum size allowed for a single file
   *
   * @param {string|number} max If string, number will be parsed as
   *                            a human readable file size.
   *                            If number and equal to -1 or greater
   *                            than 256, the value will be assumed
   *                            to be bytes and set.
   *
   * @returns {void}
   * @throws {Error} If `max` is a number that is not `-1` and less
   *                 than 256.
   *                 OR
   *                 If `max` not a string or the string could not be
   *                 parsed.
   */
  static setMaxSingleSize (max) {
    try {
      this._maxSingleSize = getValidMaxSingleSize(max);
    } catch (e) {
      throw new Error(rewriteError(e.message));
    }
  }

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Constructor method

  constructor (file, config = null) {
    this.id = nanoid(8);
    this.ext = file.name.replace(/^.*?\.([a-z\d]+)$/i, '');
    this.file = file;
    this.invalid = false;
    this.isImage = false;
    this.metadata = null;
    this.mime = file.type;
    this.name = getUniqueFileName(file.name);
    this.ogName = file.name;
    this.ok = true;
    this.position = -1;
    this.previousName = file.name;
    this.processing = false;
    this.size = file.size;

    this._setConfig(config);

    if (isValidFileType(file, this._config.defaultAllowed) === false) {
      this.invalid = true;
      this.ok = false;
    }

    if (this.isOversized() === true) {
      this.ok = false;
    }
  }

  //  END:  Constructor methods
  // ----------------------------------------------------------------
  // START: Private method


  _setConfig (config) {
    // Preset config with default values

    this._config = {
      defaultAllowed: FileSelectDataFile._defaultAllowed,
      maxSingleSize: FileSelectDataFile._maxSingleSize,
    };

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      throw Error(rewriteConfigError(error.message));
    }
  }

  _overrideDefaultConfig (config) {
    if (isObj(config) === false) {
      return false;
    }

    for (const key of Object.keys(this._config)) {
      if (typeof config[key] !== 'undefined') {
        const func = getRightConfigValidateFunc(key);

        try {
          this._config[key] = func(config[key]);
        } catch (e) {
          throw Error(rewriteConfigError(e));
        }
      }
    }

    return true;
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public getter & setter methods

  size () {
    return this.file.size;
  }

  lastModified () {
    return this.file.lastModifiedDate;
  }

  isOversized () {
    if (this.processing === true) {
      return false;
    }

    return (file.size > this._config.maxSingleSize);
  }

  isMatch (id, name) {
    return (this.id === id || this.name === name);
  }

  /**
   * @param {number} pos
   */
  set position (pos) {
    if (typeof pos === 'number' && number >= 0) {
      this.position = pos;
    }
  }

  /**
   * @param {boolean} ok
   */
  set ok (ok) {
    if (typeof ok === 'boolean') {
      this.ok = ok
    }
  }

  /**
   * @param {string} name
   */
  set name (name) {
    if (typeof name === 'string') {
      const tmp = name.trim();
      if (tmp !== '') {
        this.previousName = this.name;
        this.name = tmp;
      }
    }
  }

  /**
   * @param {string} mime
   */
  set mime (mime) {
    if (typeof mime === 'string') {
      this.mime = mime;
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public utility methods

  async process (imgProcessor = null) {
    if (this.isImage && imgProcessor !== null) {
      this.processing = true;

      await imgProcessor(this.file);

      this.processing = false;

      return true;
    }

    return false;
  }

  //  END:  Public utility methods
  // ----------------------------------------------------------------

}

export default FileSelectDataFile;
