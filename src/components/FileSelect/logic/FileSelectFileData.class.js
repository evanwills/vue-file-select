
import { nanoid } from 'nanoid';
import {
  getAllowedTypes,
  getFileExtension,
  getUniqueFileName,
  getValidMaxSingleSize,
  isValidFileType,
  overrideConfig,
  rewriteConfigError,
} from './file-select-utils';
import { fileIsImage, getImageMetadata } from './image-processor-utils';
import ImageProcessor from './ImageProcessor.class';
import FileSelectCommunicator from './FileSelectCommunicator.class';

export class FileSelectDataFile {
  // ----------------------------------------------------------------
  // START: Define static properties

  static #defaultAllowed = [];
  static #maxSingleSize = 15728640;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  ext;
  file;
  id = null;
  imgMeta = null;
  invalid = false;
  isImage = false;
  mime;
  name;
  ogName;
  ok = true;
  oversize;
  position = -1;
  previousName;
  processing = false;

  _config;
  /**
   * @property {ImageProcessor|null}
   */
  _comms = null;

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  static getDefaultAllowed () { return this.#defaultAllowed; }
  static getGreyscale () { return ImageProcessor.getGreyscale(); }
  static getJpegCompression () { return ImageProcessor.getJpegCompression(); }
  static getMaxImgPx () { return ImageProcessor.getMaxImgPx(); }
  static getMaxSingleSize () { return this.#maxSingleSize; }

  static setGreyscale (greyscale) { ImageProcessor.setGreyscale(greyscale); }

  static setJpegCompression (value) {
    try {
      ImageProcessor.setJpegCompression(value);
    } catch (e) {
      throw Error(e.message);
    }
  }

  static setAllowedTypes (allowedTypes) {
    try {
      this.#defaultAllowed = getAllowedTypes(allowedTypes);
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
      ImageProcessor.setMaxImgPx(px);
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
      this.#maxSingleSize = getValidMaxSingleSize(max);
    } catch (e) {
      throw new Error(rewriteError(e.message));
    }
  }

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Constructor method

  constructor (file, config = null, comms = null) {
    if (file instanceof File === false) {
      throw new Error(
        'FileSelectDataFile constructor expects first parameter to '
        + `be a File object. ${typeof file} given`,
      );
    }

    this.ext = getFileExtension(file);
    this.file = file;
    this.id = nanoid(8);
    this.invalid = false;
    this.isImage = fileIsImage(file);
    this.mime = file.type;
    this.name = getUniqueFileName(file.name);
    this.ogName = file.name;
    this.ok = true;
    this.position = -1;
    this.previousName = file.name;
    this.processing = false;
    this._comms = null;

    this._setConfig(config);

    this._setOK();

    if (comms !== null && comms instanceof FileSelectCommunicator === true) {
      this._comms = comms;
    }

    if (this.isImage && this.ok) {
      this.setImageMetadata();
    }
  }

  //  END:  Constructor methods
  // ----------------------------------------------------------------
  // START: Private method

  _dispatch (type, data) {
    if (this._comms !== null) {
      this._comms.dispatch(type, data);
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

  _setConfig (config) {
    // Preset config with default values

    this._config = {
      defaultAllowed: FileSelectDataFile.#defaultAllowed,
      maxSingleSize: FileSelectDataFile.#maxSingleSize,
      maxImgPx: ImageProcessor.getMaxImgPx(),
    };

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      throw Error(rewriteConfigError(error.message));
    }
  }

  _setOK () {
    if (isValidFileType(this.file, this._config.defaultAllowed) === false) {
      this.invalid = true;
      this.ok = false;
    } else if (this.tooHeavy() === true) {
      this.ok = false;
    }
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

  isImg () {
    return (this.isImage === true && this.invalid === false);
  }

  isMatch (id, name) {
    return (this.id === id || this.name === name);
  }

  tooHeavy () {
    if (this.processing === true) {
      return false;
    }

    return (this.file.size > this._config.maxSingleSize);
  }

  async tooLarge () {
    if (this.isImg()) {
      await this.setImageMetadata();

      const { height, width } = this.imgMeta;
      const { maxImgPx } = this._config

      return (height > maxImgPx || width > maxImgPx);
    }
    return this.tooHeavy();
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

  /**
   * @param {File} file
   */
  set file (file) {
    if (file instanceof File) {
      this.file = file;
      this.ext = getFileExtension(file);
      this.isImage = fileIsImage(file);
      this.mime = file.type;
      this._setOK();
    }
  }

  async height () {
    if (this.isImage) {
      await this.setImageMetadata();
      return this.imgMeta.height;
    }

    return 0;
  }

  async width () {
    if (this.isImage) {
      await this.setImageMetadata();
      return this.imgMeta.width;
    }

    return 0;
  }

  async ogHeight () {
    if (this.isImage) {
      await this.setImageMetadata();
      return this.imgMeta.ogHeight;
    }

    return 0;
  }

  async ogWidth () {
    if (this.isImage) {
      await this.setImageMetadata();
      return this.imgMeta.ogWidth;
    }

    return 0;
  }

  async setImageMetadata (force = false) {
    if (this.isImage === true && (this.imgMeta === null || force === true)) {
      const tmp = await getImageMetadata(this.file);

      this.imgMeta = {
        ...this.imgMeta,
        ...tmp,
      }

      if (force === false) {
        // Only set the original height & width the first time this
        // is called
        this.imgMeta.ogHeight = this.imgMeta.height
        this.imgMeta.ogWidth = this.imgMeta.width
      }

      this._dispatch('imagemetaset', this.imgMeta);
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public utility methods

  /**
   * Add another dispatcher function
   *
   * @param {Function} dispatcher A function that can be used as an
   *                              event handler
   * @param {string}   id         ID of the dispatcher (so it can be
   *                              replaced or removed)
   * @param {boolean}  replace    If a dispatcher already exists,
   *                              replace it with the new dispatcher
   *                              function
   *
   * @throws {Error} If dispatcher was not a function
   * @throws {Error} If id was not a string or was empty
   * @throws {Error} If a dispatcher with the same ID already exists
   *                 and `replace` is FALSE
   */
  addDispatcher (dispatcher, id, replace = false) {
    if (this._comms !== null) {
      try {
        this._comms.addDispatcher(dispatcher, id, replace);
      } catch (error) {
        throw Error(error.message);
      }
    }
  };

  /**
   * Remove a dispatcher function
   *
   * @param {string} id ID of the dispatcher function to be removed.
   *
   * @returns {boolean} TRUE if the dispatcher was removed.
   *                    FALSE otherwise
   */
  removeDispatcher (id) {
    return (this._comms !== null)
      ? this._comms.removeDispatcher(id)
      : false;
  }

  async process (imgProcessor = null) {
    console.group('FileSelectDataFile.process()');
    console.log('imgProcessor:', imgProcessor);
    console.log('this.isImg():', this.isImg());
    if (this.isImg() === true && imgProcessor !== null) {
      this.processing = true;

      await imgProcessor.process(this);

      this.processing = false;

      console.groupEnd();
      return true;
    }

    console.groupEnd();
    return false;
  }

  //  END:  Public utility methods
  // ----------------------------------------------------------------

}

export default FileSelectDataFile;
